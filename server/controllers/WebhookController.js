// /server/controllers/WebhookController.js
import Stripe from 'stripe';
import Order from '../models/Order.js';
import APIResponse from '../utils/APIResponse.js';

export default class WebhookController {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        this.webhookSecret
      );
    } catch (err) {
      return APIResponse.error(res, `Webhook Error: ${err.message}`, 400);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      APIResponse.success(res, { received: true });
    } catch (error) {
      APIResponse.error(res, 'Webhook processing failed', 500, error);
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    const order = await Order.findOneAndUpdate(
      { paymentId: paymentIntent.id },
      { paymentStatus: 'completed' },
      { new: true }
    );

    if (!order) {
      throw new Error(`Order not found for payment: ${paymentIntent.id}`);
    }

    // Trigger order fulfillment process
  }

  async handleRefund(charge) {
    await Order.findOneAndUpdate(
      { paymentId: charge.payment_intent },
      { paymentStatus: 'refunded' }
    );
  }
}