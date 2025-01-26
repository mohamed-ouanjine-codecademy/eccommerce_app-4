// /server/routes/orders.js
import express from 'express';
import { OrderService } from '../services/OrderService.js';
import AuthMiddleware from '../middlewares/auth.js';
import APIResponse from '../utils/APIResponse.js';
import { diContainer } from '../config/di.js'

const router = express.Router();
const orderService = diContainer.getService('order');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

router.use(AuthMiddleware.authenticateJWT);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 */
router.post('/', async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.user._id,
      req.user.cart,
      req.body.shippingAddress
    );
    res.status(201).json(order);
  } catch (error) {
    APIResponse.error(res, 'Order creation failed', 400, error);
  }
});

export default router;