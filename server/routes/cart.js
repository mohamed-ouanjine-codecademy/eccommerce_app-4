// /server/routes/cart.js
import express from 'express';
import CartController from '../controllers/CartController.js';
import AuthMiddleware from '../middleware/auth.js';

const router = express.Router();
const cartController = new CartController();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

router.use(AuthMiddleware.authenticateJWT);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item added to cart
 */
router.post('/', cartController.addToCart.bind(cartController));

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart contents
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/', cartController.getCart.bind(cartController));

export default router;