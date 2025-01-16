import React from 'react';
import { WebView } from 'react-native-webview';
import { PAYPAL_CONFIG } from '../config/paypal';

interface PayPalWebViewProps {
  amount: number;
  onSuccess: (details: any) => void;
  onCancel: () => void;
  onError: (error: any) => void;
}

export default function PayPalWebView({ amount, onSuccess, onCancel, onError }: PayPalWebViewProps) {
  const generatePayPalHTML = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.CLIENT_ID}&currency=${PAYPAL_CONFIG.currency}"></script>
      </head>
      <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f7f7f7;">
        <div id="paypal-button-container" style="width: 100%; max-width: 300px;"></div>
        <script>
          paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'pay'
            },
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '${amount.toFixed(2)}'
                  }
                }]
              });
            },
            onApprove: function(data, actions) {
              return actions.order.capture().then(function(details) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'success',
                  details: details
                }));
              });
            },
            onCancel: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'cancel'
              }));
            },
            onError: function(err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: err
              }));
            }
          }).render('#paypal-button-container');
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'success':
          onSuccess(data.details);
          break;
        case 'cancel':
          onCancel();
          break;
        case 'error':
          onError(data.error);
          break;
      }
    } catch (error) {
      console.error('Error processing PayPal message:', error);
      onError(error);
    }
  };

  return (
    <WebView
      source={{ html: generatePayPalHTML() }}
      onMessage={handleMessage}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
    />
  );
}