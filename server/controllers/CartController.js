// server/controllers/CartController.js

import APIResponse from '../utils/APIResponse.js';
import User from '../models/User.js';
import ProductService from '../services/ProductService.js';

class CartController {
  constructor(diContainer) {
    this.productService = diContainer.getService('product');
  }

  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;

      // Validate product existence and stock
      const product = await this.productService.getProductById(productId);
      if (!product || product.stock < quantity) {
        return APIResponse.error(res, 'Product unavailable', 400);
      }

      const user = await User.findById(userId);
      const existingItem = user.cart.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        user.cart.push({ product: productId, quantity });
      }

      await user.save();
      return APIResponse.success(res, this._formatCart(user.cart));
    } catch (error) {
      return APIResponse.error(res, error.message, 400, error);
    }
  }

  async getCart(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate('cart.product', 'name price stock');
      
      return APIResponse.success(res, this._formatCart(user.cart));
    } catch (error) {
      return APIResponse.error(res, 'Failed to retrieve cart', 500, error);
    }
  }

  _formatCart(cartItems) {
    return cartItems.map(item => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        inStock: item.product.stock > 0
      },
      quantity: item.quantity,
      total: item.quantity * item.product.price
    }));
  }
}

export default CartController;