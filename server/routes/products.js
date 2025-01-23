// /server/routes/products.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Add ObjectID validation middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'INVALID_ID',
      message: 'The provided ID is not a valid product identifier'
    });
  }
  next();
};

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('-__v');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product with validation
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name price stock')
      .lean();

    if (!product) {
      return res.status(404).json({
        error: 'PRODUCT_NOT_FOUND',
        message: 'The requested product could not be found',
        productId: req.params.id
      });
    }

    res.json({
      ...product,
      availableStock: product.stock,
      isAvailable: product.stock > 0
    });

  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve product information',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;