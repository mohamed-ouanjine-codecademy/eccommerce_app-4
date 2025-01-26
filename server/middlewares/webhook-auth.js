// /server/middleware/webhook-auth.js
import Stripe from 'stripe'; // Add missing import

const validateWebhookSignature = (provider) => async (req, res, next) => {
  try {
    switch (provider) {
      case 'stripe':
        req.event = await validateStripeWebhook(req);
        break;
      case 'paypal':
        req.event = await validatePayPalWebhook(req);
        break;
      default:
        throw new Error('Unsupported payment provider');
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid webhook signature' });
  }
};

async function validateStripeWebhook(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe.webhooks.constructEvent(
    req.rawBody,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
}