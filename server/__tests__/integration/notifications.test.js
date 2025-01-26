// server/__tests__/integration/notifications.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import { describe, test, expect, beforeAll } from '@jest/globals';
import nock from 'nock';

describe('Notification Integration Tests', () => {
  let app, userToken;

  beforeAll(async () => {
    app = await testAppPromise;
    nock.disableNetConnect();

    // Setup test user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Test User",
        email: "notify@test.com",
        password: "TestPass123!"
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: "notify@test.com", password: "TestPass123!" });
    
    userToken = loginRes.body.data.token;
  });

  test('POST /api/orders → triggers order confirmation email', async () => {
    // Mock email sending
    nock('https://api.emailservice.com')
      .post('/send')
      .reply(202);

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({/* valid order data */});

    expect(orderRes.status).toBe(201);
    expect(nock.isDone()).toBeTruthy();
  });

  test('PUT /api/refunds/:id → sends refund notification', async () => {
    // Mock external services
    nock('https://api.stripe.com')
      .post('/v1/refunds')
      .reply(200, { id: 're_123', status: 'succeeded' });
    
    nock('https://api.emailservice.com')
      .post('/send')
      .reply(202);

    const refundRes = await request(app)
      .put('/api/refunds/123')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(refundRes.status).toBe(200);
    expect(nock.isDone()).toBeTruthy();
  });
});