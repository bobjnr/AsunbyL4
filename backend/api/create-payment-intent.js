// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: Check if we have the secret key (redact most of it for security)
    const hasKey = !!process.env.STRIPE_SECRET_KEY;
    const keyPrefix = process.env.STRIPE_SECRET_KEY ? 
      process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...' : 
      'undefined';
    console.log(`Stripe key available: ${hasKey}, prefix: ${keyPrefix}`);
    
    // Make sure the amount is an integer 
    const amount = Math.round(req.body.amount);
    const currency = req.body.currency || 'usd';
    
    console.log(`Creating payment intent for amount: ${amount} ${currency}`);
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency
    });
    
    console.log(`Payment intent created: ${paymentIntent.id}`);
    
    // Return only the client secret
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Provide more detailed error information
    return res.status(500).json({ 
      error: error.message,
      type: error.type,
      code: error.statusCode || 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};