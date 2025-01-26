// /server/middleware/admin.js
import APIResponse from '../utils/APIResponse.js';

/**
 * Middleware for admin role verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return APIResponse.error(res, 
        'Admin privileges required', 
        403,
        new Error('Unauthorized admin access attempt')
      );
    }
    next();
  } catch (error) {
    return APIResponse.error(res,
      'Admin verification failed',
      500,
      error
    );
  }
};

export const admin = {
  verify: adminMiddleware,
  // Add more admin-specific middleware as needed
};