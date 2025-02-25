import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CardField, useStripe, PaymentIntent } from '@stripe/stripe-react-native';
import { PAYMENT_API_URL } from '../config/stripe';

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

  // Create a payment intent when the component loads
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await fetch(PAYMENT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to cents for Stripe
            currency: 'usd',
          }),
        });

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        Alert.alert('Error', 'Failed to create payment intent');
        onError(error instanceof Error ? error : new Error('Payment intent creation failed'));
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
});