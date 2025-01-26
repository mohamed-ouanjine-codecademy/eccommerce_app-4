// server/__tests__/integration/refund.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import Order from '@models/Order.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Refund API Integration Tests', () => {
  let app, adminToken, userToken, orderId;

  beforeAll(async () => {
    app = await testAppPromise;

    // Create admin user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Admin User",
        email: "admin@test.com",
        password: "AdminPass123!",
        isAdmin: true
      });

    // Create regular user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Test User",
        email: "user@test.com",
        password: "UserPass123!"
      });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: "admin@test.com", password: "AdminPass123!" });
    adminToken = adminLogin.body.data.token;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: "user@test.com", password: "UserPass123!" });
    userToken = userLogin.body.data.token;

    // Create test order
    const order = await Order.create({
      user: userLogin.body.data.user._id,
      total: 100,
      paymentStatus: 'completed'
    });
    orderId = order._id;
  });

  test('POST /api/refunds → should process refund (admin only)', async () => {
    const response = await request(app)
      .post(`/api/refunds/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'processed');
  });

  test('POST /api/refunds → should block non-admin users', async () => {
    const response = await request(app)
      .post(`/api/refunds/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });
});