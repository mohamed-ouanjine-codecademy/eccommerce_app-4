// server/middleware/rateLimiter.js
import RedisClient from '../lib/redis.js';
import { AppError } from '../lib/errors/AppError.js';

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export const rateLimiter = async (req, res, next) => {
  const clientId = req.ip || 'anonymous';
  const key = `rate_limit:${clientId}`;

  try {
    const currentCount = await RedisClient.get(key) || 0;
    
    if (currentCount >= MAX_REQUESTS) {
      throw new AppError('Too many requests', 429);
    }

    await RedisClient.multi()
      .incr(key)
      .pexpire(key, WINDOW_SIZE)
      .exec();

    res.set({
      'X-RateLimit-Limit': MAX_REQUESTS,
      'X-RateLimit-Remaining': MAX_REQUESTS - currentCount - 1
    });

    next();
  } catch (error) {
    next(error);
  }
};