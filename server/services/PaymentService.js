// /server/services/PaymentService.js
import Stripe from 'stripe';
import APIResponse from '../utils/APIResponse.js';

export class PaymentService {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16'
    });
  }

  /**
   * Process payment through Stripe
   * @param {number} amount - Payment amount in USD
   * @param {string} description - Payment description
   * @returns {Promise<Object>} Stripe payment intent
   */
  async processPayment(amount, description = 'Ecommerce Purchase') {
    if (process.env.NODE_ENV === 'test') {
      return { id: 'test_pi_123', status: 'succeeded' };
    }
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        description,
        automatic_payment_methods: { enabled: true }
      });

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret
      };
    } catch (error) {
      throw APIResponse.error(null, 'Payment processing failed', 500, error);
    }
  }

  /**
   * Process refund through Stripe
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {number} amount - Refund amount in USD
   * @returns {Promise<Object>} Stripe refund object
   */
  async processRefund(paymentIntentId, amount) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100)
      });

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error) {
      throw APIResponse.error(null, 'Refund processing failed', 500, error);
    }
  }
}