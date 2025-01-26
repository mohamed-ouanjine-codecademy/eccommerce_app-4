// server/__tests__/integration/payment.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Payment API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = await testAppPromise;
    jest.unstable_mockModule('stripe', () => ({
      default: () => ({
        paymentIntents: {
          create: jest.fn().mockResolvedValue({
            id: 'pi_mock_123',
            status: 'succeeded'
          })
        }
      })
    }));
  });

  afterAll(async () => {
    jest.unmock('stripe');
  });

  test('POST /api/payments → processes payment successfully', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({
        amount: 100.50,
        token: 'tok_mock'
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: 'succeeded'
    });
  });
});