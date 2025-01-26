// /server/routes/products.js
import mongoose from 'mongoose';
import express from 'express';
const router = express.Router();
import Product from '../models/Product';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and inventory operations
 */

// ObjectID validation middleware
const validateObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      error: 'INVALID_ID',
      message: 'The provided ID is not a valid product identifier'
    });
  }
  next();
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get paginated list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: ['-createdAt', 'createdAt', '-price', 'price']
 *           default: '-createdAt'
 *         description: Sorting criteria
 *     responses:
 *       200:
 *         description: Successfully retrieved product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
    
    const products = await Product.find()
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Product.countDocuments();
    
    res.json({
      products,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve products',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product identifier
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 availableStock:
 *                   type: integer
 *                 isAvailable:
 *                   type: boolean
 *       400:
 *         description: Invalid product ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
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
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve product information',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Premium Running Shoes
 *         price:
 *           type: number
 *           example: 129.99
 *         stock:
 *           type: integer
 *           example: 50
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 12
 *         total:
 *           type: integer
 *           example: 100
 *         totalPages:
 *           type: integer
 *           example: 9
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: PRODUCT_NOT_FOUND
 *         message:
 *           type: string
 *           example: The requested product could not be found
 *         details:
 *           type: string
 *           nullable: true
 */

module.exports = router;