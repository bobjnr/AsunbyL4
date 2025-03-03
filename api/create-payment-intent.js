// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Always set JSON content type
  res.setHeader('Content-Type', 'application/json');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ status: 'ok' });
  }
  
  // Provide JSON response even for method errors
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', method: req.method });
  }

  try {
    // Check if Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Stripe key is missing in environment variables'
      });
    }

    // Make sure we have amount in the body
    if (!req.body || req.body.amount === undefined) {
      return res.status(400).json({ 
        error: 'Missing required parameter: amount',
        receivedBody: req.body 
      });
    }

    // Make sure the amount is an integer 
    const amount = Math.round(req.body.amount);
    const currency = req.body.currency || 'usd';
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency
    });
    
    // Return only the client secret
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    // Always return JSON for errors
    return res.status(500).json({ 
      error: error.message,
      type: error.type || 'unknown',
      code: error.statusCode || 500
    });
  }
};