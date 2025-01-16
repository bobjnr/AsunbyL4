const API_URL = 'http://192.168.17.171:3000'; // Use your actual server URL

export const BRAINTREE_CONFIG = {
  tokenizationEndpoint: `${API_URL}/api/braintree/client-token`,
  paymentEndpoint: `${API_URL}/api/braintree/process-payment`,
};