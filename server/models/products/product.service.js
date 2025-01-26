// server/modules/products/product.service.js
import Product from './product.model.js';
import { DatabaseError } from '../../lib/errors/AppError.js';

export class ProductService {
  constructor({ logger }) {
    this.logger = logger.child({ service: 'ProductService' });
  }

  async createProduct(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      this.logger.error('Create product failed', { error });
      throw new DatabaseError(error);
    }
  }

  async updateStock(productId, delta) {
    const session = await Product.startSession();
    session.startTransaction();
    
    try {
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error('Product not found');
      
      product.stock += delta;
      if (product.stock < 0) throw new Error('Insufficient stock');
      
      await product.save({ session });
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('Stock update failed', { productId, delta, error });
      throw error;
    } finally {
      session.endSession();
    }
  }
}