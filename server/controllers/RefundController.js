// /server/controllers/RefundController.js
import RefundRequest from '../models/RefundRequest';
import Order from '../models/Order';
import APIResponse from '../utils/APIResponse';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class RefundController {
  async processRefund(req, res) {
    try {
      const refund = await RefundRequest.findById(req.params.id)
        .populate('order')
        .populate('user');

      if (!refund) {
        return APIResponse.error(res, 'Refund not found', 404);
      }

      // Process Stripe refund
      const stripeRefund = await stripe.refunds.create({
        payment_intent: refund.order.paymentId,
        amount: Math.round(refund.amount * 100),
      });

      // Update refund status
      refund.status = 'processed';
      refund.processedAt = new Date();
      await refund.save();

      // Update order status
      await Order.findByIdAndUpdate(refund.order._id, {
        $set: { refundStatus: refund.amount === refund.order.total ? 'full' : 'partial' }
      });

      APIResponse.success(res, { refund, stripeRefund });
    } catch (err) {
      APIResponse.error(res, err.message, 500);
    }
  }
}

module.exports = new RefundController();