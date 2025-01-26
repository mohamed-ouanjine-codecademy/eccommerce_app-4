// server/services/InventoryService.js
import Product from '../models/Product.js';
import NotificationService from './NotificationService.js';

export default class InventoryService {
  constructor() {
    this.notificationService = new NotificationService();
    this.SAFETY_STOCK_LEVEL = 5;
  }

  async updateStock(productId, quantity) {
    const product = await Product.findById(productId);
    product.stock += quantity;
    
    if (product.stock < 0) throw new Error('Insufficient stock');
    
    await product.save();
    this._checkStockLevels(product);
    return product;
  }

  async _checkStockLevels(product) {
    if (product.stock <= this.SAFETY_STOCK_LEVEL) {
      await this.notificationService.lowStockAlert(product);
    }
  }

  async getInventoryReport() {
    return Product.aggregate([
      {
        $project: {
          name: 1,
          currentStock: 1,
          lowStock: { $lte: ['$stock', this.SAFETY_STOCK_LEVEL] }
        }
      },
      { $sort: { lowStock: -1, currentStock: 1 } }
    ]);
  }
}