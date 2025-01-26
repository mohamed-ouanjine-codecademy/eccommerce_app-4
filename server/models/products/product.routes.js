// server/modules/products/product.routes.js
import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { validate } from '../../validations/index.js';
import { roleRequired } from '../../middlewares/authorization.js';

const router = Router();
const controller = new ProductController();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Get paginated products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Products list
 */
router.get('/', controller.getProducts);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     security: [{ BearerAuth: [] }]
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductUpdate'
 *     responses:
 *       200:
 *         description: Updated product
 */
router.patch(
  '/:id',
  roleRequired('admin'),
  validate('productUpdate'),
  controller.updateProduct
);

export default router;