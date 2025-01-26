// server/app.js
import express from 'express';
import { diContainer } from './config/di.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './lib/logger.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './lib/swagger.js';
import config from './config/env.js';
import logger from './lib/logger.js';

let appInstance = null;

export async function createApp() {
  if (appInstance) return appInstance;

  await diContainer.initialize();
  
  const app = express();
  
  // Core Middlewares
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimiter);
  
  // API Documentation
  app.use('/api-docs', 
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  // Feature Modules
  app.use('/api/products', (await import('./routes/products.js')).default);
  app.use('/api/auth', (await import('./routes/auth.js')).default);
  app.use('/api/orders', (await import('./routes/orders.js')).default);

  // Error Handling
  app.use(errorHandler);

  appInstance = app;
  return app;
}

// Export test-ready app promise
export const testAppPromise = createApp();

// Server initialization
if (process.env.NODE_ENV !== 'test') {
  testAppPromise.then(app => {
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  });
}