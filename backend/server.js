// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const braintree = require('braintree');
// const asyncHandler = require('express-async-handler');

// const app = express();

// // Middleware for JSON requests
// app.use(bodyParser.json());

// // Middleware for handling webhooks (application/x-www-form-urlencoded)
// app.use((req, res, next) => {
//   if (req.path === '/webhooks/braintree') {
//     bodyParser.urlencoded({ extended: false })(req, res, next);
//   } else {
//     bodyParser.json()(req, res, next);
//   }
// });

// // Basic middleware setup
// app.use(cors({
//   origin: true,
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Initialize Braintree gateway with direct credentials
// const gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: 'sxy99ysn92kk348v',
//   publicKey: '4n7dw67qb4qyqhdt',
//   privateKey: '6373b531b2c303e050bd557462f77c9d'
// });

// // Webhook endpoint (Braintree's expected path)
// app.post('/webhooks/braintree', bodyParser.urlencoded({ extended: false }), (req, res) => {
//   try {
//     console.log('Webhook received:', {
//       headers: req.headers,
//       body: req.body
//     });

//     const btSignature = req.body.bt_signature;
//     const btPayload = req.body.bt_payload;

//     if (!btSignature || !btPayload) {
//       console.error('Missing bt-signature or bt-payload in the request body');
//       return res.status(400).send('Invalid webhook payload');
//     }

//     // Parse the webhook
//     const webhookNotification = gateway.webhookNotification.parse(
//       btSignature,
//       btPayload
//     );

//     console.log('Webhook parsed successfully:', {
//       kind: webhookNotification.kind,
//       timestamp: webhookNotification.timestamp
//     });

//     // Respond successfully
//     res.status(200).send('Webhook received successfully');
//   } catch (err) {
//     console.error('Webhook processing error:', err);
//     res.status(400).send('Webhook processing failed');
//   }
// });

// app.get('/api/braintree/client-token', asyncHandler(async (req, res) => {
//   try {
//     const response = await gateway.clientToken.generate({});
//     res.json(response.clientToken);
//   } catch (error) {
//     console.error('Error generating client token:', error);
//     res.status(500).json({
//       error: 'Failed to generate client token'
//     });
//   }
// }));

// // Unified payment processing endpoint for PayPal, Venmo, and other methods
// app.post('/api/payment/process', asyncHandler(async (req, res) => {
//   console.log('Payment request received:', {
//     body: req.body,
//     headers: req.headers
//   });

//   const { 
//     paymentMethodNonce,
//     amount,
//     paymentMethod,
//   } = req.body;

//   if (!paymentMethodNonce) {
//     console.error('No payment method nonce received');
//     return res.status(400).json({
//       success: false,
//       error: 'Payment method nonce is required'
//     });
//   }

//   console.log('Processing payment with nonce:', paymentMethodNonce.substring(0, 8) + '...');

//   try {
//     const transactionParams = {
//       amount,
//       paymentMethodNonce,
//       deviceData,
//       options: {
//         submitForSettlement: true,
//         paypal: {
//           customField: 'PayPal custom field',
//           description: 'Payment for services'
//         },
//         venmo: {
//           profileId: req.body.venmoProfileId || undefined
//         }
//       }
//     };

//     if (shipping && paymentMethod === 'PayPal') {
//       transactionParams.shipping = shipping;
//     }

//     const result = await gateway.transaction.sale(transactionParams);

//     if (result.success) {
//       const transactionData = {
//         id: result.transaction.id,
//         status: result.transaction.status,
//         type: result.transaction.type,
//         currencyIsoCode: result.transaction.currencyIsoCode,
//         amount: result.transaction.amount,
//         merchantAccountId: result.transaction.merchantAccountId,
//         paymentInstrumentType: result.transaction.paymentInstrumentType,
//         processorResponseCode: result.transaction.processorResponseCode,
//         processorResponseText: result.transaction.processorResponseText,
//         paypalDetails: result.transaction.paypal,
//         venmoDetails: result.transaction.venmo
//       };

//       res.json({
//         success: true,
//         transaction: transactionData
//       });
//     } else {
//       console.error('Transaction failed:', result.message);
//       res.status(400).json({
//         success: false,
//         error: result.message,
//         errorDetails: result.errors.deepErrors()
//       });
//     }
//   } catch (error) {
//     console.error('Error processing transaction:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// }));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on http://0.0.0.0:${PORT}`);
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     error: 'Internal Server Error',
//     message: err.message
//   });
// });


const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51QpwWkI85GnQ3SeRay0Z0imHst70lXvM4JhPG9HrA5g5hQpvi03ATtdaBmC4NSX1wCO9lCcWtdYzjtjH9lI1caCg00eIckLBK7');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Create a payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      }
    });
  }
});

// Listen for webhook events
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // You'll get this from the Stripe dashboard

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Update your database, fulfill the order, etc.
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

app.get('/', (req, res) => {
  res.send('Stripe payment server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
