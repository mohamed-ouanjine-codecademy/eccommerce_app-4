// server/test/utils.js
import mongoose from 'mongoose';
import RedisClient from '../lib/redis.js';

export class TestEnvironment {
  static async setup() {
    await mongoose.connect(process.env.TEST_MONGO_URI);
    await RedisClient.flushall();
  }

  static async teardown() {
    await mongoose.disconnect();
    await RedisClient.quit();
  }

  static async clearDatabase() {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map(collection => 
        collection.deleteMany({})
      )
    );
  }
}

export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: null,
  ...overrides,
  get(header) {
    return this.headers?.[header.toLowerCase()];
  }
});

export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};