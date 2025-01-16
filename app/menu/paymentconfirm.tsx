import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//import PayPalWebView from '../components/paypalwebview';
import BraintreePayment from '../components/braintreepayment';

type PaymentMethod = 'stripe' | 'venmo' | 'cashapp' | 'paypal' | 'zelle';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

interface OrderDetails {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export default function PaymentConfirmation() {
  const params = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(params.paymentMethod as PaymentMethod);
  //const [showPayPalWebView, setShowPayPalWebView] = useState(false);
  const [showBraintree, setShowBraintree] = useState(false);

  useEffect(() => {
    if (params.orderDetails) {
      setOrderDetails(JSON.parse(params.orderDetails as string));
    }
  }, [params]);

  const getPaymentIcon = (method: PaymentMethod) => {
    const icons = {
      stripe: 'card',
      venmo: 'logo-venmo',
      cashapp: 'cash',
      paypal: 'logo-paypal',
      zelle: 'swap-horizontal'
    };
    return icons[method] || 'card';
  };

  const getPaymentColor = (method: PaymentMethod) => {
    const colors = {
      stripe: '#8B0000',
      venmo: '#008CFF',
      cashapp: '#00D632',
      paypal: '#003087',
      zelle: '#6B1FF3'
    };
    return colors[method] || '#8B0000';
  };

  const getPaymentName = (method: PaymentMethod) => {
    const names = {
      stripe: 'Pay with Card',
      venmo: 'Pay with Venmo',
      cashapp: 'Pay with Cash App',
      paypal: 'Pay with PayPal',
      zelle: 'Pay with Zelle'
    };
    return names[method] || '';
  };

  const handlePayment = () => {
    if (['stripe', 'venmo', 'paypal', 'cashapp'].includes(selectedPayment)) {
      setShowBraintree(true);
    } else if (selectedPayment === 'zelle') {
      router.push('/menu/zellepayment');
    }
  };

  const handlePaymentSuccess = async (nonce: string) => {
    setShowBraintree(false);
    try {
      // Here you would send the nonce to your backend
      // const response = await api.post('/process-payment', { nonce, amount: orderDetails.total });
      router.push('/order-success');
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment.');
    }
  };

  const handlePaymentCancel = () => {
    setShowBraintree(false);
    Alert.alert('Payment Cancelled', 'You have cancelled the payment process.');
  };

  const handlePaymentError = (error: any) => {
    setShowBraintree(false);
    Alert.alert('Payment Error', 'There was a problem processing your payment.');
  };



  return (
    <SafeAreaView style={styles.container}>
      {showBraintree && (
        <BraintreePayment
          amount={orderDetails?.total || 0}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )} 
        <>
          <View style={styles.header}>
            <TouchableOpacity 
             style={styles.backButton}
            onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.orderSummary}>
              <Text style={styles.title}>Order Summary</Text>
              <View style={styles.costRow}>
                <Text>Subtotal</Text>
                <Text>${orderDetails?.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>Tax</Text>
                <Text>${orderDetails?.tax.toFixed(2)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text>Delivery Fee</Text>
                <Text>${orderDetails?.deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.costRow, styles.totalRow]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>${orderDetails?.total.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.paymentMethod}>
              <Text style={styles.title}>Payment Method</Text>
              <TouchableOpacity 
                style={styles.selectedMethod}
                onPress={() => router.push('/payment-methods')}
              >
                <Ionicons 
                  name={getPaymentIcon(selectedPayment) as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color={getPaymentColor(selectedPayment)} 
                />
                <Text style={styles.methodText}>{getPaymentName(selectedPayment)}</Text>
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.payButton}
              onPress={handlePayment}
            >
              <Text style={styles.payButtonText}>
                Pay ${orderDetails?.total.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderSummary: {
    marginBottom: 30,
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
  paymentMethod: {
    marginBottom: 30,
  },
  selectedMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  methodText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  payButton: {
    backgroundColor: '#8B0000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});