// server/config/env.js
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis'] })
    .when('NODE_ENV', {
      is: 'test',
      then: Joi.string().default('redis://localhost:6379/1'),
      otherwise: Joi.required()
    }),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  JWT_REFRESH_SECRET: Joi.string()
    .when('NODE_ENV', {
      is: 'test',
      then: Joi.string().default('testrefreshsecret'),
      otherwise: Joi.required()
    }),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
  RATE_LIMIT_WINDOW: Joi.number().default(15),
  RATE_LIMIT_MAX: Joi.number().default(100),
  MONGO_MAX_POOL_SIZE: Joi.number().default(10),
  MONGO_MIN_POOL_SIZE: Joi.number().default(2),
  REDIS_TLS_ENABLED: Joi.boolean().default(false),
  REQUEST_TIMEOUT: Joi.number().default(30000),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  EMAIL_USER: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required()
  }),
}).unknown();

const { value: env, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Env validation error: ${error.message}`);
}

export default {
  env: env.NODE_ENV,
  port: env.PORT,
  mongo: {
    uri: env.MONGO_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: env.NODE_ENV !== 'production'
    },
    poolSize: {
      max: env.MONGO_MAX_POOL_SIZE,
      min: env.MONGO_MIN_POOL_SIZE
    }
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiration: env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: env.JWT_REFRESH_EXPIRATION,
    expiresIn: '1h'
  },
  redis: {
    url: env.REDIS_URL,
    tls: env.REDIS_TLS_ENABLED ? { rejectUnauthorized: false } : undefined
  },
  logging: {
    level: env.LOG_LEVEL
  },
  rateLimit: {
    windowMinutes: env.RATE_LIMIT_WINDOW,
    maxRequests: env.RATE_LIMIT_MAX
  },
  server: {
    timeout: env.REQUEST_TIMEOUT
  }
};