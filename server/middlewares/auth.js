// /server/middleware/auth.js
import jwt from 'jsonwebtoken';
import APIResponse from '../utils/APIResponse.js';
import User from '../models/User.js';

/**
 * Authentication middleware with multiple strategies
 */
class AuthMiddleware {
  /**
   * JWT Authentication
   */
  static authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return APIResponse.error(res, 'Authorization token required', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .select('-password -__v')
        .lean();

      if (!user) {
        return APIResponse.error(res, 'User not found', 401);
      }

      req.user = user;
      next();
    } catch (err) {
      return APIResponse.error(res, 'Invalid or expired token', 401, err);
    }
  };

  /**
   * Role-based access control
   */
  static requireRole = (role) => {
    return (req, res, next) => {
      if (!req.user?.roles?.includes(role)) {
        return APIResponse.error(res, 
          `Requires ${role} role`, 403);
      }
      next();
    };
  };

  /**
   * Self-or-admin check
   */
  static ownerOrAdmin = (resourceUserId) => {
    return (req, res, next) => {
      if (req.user._id !== resourceUserId && !req.user.roles.includes('admin')) {
        return APIResponse.error(res, 
          'Not authorized to access this resource', 403);
      }
      next();
    };
  };
}

export default AuthMiddleware;