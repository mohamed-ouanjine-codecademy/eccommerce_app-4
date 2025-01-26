// server/__tests__/setup/di.js
import { diContainer } from '../../config/di.js';

// Mock DI container for tests
diContainer.getService = jest.fn().mockImplementation((serviceName) => ({
  order: {
    createOrder: jest.fn()
  }
}));