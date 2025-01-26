// server/lib/errors/errorTypes.js
export const ERROR_CODES = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_INPUT]: 'Invalid request data',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  // ... other mappings
};