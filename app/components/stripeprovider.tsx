import React, { ReactNode } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '../config/stripe';

interface StripeProviderWrapperProps {
  children: ReactNode;
}

export default function StripeProviderWrapper({ children }: StripeProviderWrapperProps) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.yourcompany.yourapp" // Only needed for Apple Pay
    >
      {children}
    </StripeProvider>
  );
}