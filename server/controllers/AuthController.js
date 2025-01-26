// server/controllers/AuthController.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthController {
  // ... existing methods ...

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return APIResponse.error(res, 'Invalid refresh token', 401);
      }

      const newAccessToken = this._generateAccessToken(user);
      const newRefreshToken = this._generateRefreshToken(user);

      // Update refresh token in DB
      user.refreshToken = newRefreshToken;
      await user.save();

      return APIResponse.success(res, {
        token: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      return APIResponse.error(res, 'Token refresh failed', 401, error);
    }
  }

  _generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  _generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }
}