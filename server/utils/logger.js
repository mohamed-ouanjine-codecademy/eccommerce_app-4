// server/utils/logger.js
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport({
      level: 'info',
      index: 'ecommerce-logs',
      clientOpts: { 
        node: process.env.ELASTICSEARCH_URL,
        auth: {
          username: process.env.ELASTIC_USER,
          password: process.env.ELASTIC_PASSWORD
        }
      }
    })
  ]
});

// Morgan-like HTTP logging middleware
export const httpLogger = (req, res, next) => {
  logger.info({
    message: 'HTTP Request',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      message: 'HTTP Response',
      status: res.statusCode,
      duration: Date.now() - start,
      contentLength: res.get('Content-Length')
    });
  });

  next();
};

export default logger;