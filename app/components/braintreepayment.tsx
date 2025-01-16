import React, { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-native';
import WebView from 'react-native-webview';
import { braintreeApi } from '../services/api';

interface BraintreePaymentProps {
  amount: number;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const BraintreePayment: React.FC<BraintreePaymentProps> = ({
  amount,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(true);

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
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', data);

      if (data.type === 'success') {
        console.log('Processing payment with nonce:', data.nonce);
        const paymentResult = await braintreeApi.processPayment(data.nonce, amount);
        console.log('Payment result:', paymentResult);
        setShowWebView(false);
        onSuccess(paymentResult);
      } else if (data.type === 'cancel') {
        setShowWebView(false);
        onCancel();
      } else if (data.type === 'error') {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
      setShowWebView(false);
      onError(error);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://js.braintreegateway.com/web/dropin/1.33.7/js/dropin.min.js"></script>
        <style>
          body { margin: 0; padding: 16px; font-family: -apple-system, sans-serif; }
          #dropin-container { min-height: 400px; }
        </style>
      </head>
      <body>
        <div id="dropin-container"></div>
        <script>
          braintree.dropin.create({
            authorization: '${clientToken}',
            container: '#dropin-container',
            paypal: { flow: 'checkout' },
            venmo: true,
          }, (error, dropinInstance) => {
            if (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'error', 
                error: error.message 
              }));
              return;
            }

            dropinInstance.on('paymentMethodRequestable', () => {
              dropinInstance.requestPaymentMethod((error, payload) => {
                if (error) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'error', 
                    error: error.message 
                  }));
                  return;
                }
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'success', 
                  nonce: payload.nonce 
                }));
              });
            });

            dropinInstance.on('noPaymentMethodRequestable', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'cancel' 
              }));
            });
          });
        </script>
      </body>
    </html>
  `;

  if (!clientToken || !showWebView) return null;

  return (
    <Modal visible={showWebView} animationType="slide">
      <WebView
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={{ flex: 1 }}
      />
    </Modal>
  );
};

export default BraintreePayment;