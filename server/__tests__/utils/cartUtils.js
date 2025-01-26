// server/__tests__/utils/cartUtils.js
import request from 'supertest'
import { testAppPromise } from '../../app.js';
import { beforeAll } from '@jest/globals';

let app;
beforeAll(async () => {
  app = await testAppPromise;
});

module.exports = {
  addToCart: async (token, productId, quantity = 1) => {
    return await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity });
  }
};