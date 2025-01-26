// server/controllers/ProductController.js

// Controller layer - Handles HTTP concerns
import ProductService from '../../client/src/services/ProductService';
import APIResponse from '../utils/APIResponse';

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  async handleCreateProduct(req, res) {
    try {
      const product = await this.productService.createProduct(req.body);
      APIResponse.success(res, product, 201);
    } catch (error) {
      APIResponse.error(res, error.message, 400);
    }
  }

  async handleGetProducts(req, res) {
    try {
      const { page, limit, ...filters } = req.query;
      const result = await this.productService.getProductsPaginated({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        filters
      });
      APIResponse.success(res, result);
    } catch (error) {
      APIResponse.error(res, 'Failed to fetch products', 500);
    }
  }

  async handleStockUpdate(req, res) {
    try {
      const product = await this.productService.updateProductStock(
        req.params.id,
        req.body.delta
      );
      APIResponse.success(res, product);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      APIResponse.error(res, error.message, status);
    }
  }
}



module.exports = ProductController;