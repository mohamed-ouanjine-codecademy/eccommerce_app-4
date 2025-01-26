// server/utils/RedisClient.js
import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: options => Math.min(options.attempt * 100, 3000)
    });
    
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    
    this.client.on('error', err => console.error('Redis Error:', err));
  }

  async get(key) {
    try {
      const data = await this.getAsync(key);
      return JSON.parse(data);
    } catch (err) {
      console.error('Cache read error:', err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.setAsync(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      console.error('Cache write error:', err);
    }
  }

  async invalidate(pattern) {
    const keys = await promisify(this.client.keys).bind(this.client)(pattern);
    if (keys.length) await this.delAsync(keys);
  }
}

export default new RedisClient();