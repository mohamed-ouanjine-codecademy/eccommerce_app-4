// server/modules/health/health.service.js
import mongoose from 'mongoose';
import RedisClient from '../../lib/redis.js';
import { AppError } from '../../lib/errors/AppError.js';

export class HealthService {
  async checkDatabase() {
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'OK', latency: Date.now() - start };
    } catch (error) {
      throw new AppError('Database connection failed', 503);
    }
  }

  async checkRedis() {
    const start = Date.now();
    try {
      await RedisClient.ping();
      return { 
        status: 'OK', 
        latency: Date.now() - start,
        memory: await RedisClient.info('memory')
      };
    } catch (error) {
      throw new AppError('Redis connection failed', 503);
    }
  }

  async checkStorage() {
    const fs = await import('node:fs/promises');
    const stats = await fs.statfs('/');
    return {
      free: stats.bavail * stats.bsize,
      total: stats.blocks * stats.bsize,
      used: (stats.blocks - stats.bavail) * stats.bsize
    };
  }
}