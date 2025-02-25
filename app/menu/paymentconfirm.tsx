import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StripePayment from '../components/stripepayment';
import { PaymentIntent } from '@stripe/stripe-react-native';

// Payment Method Modal Component
interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: string) => void;
  currentMethod: string;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ visible, onClose, onSelect, currentMethod }) => {
  const paymentMethods = [
    { id: 'stripe', name: 'Credit/Debit Card', icon: 'card', color: '#8B0000' },
    { id: 'venmo', name: 'Pay with Venmo', icon: 'logo-venmo', color: '#008CFF' },
    { id: 'paypal', name: 'Pay with PayPal', icon: 'logo-paypal', color: '#003087' },
    { id: 'cashapp', name: 'Pay with Cash App', icon: 'cash', color: '#00D632' },
    { id: 'zelle', name: 'Pay with Zelle', icon: 'swap-horizontal', color: '#6B1FF3' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  currentMethod === method.id && styles.selectedMethod
                ]}
                onPress={() => onSelect(method.id)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={method.color}
                  style={styles.methodIcon}
                />
                <Text style={styles.methodText}>{method.name}</Text>
                {currentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color={method.color} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const PaymentConfirmation = () => {
  const params = useLocalSearchParams();
  interface OrderDetails {
    shippingInfo: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
  }
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>(Array.isArray(params.paymentMethod) ? params.paymentMethod[0] : params.paymentMethod);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethodChanged, setPaymentMethodChanged] = useState(false);

  useEffect(() => {
    if (params.orderDetails) {
      if (typeof params.orderDetails === 'string') {
        setOrderDetails(JSON.parse(params.orderDetails));
      }
    }
  }, [params.orderDetails]);

  // Reset payment method changed flag when Stripe UI is closed
  useEffect(() => {
    if (!showStripePayment) {
      setPaymentMethodChanged(false);
    }
  }, [showStripePayment]);

  const getPaymentMethodDetails = (method: string) => {
    return {
      stripe: {
        name: 'Credit/Debit Card',
        icon: 'card',
        color: '#8B0000',
        logo: '💳'
      },
      venmo: {
        name: 'Pay with Venmo',
        icon: 'logo-venmo',
        color: '#008CFF',
        logo: 'V'
      },
      cashapp: {
        name: 'Pay with Cash App',
        icon: 'cash',
        color: '#00D632',
        logo: '$'
      },
      paypal: {
        name: 'Pay with PayPal',
        icon: 'logo-paypal',
        color: '#003087',
        logo: 'P'
      },
      zelle: {
        name: 'Pay with Zelle',
        icon: 'swap-horizontal',
        color: '#6B1FF3',
        logo: 'Z'
      }
    }[method] || { name: 'Select Payment', icon: 'card', color: '#666', logo: '?' };
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPayment(method);
    setPaymentMethodChanged(true);
    setShowPaymentModal(false);
    
    // If Stripe payment is showing, close it so it can reinitialize with the new payment method
    if (showStripePayment) {
      setShowStripePayment(false);
    }
  };

  const handlePayment = () => {
    if (selectedPayment === 'cashapp') {
      Alert.alert(
        'Payment Method Not Available',
        'Cash App payment is not available at this time. Please select a different payment method.',
        [{ text: 'OK', onPress: () => setShowPaymentModal(true) }]
      );
      return;
    }
  
    if (selectedPayment === 'zelle') {
      router.push('/menu/zellepayment');
      return;
    }
  
    if (selectedPayment === 'stripe') {
      setShowStripePayment(true);
      return;
    }
    
    // Handle other payment methods
    Alert.alert(
      'Payment Method Not Available',
      `${getPaymentMethodDetails(selectedPayment).name} is not available at this time. Please select a different payment method.`,
      [{ text: 'OK', onPress: () => setShowPaymentModal(true) }]
    );
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
    router.push({
      pathname: '/menu/checkout',
      params: {
        editingAddress: 'true',
        currentAddress: JSON.stringify(orderDetails?.shippingInfo)
      }
    });
  };

  const handlePaymentSuccess = (result: PaymentIntent) => {
    console.log('Payment successful:', result);
    setShowStripePayment(false);
    
    // Navigate to success page or show success message
    router.push({
      pathname: '/menu/ordersuccess',
      params: {
        orderId: result.id,
        amount: orderDetails?.total.toString() || '0'
      }
    });
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment failed:', error);
    setShowStripePayment(false);
    Alert.alert('Payment Failed', error.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showStripePayment && (
        <StripePayment
          amount={orderDetails?.total || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={() => setShowStripePayment(false)}
        />
      )}

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={handleEditAddress}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{orderDetails?.shippingInfo?.name}</Text>
            <Text style={styles.addressText}>{orderDetails?.shippingInfo?.address}</Text>
            <Text style={styles.addressText}>{orderDetails?.shippingInfo?.phone}</Text>
            <Text style={styles.addressText}>{orderDetails?.shippingInfo?.email}</Text>
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.costRow}>
            <Text>Subtotal</Text>
            <Text>${orderDetails?.subtotal?.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text>Tax</Text>
            <Text>${orderDetails?.tax?.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text>Delivery Fee</Text>
            <Text>${orderDetails?.deliveryFee?.toFixed(2)}</Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>${orderDetails?.total?.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity 
            style={styles.paymentMethodCard}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={styles.paymentMethodContent}>
              <View style={[styles.paymentLogo, { backgroundColor: getPaymentMethodDetails(selectedPayment).color }]}>
                <Text style={styles.paymentLogoText}>
                  {getPaymentMethodDetails(selectedPayment).logo}
                </Text>
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentName}>
                  {getPaymentMethodDetails(selectedPayment).name}
                </Text>
                <Text style={styles.paymentSubtext}>
                  Tap to change payment method
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>
            Pay ${orderDetails?.total?.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelect={handlePaymentMethodSelect}
        currentMethod={selectedPayment}
      />
    </SafeAreaView>
  );
};

// Use the same styles from your original file
const styles = StyleSheet.create({
  // Your existing styles...
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#8B0000',
  },
  headerTitle: {
    fontSize: 20,
    marginTop: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    marginTop: 30,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: '500',
  },
  addressCard: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
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
  paymentMethodCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentLogoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  payButton: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  methodsList: {
    padding: 16,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  selectedMethod: {
    borderColor: '#8B0000',
    backgroundColor: '#FFF5F5',
  },
  methodIcon: {
    marginRight: 12,
  },
  methodText: {
    flex: 1,
    fontSize: 16,
  },
});

export default PaymentConfirmation;