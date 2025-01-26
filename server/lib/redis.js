// server/lib/redis.js
import { createClient } from 'redis';

const client = process.env.NODE_ENV === 'test' 
  ? { 
      connect: () => Promise.resolve(),
      quit: () => Promise.resolve(),
      flushall: () => Promise.resolve(),
      on: () => {}
    }
  : createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

if (process.env.NODE_ENV !== 'test') {
  client
    .on('connect', () => console.log('Redis connecting...'))
    .on('ready', () => console.log('Redis connected'))
    .on('error', (err) => console.error('Redis error:', err))
    .on('end', () => console.log('Redis disconnected'));
}

export default client;