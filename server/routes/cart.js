// routes/cart.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Add this
const User = require('../models/User');

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
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId)
      .populate('cart.product', 'name price')
      .select('cart');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(userId);
    const cartItem = user.cart.find(item => item.product.equals(productId));
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Return full product details
    const populatedUser = await User.findById(userId).populate('cart.product');
    const updatedItem = populatedUser.cart.find(item => item.product._id.equals(productId));

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
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