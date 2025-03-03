import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, Platform } from 'react-native';
import { CardField, useStripe, PaymentIntent } from '@stripe/stripe-react-native';
import { PAYMENT_API_URL } from '../config/stripe';

interface StripePaymentProps {
  amount: number;
  onSuccess: (result: PaymentIntent) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

// Local development server URL - use your computer's IP address (not localhost)
// Localhost doesn't work when testing on physical devices or most emulators
// Replace 192.168.1.X with your actual local IP address
const LOCAL_API_URL = 'http://192.168.253.171:3000/api/create-payment-intent';

// Use the appropriate URL based on environment
const getApiUrl = () => {
  if (__DEV__) {
    return LOCAL_API_URL; // Use local server during development
  }
  return PAYMENT_API_URL; // Use production URL in production
};

export default function StripePayment({ amount, onSuccess, onError, onCancel }: StripePaymentProps) {
  const { confirmPayment, createPaymentMethod } = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseDebug, setResponseDebug] = useState<string | null>(null);

  // Create a payment intent when the component loads
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        
        // Get appropriate API URL
        const apiUrl = getApiUrl();
        console.log(`Calling payment API at: ${apiUrl}`);
        
        // Prepare payload - correctly formatted amount
        const payload = {
          amount: Math.round(amount * 100), 
          currency: 'usd',
        };
        console.log(`Request payload:`, payload);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        // Log the status and headers
        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify([...response.headers.entries()]));

        // Debug the raw response
        const responseText = await response.text();
        console.log('Raw API response:', responseText);
        setResponseDebug(responseText);
        
        // Only try to parse if we have a successful response
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
          // Handle non-200 responses better
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Processing payment...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {errorMessage}</Text>
        {responseDebug && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Server Response:</Text>
            <Text style={styles.debugText}>{responseDebug.substring(0, 300)}...</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <Text style={styles.button} onPress={onCancel}>Cancel</Text>
          <Text style={styles.button} onPress={() => fetchPaymentIntent()}>Retry</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Card Details</Text>
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
      <Text style={styles.cancelText} onPress={onCancel}>Cancel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    height: 50,
    width: '100%',
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
    width: '100%',
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
    width: '100%',
  },
  button: {
    padding: 10,
    backgroundColor: '#8B0000',
    color: 'white',
    borderRadius: 5,
    textAlign: 'center',
    width: '40%',
  },
  cancelText: {
    marginTop: 20,
    color: '#8B0000',
    fontSize: 16,
  },
});