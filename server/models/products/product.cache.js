// server/modules/products/product.cache.js
import RedisClient from '../../lib/redis.js';
import { logger } from '../../lib/logger.js';

const CACHE_PREFIX = 'products';
const TTL = 3600; // 1 hour

export class ProductCache {
  static async get(key) {
    try {
      const data = await RedisClient.get(`${CACHE_PREFIX}:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache read error', { key, error });
      return null;
    }
  }

  static async set(key, data) {
    try {
      await RedisClient.set(
        `${CACHE_PREFIX}:${key}`,
        JSON.stringify(data),
        'EX',
        TTL
      );
    } catch (error) {
      logger.error('Cache write error', { key, error });
    }
  }

  static async invalidate(pattern = '*') {
    try {
      const keys = await RedisClient.keys(`${CACHE_PREFIX}:${pattern}`);
      if (keys.length) await RedisClient.del(keys);
    } catch (error) {
      logger.error('Cache invalidation error', { pattern, error });
    }
  }
}