// server/__tests__/utils/productUtils.js
import request from 'supertest'
import { testAppPromise } from '../../app.js';
import { beforeAll } from '@jest/globals';

let app;
beforeAll(async () => {
  app = await testAppPromise;
});

module.exports = {
  createTestProduct: async (token, productData = {}) => {
    const defaultProduct = {
      name: "Test Product",
      price: 99.99,
      category: "electronics",
      stock: 10
    };
    
    const response = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...defaultProduct, ...productData });
    
    return response.body;
  }
};