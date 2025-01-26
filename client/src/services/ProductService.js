// Service layer - Pure business logic
const Product = require('../../../server/models/Product');
const InventoryRepository = require('../repositories/InventoryRepository');
const CacheService = require('./CacheService');

class ProductService {
  constructor() {
    this.cache = new CacheService('products');
    this.inventoryRepo = new InventoryRepository();
  }

  async createProduct(productData) {
    const product = new Product(productData);
    await this.inventoryRepo.initializeStock(product._id, productData.stock);
    await this.cache.invalidate('all-products');
    return product.save();
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

    await this.cache.set(cacheKey, result, 300); // Cache for 5 minutes
    return result;
  }

  async updateProductStock(productId, delta) {
    const session = await Product.startSession();
    session.startTransaction();
    
    try {
      const product = await Product.findById(productId).session(session);
      if (!product) throw new Error('Product not found');
      
      product.stock += delta;
      if (product.stock < 0) throw new Error('Insufficient stock');
      
      await product.save({ session });
      await this.inventoryRepo.logStockChange(productId, delta, 'ADJUSTMENT');
      await this.cache.invalidate(`product:${productId}`);
      
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = ProductService;