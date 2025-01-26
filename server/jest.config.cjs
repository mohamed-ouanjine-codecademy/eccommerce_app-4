// server/jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@services/(.*)$': '<rootDir>/services/$1', // Add this line
    '^@/(.*)$': '<rootDir>/$1',
    'redis': '<rootDir>/__mocks__/redis.js'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(mongodb-memory-server|@babel/runtime)/)'
  ]
};