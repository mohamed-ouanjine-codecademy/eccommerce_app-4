// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product'); // Add this line
const nodemailer = require('nodemailer');
const axios = require('axios')
require('dotenv').config();

// Apply auth middleware to all order routes
router.use(auth);

// Add base URL middleware
router.use((req, res, next) => {
  req.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  next();
});

// Create test email account (add to top of file)
let testAccount;
(async () => {
  testAccount = await nodemailer.createTestAccount();
})();

// Mock payment endpoint
router.post('/payment/mock', auth, async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!req.body.amount || req.body.amount <= 0) {
      return res.status(400).json({ 
        error: 'INVALID_AMOUNT',
        message: 'Payment amount must be greater than 0'
      });
    }

    res.json({
      success: true,
      transactionId: `MOCK_${Date.now()}`,
      amount: req.body.amount
    });
    
  } catch (err) {
    res.status(500).json({ 
      error: 'PAYMENT_FAILED',
      message: 'Mock payment processing failed'
    });
  }
});

// Update order creation route
// In your order creation route (routes/orders.js)
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const token = req.headers.authorization.split(' ')[1]; // Get token from headers
    const userId = req.user.userId;
    const { shippingAddress } = req.body;
    const { cartItems } = req.body; // Add cartItems to request body

    // 1. Get user with valid cart items
    const user = await User.findById(userId)
      .populate({
        path: 'cart.product',
        select: 'name price stock',
        match: { 
          status: { $ne: 'deleted' },
          price: { $gt: 0 }
        }
      })
      .session(session);

    // 2. Validate cart contents
    const validItems = user.cart.filter(item => 
      item.product &&
      item.product.price > 0 &&
      item.product.stock >= item.quantity
    );

    // Add proper validation
    if (!cartItems || !Array.isArray(cartItems)) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'INVALID_CART',
        message: 'Invalid cart items format'
      });
    }

    // 3. Calculate total and verify
    const total = validItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    if (total <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'INVALID_TOTAL',
        message: 'Cannot create order with zero total'
      });
    }

    // 4. Process payment (mock example)
    const paymentResponse = await axios.post(
    `${req.baseUrl}/api/orders/payment/mock`,
      { amount: total.toFixed(2) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!paymentResponse.data.success) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'PAYMENT_FAILED',
        message: 'Payment processing failed'
      });
    }

    // 5. Update stock and create order
    const orderItems = [];
    for (const item of validItems) {
      const product = await Product.findById(item.product._id).session(session);
      
      // Double-check stock availability
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(409).json({
          error: 'INSUFFICIENT_STOCK',
          message: `${product.name} only has ${product.stock} items left`,
          productId: product._id
        });
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save({ session });

      // Add to order items
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // 6. Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      shippingAddress,
      paymentStatus: 'completed',
      status: 'processing'
    });

    await order.save({ session });

    // 7. Clear user's cart
    user.cart = [];
    await user.save({ session });

    await session.commitTransaction();
    
    // 8. Return formatted response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      order: {
        ...populatedOrder.toObject(),
        items: populatedOrder.items.map(item => ({
          ...item,
          total: item.price * item.quantity
        }))
      }
    });

  } catch (err) {
    await session.abortTransaction();
    console.error('Order creation error details:', {
      error: err.stack,
      body: req.body
    });
    
    res.status(500).json({
      error: 'ORDER_FAILED',
      message: process.env.NODE_ENV === 'production' 
        ? 'Order processing failed' 
        : err.message
    });
  } finally {
    session.endSession();
  }
});

// Email setup using Ethereal
let transporter;

// Initialize email transporter once
(async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('Email transporter initialized');
  } catch (err) {
    console.error('Failed to create email transporter:', err);
  }
})();

// Get user's orders
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add this endpoint
// In routes/orders.js
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;