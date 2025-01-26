// server/modules/orders/order.service.js
import Order from './order.model.js';
import Product from '../products/product.model.js';
import { DatabaseError, AppError } from '../../lib/errors/AppError.js';

export class OrderService {
  constructor({ logger }) {
    this.logger = logger.child({ service: 'OrderService' });
  }

  async createOrder(userId, items, total) {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      // Verify product availability
      await this._checkStockLevels(items, session);

      const order = new Order({
        user: userId,
        items,
        total
      });

      await order.save({ session });
      await this._updateInventory(items, session);
      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Order creation failed', { error });
      throw error instanceof AppError ? error : new DatabaseError(error);
    } finally {
      session.endSession();
    }
  }

  async _checkStockLevels(items, session) {
    for (const item of items) {
      const product = await Product.findById(item.product)
        .session(session)
        .select('stock');

      if (!product) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for product ${product.name}`,
          400
        );
      }
    }
  }

  async _updateInventory(items, session) {
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } }
      }
    }));

    await Product.bulkWrite(bulkOps, { session });
  }
}