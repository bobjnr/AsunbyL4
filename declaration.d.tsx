declare module '@env' {
    export const EXPO_PUBLIC_API_URL: string;
  }

  declare module 'react-native-braintree-dropin-ui' {
    interface DropInResult {
      nonce: string;
      type: string;
      description: string;
    }
  
    interface DropInOptions {
      clientToken: string;
      merchantIdentifier?: string;
      countryCode?: string;
      currencyCode?: string;
      googlePayEnabled?: boolean;
      venmoEnabled?: boolean;
      paypalEnabled?: boolean;
      cardEnabled?: boolean;
      merchantName?: string;
      orderTotal?: string;
    }
  
    export default class BraintreeDropIn {
      static show(options: DropInOptions): Promise<DropInResult>;
    }
  }
  