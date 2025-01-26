// /server/controllers/OrderController.js
import mongoose from 'mongoose'; // Add this line at the top
import Order from '../models/Order';
import Product from '../models/Product';
import APIResponse from '../utils/APIResponse';
import RefundRequest from '../models/RefundRequest';
import NotificationService from '../services/NotificationService';

class OrderController {
  constructor() {
    this.notificationService = new NotificationService();
  }
  async requestRefund(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(req.params.id)
        .session(session)
        .populate('user', 'email');

      // Validate order
      if (!order) {
        return APIResponse.error(res, 'Order not found', 404);
      }

      if (order.user._id.toString() !== req.user.userId) {
        return APIResponse.error(res, 'Unauthorized', 403);
      }

      // Validate refund amount
      const refundAmount = req.body.amount || order.total;
      if (refundAmount > order.total) {
        return APIResponse.error(res, 'Refund amount exceeds order total', 400);
      }

      // Check existing refund requests
      const existingRefund = await RefundRequest.findOne({
        order: order._id,
        status: { $in: ['pending', 'approved'] }
      }).session(session);

      if (existingRefund) {
        return APIResponse.error(res, 'Refund already requested', 400);
      }

      // Create refund request
      const refundRequest = new RefundRequest({
        order: order._id,
        user: req.user.userId,
        amount: refundAmount,
        reason: req.body.reason,
        status: 'pending'
      });

      await refundRequest.save({ session });

      // Update order status
      order.refundStatus = 'requested';
      await order.save({ session });

      await session.commitTransaction();

      // Send notification
      this.notificationService.sendRefundRequestNotification(order.user.email, refundRequest);

      APIResponse.success(res, refundRequest, 201);
    } catch (err) {
      await session.abortTransaction();
      APIResponse.error(res, err.message, 500);
    } finally {
      session.endSession();
    }
  }

  async handleCancelOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(req.params.id)
        .session(session)
        .populate('items.product');

      if (!order) {
        return APIResponse.error(res, 'Order not found', 404);
      }

      if (!['pending', 'processing'].includes(order.status)) {
        return APIResponse.error(res, 'Order cannot be cancelled', 400);
      }

      // Restock inventory
      await Promise.all(order.items.map(async item => {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: item.quantity }
        }).session(session);
      }));

      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save({ session });

      await session.commitTransaction();
      APIResponse.success(res, order);
    } catch (err) {
      await session.abortTransaction();
      APIResponse.error(res, err.message, 500);
    } finally {
      session.endSession();
    }
  }
}

module.exports = new OrderController();