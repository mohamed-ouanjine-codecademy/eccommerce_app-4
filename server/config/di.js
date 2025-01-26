// server/config/di.js
import { ProductService } from '@services/ProductService.js';
import { OrderService } from '@services/OrderService.js';
import { AuthService } from '@services/AuthService.js';
import { PaymentService } from '@services/PaymentService.js';
import { NotificationService } from '@services/NotificationService.js';
import { logger } from '@lib/logger.js';
import CacheService from '@services/CacheService.js';

export class DIContainer {
  constructor() {
    // Skip initialization in test environment
    if (process.env.NODE_ENV === 'test') return;

    // 1. Create shared dependencies
    this.cache = new CacheService('ecommerce');
    this.paymentService = new PaymentService();
    this.notificationService = new NotificationService();

    // 2. Initialize services with dependencies
    this.services = {
      product: new ProductService({
        cache: this.cache,
        logger: logger.child({ service: 'ProductService' })
      }),
      order: new OrderService(
        logger.child({ service: 'OrderService' }),
        new PaymentService(),
        new NotificationService()
      ),
      auth: new AuthService({
        logger: logger.child({ service: 'AuthService' })
      })
    };
  }

  // Add initialize method for test setup
  async initialize() {
    // Empty for testing purposes
  }

  getService(name) {
    return this.services[name] || null;
  }
}

export const diContainer = new DIContainer();