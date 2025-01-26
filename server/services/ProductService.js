// server/services/ProductService.js
// Service layer - Pure business logic
import Product from '../models/Product.js';
import InventoryRepository from './InventoryRepository.js';
import CacheService from './CacheService.js';

/**
 * Product service handling business logic
 */
export class ProductService {
  constructor() {
    this.inventoryRepo = new InventoryRepository();
    this.cache = new CacheService('products');
  }

  async createProduct(productData) {
    const product = new Product(productData);
    
    await this.inventoryRepo.initializeStock(
      product._id, 
      productData.stock
    );

    await product.save();
    this.cache.invalidate('all');
    return product;
  }

  async updateStock(productId, delta) {
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock + delta;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    product.stock = newStock;
    await product.save();
    
    this.cache.invalidate(`product:${productId}`);
    this.cache.invalidate('all');
    
    return product;
  }

  async getProductsPaginated({ page = 1, limit = 10, filters = {} }) {
    const cacheKey = `products:${page}:${limit}:${JSON.stringify(filters)}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) return cached;

    const query = Product.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const [products, total] = await Promise.all([
      query.exec(),
      Product.countDocuments(filters)
    ]);

    const result = {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    await this.cache.set(cacheKey, result, 300);
    return result;
  }
}
