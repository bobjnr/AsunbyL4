import React, { useEffect, useState } from 'react';
import { Alert, Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import WebView from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { braintreeApi } from '../services/api';

interface BraintreePaymentProps {
  amount: number;
  paymentMethod: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const BraintreePayment: React.FC<BraintreePaymentProps> = ({
  amount,
  paymentMethod,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchClientToken();
  }, []);

  const fetchClientToken = async () => {
    try {
      console.log('Fetching client token...');
      const token = await braintreeApi.getClientToken();
      console.log('Client token received:', token);
      setClientToken(token);
    } catch (error) {
      console.error('Error in fetchClientToken:', error);
      onError(error);
      Alert.alert('Error', 'Unable to initialize payment system');
    }
  };

  const handleMessage = async (event: any) => {
    if (isProcessing) return;
    
    try {
      console.log('Raw message received:', event.nativeEvent.data);
      
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (parseError) {
        console.error('Failed to parse message:', parseError);
        Alert.alert('Error', 'Invalid payment response');
        return;
      }

      if (data.type === 'success' && data.nonce) {
        setIsProcessing(true);
        
        try {
          const paymentResult = await braintreeApi.processPayment(data.nonce, amount);
          setShowWebView(false);
          onSuccess(paymentResult);
        } catch (paymentError: any) {
          Alert.alert('Payment Error', paymentError.message || 'Payment processing failed');
          onError(paymentError);
        } finally {
          setIsProcessing(false);
        }
      } else if (data.type === 'error') {
        Alert.alert('Error', data.error || 'Payment setup failed');
        onError(new Error(data.error));
      }
    } catch (error: any) {
      console.error('Message handling error:', error);
      Alert.alert('Error', 'Payment processing failed');
      onError(error);
    }
  };

  // Configure payment method specific options
  const getPaymentMethodConfig = () => {
    const config: any = {
      authorization: clientToken,
      container: '#dropin-container',
    };

    // Set specific configurations based on payment method
    switch (paymentMethod) {
      case 'paypal':
        config.paypal = {
          flow: 'checkout',
          amount: amount,
          currency: 'USD'
        };
        config.card = { allowed: false };
        config.venmo = { allowed: false };
        break;
      case 'venmo':
        config.venmo = {
          allowDesktop: true,
          paymentMethodUsage: 'multi_use'
        };
        config.card = { allowed: false };
        config.paypal = { allowed: false };
        break;
      case 'stripe':
        config.card = {
          overrides: {
            fields: {
              number: { placeholder: 'Card Number' },
              expirationDate: { placeholder: 'MM/YY' },
              cvv: { placeholder: 'CVV' }
            }
          }
        };
        config.paypal = { allowed: false };
        config.venmo = { allowed: false };
        break;
    }

    return config;
  };

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <script src="https://js.braintreegateway.com/web/dropin/1.44.0/js/dropin.min.js"></script>
    <style>
      body { margin: 0; padding: 16px; font-family: -apple-system, sans-serif; }
      #dropin-container { min-height: 300px; }
      #submit-button {
        width: 100%;
        padding: 12px;
        margin-top: 20px;
        background-color: #2ecc71;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
      }
      #submit-button:disabled {
        background-color: #ccc;
      }
    </style>
  </head>
  <body>
    <div id="dropin-container"></div>
    <button id="submit-button" disabled>Complete Payment</button>

    <script>
      const MESSAGE_TIMEOUT = 500;
      let dropinInstance = null;
      let messageAttempts = 0;
      const MAX_MESSAGE_ATTEMPTS = 3;

      function sendMessage(data) {
        if (messageAttempts >= MAX_MESSAGE_ATTEMPTS) return;
        
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
          messageAttempts++;
          
          if (messageAttempts < MAX_MESSAGE_ATTEMPTS) {
            setTimeout(() => sendMessage(data), MESSAGE_TIMEOUT);
          }
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }

      // Initialize Braintree with payment method specific configuration
      braintree.dropin.create(${JSON.stringify(getPaymentMethodConfig())}).then(function(instance) {
        dropinInstance = instance;
        const submitButton = document.getElementById('submit-button');
        submitButton.style.display = 'block';
        
        instance.on('paymentMethodRequestable', function(event) {
          submitButton.disabled = false;
        });

        instance.on('noPaymentMethodRequestable', function() {
          submitButton.disabled = true;
        });

        submitButton.addEventListener('click', function(event) {
          event.preventDefault();
          submitButton.disabled = true;
          
          dropinInstance.requestPaymentMethod()
            .then(function(payload) {
              messageAttempts = 0;
              sendMessage({
                type: 'success',
                nonce: payload.nonce,
                paymentType: payload.type
              });
            })
            .catch(function(error) {
              submitButton.disabled = false;
              sendMessage({
                type: 'error',
                error: error.message
              });
            });
        });
      }).catch(function(error) {
        sendMessage({
          type: 'error',
          error: 'Failed to initialize payment form: ' + error.message
        });
      });
    </script>
  </body>
</html>
`;

  if (!clientToken || !showWebView) return null;

  return (
    <Modal visible={showWebView} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setShowWebView(false);
              onCancel();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {paymentMethod === 'stripe' ? 'Card Payment' : 
             paymentMethod === 'paypal' ? 'PayPal Checkout' : 
             'Venmo Payment'}
          </Text>
        </View>

        <View style={styles.webViewContainer}>
          <WebView
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            style={styles.webView}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text>Loading payment system...</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BraintreePayment;