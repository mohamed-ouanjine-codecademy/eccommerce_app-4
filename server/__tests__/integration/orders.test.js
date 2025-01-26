// server/__tests__/integration/orders.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import Product from '@models/Product.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Order API Integration Tests', () => {
  let app, userToken, productId;

  beforeAll(async () => {
    app = await testAppPromise;
    
    // Test user setup
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123!"
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: "test@example.com",
        password: "SecurePass123!"
      });
    
    userToken = loginRes.body.token;
    
    // Test product setup
    const product = await Product.create({
      name: "Test Product",
      price: 99.99,
      stock: 10,
      category: "electronics"
    });
    productId = product._id;
  });

  afterAll(async () => {
    await Product.deleteMany({});
  });

  test('POST /api/orders → should create order', async () => {
    // Add to cart
    await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          street: "123 Test St",
          city: "Testville",
          state: "TS",
          zipCode: "12345"
        }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('paymentStatus');
    
    // Verify stock update
    const updatedProduct = await Product.findById(productId);
    expect(updatedProduct.stock).toBe(8);
  });
});