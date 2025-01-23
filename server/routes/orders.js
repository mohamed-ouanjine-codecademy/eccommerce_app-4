// routes/orders.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Add this line
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product'); // Add this line
const nodemailer = require('nodemailer');

// Apply auth middleware to all order routes
router.use(auth);

// Create test email account (add to top of file)
let testAccount;
(async () => {
  testAccount = await nodemailer.createTestAccount();
})();

// Mock payment endpoint
router.post('/payment/mock', auth, async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    res.json({
      success: true,
      transactionId: `MOCK_${Date.now()}`,
      amount: req.body.amount
    });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Update order creation route
// In your order creation route (routes/orders.js)
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    console.log('Starting checkout process for user:', req.user.userId);
    await session.startTransaction();
    
    const { shippingAddress, paymentConfirmed } = req.body;
    const userId = req.user.userId;

    console.log('Received paymentConfirmed:', paymentConfirmed);
    console.log('Processing order with shipping address:', shippingAddress);

    // [1] Verify Payment
    if (process.env.NODE_ENV === 'production' && !paymentConfirmed) {
      throw new Error('Payment not confirmed - production mode requires payment verification');
    }

    // [2] Get User Cart
    const user = await User.findById(userId)
      .populate('cart.product')
      .session(session);
    console.log('User cart items:', user.cart);

    // [3] Inventory Check
    console.log('Starting inventory checks...');
    for (const item of user.cart) {
      const product = await Product.findById(item.product._id).session(session);
      console.log(`Checking stock for ${product.name}: ${product.stock} available, need ${item.quantity}`);
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (Available: ${product.stock}, Requested: ${item.quantity})`);
      }
      
      product.stock -= item.quantity;
      await product.save({ session });
      console.log(`Updated stock for ${product.name}: ${product.stock}`);
    }

    // [4] Create Order
    const total = user.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    console.log('Calculated order total:', total);

    const order = new Order({
      user: userId,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price // Add price snapshot
      })),
      total,
      shippingAddress
    });

    await order.save({ session });
    console.log('Order created:', order);

    // [5] Clear Cart
    user.cart = [];
    await user.save({ session });
    console.log('Cart cleared successfully');

    await session.commitTransaction();
    console.log('Transaction committed successfully');

    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);

  } catch (err) {
    await session.abortTransaction();
    console.error('!! CHECKOUT ERROR !!', {
      error: err.message,
      stack: err.stack,
      user: req.user?.userId,
      body: req.body
    });
    res.status(500).json({ 
      error: err.message.includes('stock') 
        ? err.message 
        : 'Checkout process failed - see server logs' 
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

router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    
    const userId = req.user.userId;
    const { shippingAddress, paymentConfirmed } = req.body;

    // if (!paymentConfirmed) {
    //   return res.status(400).json({ error: 'Payment not confirmed' });
    // }

    const user = await User.findById(userId)
      .populate('cart.product')
      .session(session);

    // Inventory check and stock update
    for (const item of user.cart) {
      const product = await Product.findById(item.product._id).session(session);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const total = user.cart.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    const order = new Order({
      user: userId,
      items: user.cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total,
      shippingAddress
    });

    await order.save({ session });

    user.cart = [];
    await user.save({ session });

    // Send email (non-critical operation)
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Order Confirmation #${order._id}`,
        html: generateOrderEmail(order) // Use a template function
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email failed:', emailError);
    }

    await session.commitTransaction();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);

  } catch (err) {
    await session.abortTransaction();
    console.error('Order creation error:', err);
    res.status(500).json({ 
      error: err.message.startsWith('Insufficient') 
        ? err.message 
        : 'Order creation failed' 
    });
  } finally {
    session.endSession();
  }
});

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