// server/lib/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import config from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'API documentation for Ecommerce Platform'
    },
    servers: [{ url: `http://localhost:${config.port}/api` }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./server/modules/**/*.routes.js']
};

export const swaggerSpec = swaggerJSDoc(options);

export const swaggerUiOptions = {
  customSiteTitle: 'Ecommerce API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/public/favicon.ico'
};