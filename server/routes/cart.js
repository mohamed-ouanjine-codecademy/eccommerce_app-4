// routes/cart.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Add this
const User = require('../models/User');
const mongoose = require('mongoose');

// Add auth middleware to all routes
router.use(auth)

// Add to cart
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    const existingItem = user.cart.find((item) => item.product.equals(productId));

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart
// Modify the GET /api/cart endpoint to handle deleted products
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'cart.product',
        select: 'name price stock',
        // Add proper population handling
        options: { 
          lean: true,
          match: { status: { $ne: 'deleted' } }
        }
      })
      .lean();

    // Filter out invalid products and add fallbacks
    const validCart = user.cart.map(item => ({
      ...item,
      product: item.product || {
        _id: item.product,
        name: 'Product unavailable',
        price: 0,
        stock: 0
      }
    }));

    res.json(validCart);
    
  } catch (err) {
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

router.patch('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const user = await User.findById(userId);
    const cartItem = user.cart.find(item => item.product.equals(productId));
    
    if (!cartItem) {
      return res.status(404).json({ 
        error: 'PRODUCT_NOT_IN_CART',
        message: 'Product not found in cart. Your cart has been updated.'
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Return updated cart
    const populatedUser = await User.findById(userId)
      .populate('cart.product', 'name price');
    
    res.json(populatedUser.cart);

  } catch (err) {
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

router.delete('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    user.cart = user.cart.filter(item => !item.product.equals(productId));
    await user.save();

    // Return updated cart
    const populatedUser = await User.findById(userId).populate('cart.product');
    res.json(populatedUser.cart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;