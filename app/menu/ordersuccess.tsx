import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCart } from './cartcontext';

export default function OrderSuccess() {
  const { clearCart } = useCart();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const amount = params.amount as string;

  // Clear the cart when the success screen loads
  useEffect(() => {
    clearCart();
  }, []);

  const handleGoHome = () => {
    router.replace('/menu');
  };

  const handleViewOrders = () => {
    router.replace('/menu/orders');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#8B0000" />
        </View>
        
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>Thank you for your order</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{orderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>${parseFloat(amount).toFixed(2)}</Text>
          </View>
        </View>
        
        <Text style={styles.message}>
          We've received your order and will begin processing it right away. 
          You'll receive a confirmation email shortly with your order details.
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleGoHome}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleViewOrders}
          >
            <Text style={styles.secondaryButtonText}>View My Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#8B0000',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#333',
  },
  detailsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#8B0000',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  secondaryButtonText: {
    color: '#8B0000',
    fontSize: 18,
    fontWeight: '600',
  },
});