// server/services/CacheService.js
import { createClient } from 'redis';

class CacheService {
  constructor(namespace = 'global') {
    // Skip Redis connection in tests
    if (process.env.NODE_ENV === 'test') {
      this.isTestEnv = true;
      return;
    }

    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', err => {
      if (!this.isTestEnv) {
        console.error('Redis Error:', err);
      }
    });

    this.namespace = namespace;
    
    // Only connect in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      this.client.connect();
    }
  }

  async get(key) {
    const value = await this.client.get(`${this.namespace}:${key}`);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.client.set(
      `${this.namespace}:${key}`,
      JSON.stringify(value),
      { EX: ttl }
    );
  }

  async invalidate(pattern = '*') {
    const keys = await this.client.keys(`${this.namespace}:${pattern}`);
    if (keys.length) await this.client.del(keys);
  }
}

export default CacheService;