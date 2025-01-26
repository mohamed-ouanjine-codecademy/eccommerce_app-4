// server/__mocks__/redis.js
export const createClient = () => ({
  connect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
  quit: jest.fn()
});