import axios from 'axios';
import { EXPO_PUBLIC_API_URL } from '@env';

const api = axios.create({
  baseURL: EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const braintreeApi = {
  getClientToken: async () => {
    try {
      console.log('Requesting token from:', `${api.defaults.baseURL}/api/braintree/client-token`);
      const response = await api.get('/api/braintree/client-token');
      console.log('Token response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting client token:', {
        message: (error as any).message,
        config: (error as any).config,
        response: (error as any).response
      });
      throw error;
    }
  },

  processPayment: async (paymentMethodNonce: string, amount: number) => {
    try {
      const response = await api.post('/api/braintree/process-payment', {
        paymentMethodNonce,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },
};