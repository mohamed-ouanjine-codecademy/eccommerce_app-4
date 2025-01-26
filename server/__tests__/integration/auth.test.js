// server/__tests__/integration/auth.test.js
import request from 'supertest';
import { testAppPromise } from '../../app.js';
import User from '@models/User.js';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';

describe('Auth API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    app = await testAppPromise;
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await RedisClient.quit();
  });

  test('POST /api/auth/register → creates new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123!"
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('token');

    const user = await User.findOne({ email: "test@example.com" });
    expect(user.email).toBe("test@example.com");
  });

  test('POST /api/auth/login → rejects invalid credentials', async () => {
    // Create test user first
    await request(app)
      .post('/api/auth/register')
      .send({
        name: "Existing User",
        email: "exists@example.com",
        password: "CorrectPassword123!"
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "exists@example.com",
        password: "WrongPassword456!"
      });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toMatch(/invalid credentials/i);
  });

  test('GET /api/auth/profile → requires valid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toMatch(/invalid token/i);
  });
});