import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, TextInput, Image } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useCart } from './cartcontext';
import { useAuth } from '../auth/authContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type PaymentMethod = 'stripe' | 'venmo' | 'cashapp' | 'paypal' | 'zelle' | null;

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth(); // Get user info from auth context
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Auto-fill form with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.defaultAddress || '',
      });
    }
  }, [user]);

  const paymentMethods = [
    { id: 'stripe', name: 'Pay with Card', icon: 'card', color: '#8B0000' },
    { id: 'venmo', name: 'Pay with Venmo', icon: 'logo-venmo', color: '#008CFF' },
    { id: 'cashapp', name: 'Pay with Cash App', icon: 'cash', color: '#00D632' },
    { id: 'paypal', name: 'Pay with PayPal', icon: 'logo-paypal', color: '#003087' },
    { id: 'zelle', name: 'Pay with Zelle', icon: 'swap-horizontal', color: '#6B1FF3' }
  ];

  const DELIVERY_FEE = 10;
  const TAX_RATE = 0.08;
  const subtotal = getTotalPrice();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  const handleSubmit = () => {
    if (!selectedPayment) {
      Toast.show({
        type: 'error',
        text1: 'Please select a payment method',
      });
      return;
    }
  
    if (!form.name || !form.email || !form.phone || !form.address) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all contact information',
      });
      return;
    }
  
    const orderDetails = {
      items,
      subtotal,
      tax,
      deliveryFee: DELIVERY_FEE,
      total,
      shippingInfo: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address
      }
    };
  
    // Always navigate to payment confirmation first
    router.push({
      pathname: '/menu/paymentconfirm',
      params: {
        paymentMethod: selectedPayment,
        orderDetails: JSON.stringify(orderDetails)
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          
          <View style={styles.costs}>
            <View style={styles.costRow}>
              <Text>Subtotal</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text>Tax</Text>
              <Text>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text>Delivery Fee</Text>
              <Text>${DELIVERY_FEE.toFixed(2)}</Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {user && (
              <Text style={styles.autofillNote}>Auto-filled from your account</Text>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
          />
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Delivery Address"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
        </View>

        <View style={styles.section}>
         <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map((method) => (
        <TouchableOpacity 
            key={method.id}
            style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.selectedPayment
            ]}
            onPress={() => setSelectedPayment(method.id as PaymentMethod)}
            >
            <Ionicons name={method.icon as keyof typeof Ionicons.glyphMap} size={24} color={method.color} />
            <Text style={styles.paymentText}>{method.name}</Text>
            {selectedPayment === method.id && (
                <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color="#8B0000" 
                style={styles.checkmark}
                />
            )}
        </TouchableOpacity>
            ))}
        </View>
        
        <View style={styles.orderButton}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#8B0000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  autofillNote: {
    fontSize: 12,
    color: '#8B0000',
    fontStyle: 'italic',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemQuantity: {
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  costs: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  addressInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  checkmark: {
    position: 'absolute',
    right: 15,
  },
  selectedPayment: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  paymentText: {
    position: 'absolute',
    marginLeft: 50,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30, 
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  orderButton: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 10,
  },
  backButton: {
    padding: 5,
  }
});