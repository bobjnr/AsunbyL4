const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    // Import the handler function
    const handler = require('./api/create-payment-intent');
    
    // Call the handler with req and res
    await handler(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Test the API with:`);
  console.log(`curl -X POST http://localhost:${PORT}/api/create-payment-intent -H "Content-Type: application/json" -d '{"amount": 1000, "currency": "usd"}'`);
});