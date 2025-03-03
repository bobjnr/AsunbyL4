// import axios from 'axios';

// const API_URL = 'http://192.168.198.171:3000';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const braintreeApi = {
//   getClientToken: async () => {
//     try {
//       console.log('Requesting token from:', `${API_URL}/api/braintree/client-token`);
//       const response = await api.get('/api/braintree/client-token');
//       console.log('Token response:', response.data);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error getting client token:', {
//         message: error.message,
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data,
//         config: error.config
//       });
//       throw error;
//     }
//   },

//   processPayment: async (paymentMethodNonce: string, amount: number) => {
//     try {
//       console.log('Processing payment:', { nonce: paymentMethodNonce, amount });
//       const response = await api.post('/api/payment/process', {
//         paymentMethodNonce,
//         amount,
//         paymentMethod: 'card'
//       });
//       console.log('Payment response:', response.data);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error processing payment:', {
//         message: error.message,
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data,
//       });
//       throw error;
//     }
//   },
// };