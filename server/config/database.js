// server/config/database.js
import mongoose from 'mongoose';
import config from './env.js';
import logger from '../lib/logger.js';

const MAX_RETRIES = 3;
let retryCount = 0;

export async function connectDatabase() {
  try {
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    logger.info('Database connection established');
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.warn(`Database connection failed (attempt ${retryCount}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDatabase();
    }
    logger.error('Database connection failed after maximum retries');
    throw error;
  }
}

export function disconnectDatabase() {
  return mongoose.disconnect().then(() => {
    logger.info('Database connection closed');
  });
}