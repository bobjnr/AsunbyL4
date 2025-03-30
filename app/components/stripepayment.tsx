import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Platform, Modal, TouchableOpacity } from 'react-native';
import { CardField, useStripe, PaymentIntent } from '@stripe/stripe-react-native';
import { PAYMENT_API_URL } from '../config/stripe';
import { Ionicons } from '@expo/vector-icons';

interface StripePaymentProps {
  amount: number;
  onSuccess: (result: PaymentIntent) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export default function StripePayment({ amount, onSuccess, onError, onCancel }: StripePaymentProps) {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseDebug, setResponseDebug] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        
        console.log(`Calling payment API at: ${PAYMENT_API_URL}`);
        
        const payload = {
          amount: Math.round(amount * 100), 
          currency: 'usd',
        };
        console.log(`Request payload:`, payload);
        
        const response = await fetch(PAYMENT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify([...response.headers.entries()]));

        const responseText = await response.text();
        console.log('Raw API response:', responseText);
        setResponseDebug(responseText);
        
        if (response.ok) {
          try {
            const responseData = JSON.parse(responseText);
            if (responseData.clientSecret) {
              setClientSecret(responseData.clientSecret);
              setErrorMessage(null);
            } else {
              setErrorMessage('No client secret in response');
              console.error('No client secret in response:', responseData);
            }
          } catch (parseError) {
            setErrorMessage(`Failed to parse response: ${parseError.message}`);
            console.error('Failed to parse response:', parseError);
            onError(new Error(`Parse error: ${parseError.message}`));
          }
        } else {
          setErrorMessage(`API Error: ${response.status} - ${responseText.substring(0, 100)}...`);
          console.error('API error:', response.status, responseText);
          onError(new Error(`API error: ${response.status}`));
        }
      } catch (error) {
        setErrorMessage(`Request failed: ${error.message}`);
        console.error('Request failed:', error);
        onError(new Error(`Request failed: ${error.message}`));
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [amount]);

  const handlePayment = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'Payment not ready yet');
      return;
    }

    try {
      setLoading(true);
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Error', error.message);
        onError(new Error(error.message));
      } else if (paymentIntent) {
        onSuccess(paymentIntent);
      }
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
      onError(error instanceof Error ? error : new Error('Payment confirmation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B0000" />
              <Text style={styles.loadingText}>Processing payment...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {errorMessage}</Text>
              {responseDebug && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Server Response:</Text>
                  <Text style={styles.debugText}>{responseDebug.substring(0, 300)}...</Text>
                </View>
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => fetchPaymentIntent()}>
                  <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.paymentContainer}>
              <Text style={styles.amount}>Amount: ${(amount).toFixed(2)}</Text>
              <CardField
                postalCodeEnabled={true}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={styles.card}
                style={styles.cardContainer}
                onCardChange={(cardDetails) => {
                  if (cardDetails.complete) {
                    handlePayment();
                  }
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 20,
  },
  paymentContainer: {
    padding: 20,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#8B0000',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 8,
    width: '40%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  }
});