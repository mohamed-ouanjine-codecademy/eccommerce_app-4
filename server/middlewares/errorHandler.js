// server/middlewares/errorHandler.js

import { AppError } from '../lib/errors/AppError.js';
import { logger } from '../lib/logger.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

export const errorHandler = (err, req, res, next) => {
  const errorResponse = {
    code: err.statusCode || 500,
    message: err.isOperational ? err.message : 'Internal Server Error',
    ...(NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    })
  };

  if (!err.isOperational) {
    logger.error('Application Error', {
      error: err.stack,
      request: {
        method: req.method,
        path: req.path,
        body: req.body
      },
      user: req.user?.id
    });
  }

  res.status(errorResponse.code).json({
    success: false,
    error: errorResponse
  });
};