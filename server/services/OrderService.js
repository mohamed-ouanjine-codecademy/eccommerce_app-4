// server/services/OrderService.js
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import PaymentService from './PaymentService.js';
import NotificationService from './NotificationService.js';

export class OrderService {
  constructor({ logger, paymentService, notificationService }) {
    this.logger = logger;
    this.paymentService = paymentService;
    this.notificationService = notificationService;
  }

  async createOrder(userId, cartItems, shippingAddress) {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      // Get product details and calculate total
      const products = await Product.find({
        _id: { $in: cartItems.map(item => item.product) }
      }).session(session);

      const orderItems = products.map(product => {
        const quantity = cartItems.find(
          item => item.product.toString() === product._id.toString()
        ).quantity;
        
        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        return {
          product: product._id,
          quantity,
          priceAtPurchase: product.price
        };
      });

      // Calculate total
      const total = orderItems.reduce(
        (sum, item) => sum + (item.priceAtPurchase * item.quantity),
        0
      );

      // Create order
      const order = new Order({
        user: userId,
        items: orderItems,
        total,
        shippingAddress,
        status: 'pending'
      });

      // Process payment
      const payment = await this.paymentService.processPayment(total);
      order.paymentId = payment.id;
      order.paymentStatus = payment.status;

      // Update product stock
      await Promise.all(orderItems.map(async item => {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }));

      // Clear user cart
      await User.findByIdAndUpdate(
        userId,
        { $set: { cart: [] } },
        { session }
      );

      await order.save({ session });
      await session.commitTransaction();

      // Send notifications
      this.notificationService.sendOrderConfirmation(userId, order);

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}