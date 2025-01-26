// server/__tests__/integration/products.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import Product from '@models/Product.js';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

describe('Product API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = await testAppPromise;
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await Product.deleteMany({});
  });

  test('GET /api/products → returns paginated list', async () => {
    // Create test products
    await Product.create([
      { name: "Product 1", price: 49.99, category: "electronics", stock: 5 },
      { name: "Product 2", price: 99.99, category: "home", stock: 10 }
    ]);

    const response = await request(app)
      .get('/api/products')
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.meta.total).toBe(2);
  });

  test('POST /api/admin/products → creates new product (admin)', async () => {
    // First create admin user and get token
    const admin = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Admin User",
        email: "admin@test.com",
        password: "AdminPass123!",
        isAdmin: true
      });

    const response = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${admin.body.data.token}`)
      .send({
        name: "New Product",
        price: 199.99,
        category: "electronics",
        stock: 15
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("New Product");
  });
});