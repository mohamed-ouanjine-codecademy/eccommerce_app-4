// server/__tests__/setup.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import RedisClient from '@lib/redis.js';
import { jest, afterEach, afterAll, beforeAll } from '@jest/globals';

// 1. Mock external services first
jest.mock('@services/NotificationService.js', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    sendOrderConfirmation: jest.fn(),
    sendRefundNotification: jest.fn()
  }))
}));

// 2. Mock DI container
jest.unstable_mockModule('@config/di.js', () => ({
  diContainer: {
    getService: jest.fn().mockImplementation(serviceName => ({
      product: {
        getProductById: jest.fn().mockResolvedValue({ stock: 10 })
      },
      order: {
        createOrder: jest.fn()
      },
      auth: {
        register: jest.fn(),
        login: jest.fn().mockResolvedValue({ token: 'mock-token' })
      }
    }))
  }
}));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri); 

  await RedisClient.connect();
});

afterAll(async () => {
  await mongoose.disconnect();
  await RedisClient.quit();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  await RedisClient.flushall();
});