// /server/routes/admin.js
import express from 'express';
import { admin } from '../middleware/admin.js';
import ProductController from '../controllers/ProductController.js';
import UserController from '../controllers/UserController.js';
import OrderController from '../controllers/OrderController.js';

const router = express.Router();
const productController = new ProductController();
const userController = new UserController();
const orderController = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

// Product Management
router.post('/products', admin.verify, productController.createProduct);
router.put('/products/:id', admin.verify, productController.updateProduct);
router.delete('/products/:id', admin.verify, productController.deleteProduct);

// User Management
router.get('/users', admin.verify, userController.getAllUsers);
router.put('/users/:id/role', admin.verify, userController.updateUserRole);
router.delete('/users/:id', admin.verify, userController.deleteUser);

// Order Management
router.get('/orders', admin.verify, orderController.getAllOrders);
router.put('/orders/:id/status', admin.verify, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Admin]
 */
router.get('/analytics', admin.verify, orderController.getSalesAnalytics);

export default router;