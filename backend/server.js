const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const braintree = require('braintree');
const asyncHandler = require('express-async-handler');

const app = express();
app.use(express.json());

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(cors({
  origin: [
    'http://192.168.17.171:19006', 
    'exp://192.168.17.171:19000',
    'http://192.168.17.171:3000'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'sxy99ysn92kk348v',
  publicKey: '4n7dw67qb4qyqhdt',
  privateKey: '6373b531b2c303e050bd557462f77c9d'
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is connected!' });
});

// Braintree endpoints
app.get('/api/braintree/client-token', asyncHandler(async (req, res) => {
  const response = await gateway.clientToken.generate({});
  res.send(response.clientToken);
}));

app.post('/api/braintree/process-payment', asyncHandler(async (req, res) => {
  const { paymentMethodNonce, amount } = req.body;

  console.log('Processing payment:', { paymentMethodNonce, amount });

  try {
    const result = await gateway.transaction.sale({
      amount,
      paymentMethodNonce,
      options: {
        submitForSettlement: true
      }
    });

    console.log('Transaction result:', result);

    if (result.success) {
      res.json({
        success: true,
        transaction: result.transaction
      });
    } else {
      console.error('Transaction failed:', result.message);
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});


// Zelle Payment Verification Endpoint
app.post('/verify-zelle-payment', (req, res) => {
  const { transactionId } = req.body;

  console.log(`Transaction ID received: ${transactionId}`);
  res.status(200).json({ success: true, message: 'Payment verified successfully!' });

//   if (!transactionId) {
//     return res.status(400).json({ error: 'Transaction ID is required' });
//   }

//   // Simulate verification logic (replace with real logic)
//   console.log(`Verifying Zelle payment with Transaction ID: ${transactionId}`);

//   // Respond with success
//   res.status(200).json({ success: true, message: 'Payment verified successfully!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
