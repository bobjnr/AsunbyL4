const API_URL = 'http://192.168.198.171:3000'; 

export const BRAINTREE_CONFIG = {
  tokenizationEndpoint: `${API_URL}/api/braintree/client-token`,
  paymentEndpoint: `${API_URL}/api/braintree/process-payment`,
};