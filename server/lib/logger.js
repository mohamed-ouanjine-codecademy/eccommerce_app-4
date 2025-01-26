// server/lib/logger.js (improved)
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const { combine, timestamp, json, errors } = winston.format;

// Create a reusable format for all transports
const mainFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json({
    transform: (info) => ({
      level: info.level,
      message: info.message,
      timestamp: info.timestamp,
      context: {
        service: 'api',
        traceId: info.traceId || uuidv4(),
        ...(info.context || {})
      },
      ...(info.stack ? { stack: info.stack } : {})
    })
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: mainFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024 // 10MB
    })
  ]
});

// Middleware version using arrow function
export const requestLogger = (req, res, next) => {
  const traceId = uuidv4();
  const start = Date.now();

  logger.info('Request started', {
    traceId,
    context: {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.on('finish', () => {
    logger.info('Request completed', {
      traceId,
      context: {
        status: res.statusCode,
        duration: Date.now() - start,
        contentLength: res.get('Content-Length') || '0'
      }
    });
  });

  next();
};