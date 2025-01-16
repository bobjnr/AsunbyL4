import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function ZellePayment() {
  const router = useRouter();
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPayment = async () => {
    if (!transactionId) {
      Toast.show({
        type: 'error',
        text1: 'Transaction ID is required',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate sending transaction ID to the backend for verification
      await fetch('https://192.168.56.171:5000/verify-zelle-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      Toast.show({
        type: 'success',
        text1: 'Payment confirmed successfully!',
      });
      router.push('/menu/orderconfirm'); // Redirect to order confirmation page
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to confirm payment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pay with Zelle</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructions}>
          Send your payment to the following Zelle account:
        </Text>
        <View style={styles.zelleDetails}>
          <Text style={styles.detailLabel}>Name:</Text>
          <Text style={styles.detailValue}>John Doe</Text>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>johndoe@example.com</Text>
        </View>

        <Text style={styles.instructions}>
          After sending the payment, enter the Zelle transaction ID below to
          confirm your payment.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Transaction ID"
          value={transactionId}
          onChangeText={setTransactionId}
        />

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
          disabled={isSubmitting}
        >
          <Text style={styles.confirmButtonText}>
            {isSubmitting ? 'Submitting...' : 'Confirm Payment'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B1FF3',
  },
  content: {
    flex: 1,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 15,
  },
  zelleDetails: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#6B1FF3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
