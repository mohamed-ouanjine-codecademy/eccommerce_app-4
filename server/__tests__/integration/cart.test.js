// server/__tests__/integration/cart.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import Product from '@models/Product.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Cart API Tests', () => {
  let app, userToken, productId;

  beforeAll(async () => {
    app = await testAppPromise;
    
    // Create test user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Cart User",
        email: "cart@test.com",
        password: "CartPass123!"
      });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: "cart@test.com", password: "CartPass123!" });
    userToken = loginRes.body.data.token;

    // Create test product
    const product = await Product.create({
      name: "Test Product for Cart",
      price: 29.99,
      stock: 10,
      category: "test"
    });
    productId = product._id;
  });

  test('POST /api/cart → Add item to cart', async () => {
    const response = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    expect(response.status).toBe(200);
    expect(response.body[0].quantity).toBe(2);
  });

  test('GET /api/cart → Get cart items', async () => {
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0].product.name).toBe("Test Product for Cart");
  });

  afterAll(async () => {
    await Product.deleteMany({});
  });
});