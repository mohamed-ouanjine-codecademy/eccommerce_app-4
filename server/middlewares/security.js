// server/middleware/security.js
import helmet from 'helmet';
import APIResponse from '../utils/APIResponse.js';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'", "'nonce-{{nonce}}'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.API_DOMAIN],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  }
});

export const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

export const rateLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: APIResponse.error(
    null,
    'Too many requests from this IP',
    429
  )
};

export const requestSanitization = (req, res, next) => {
  // Remove potential NoSQL injection attempts
  const sanitize = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[\$<>]/g, '');
      }
    });
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};