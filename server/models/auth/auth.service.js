// server/modules/auth/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './auth.model.js';
import { AppError, DatabaseError } from '../../lib/errors/AppError.js';
import config from '../../config/env.js';

const SALT_ROUNDS = 12;

export class AuthService {
  constructor({ logger }) {
    this.logger = logger.child({ service: 'AuthService' });
  }

  async register(userData) {
    try {
      if (await User.exists({ email: userData.email })) {
        throw new AppError('Email already exists', 409);
      }

      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      return await User.create({ ...userData, password: hashedPassword });
    } catch (error) {
      this.logger.error('Registration failed', { error });
      throw error instanceof AppError ? error : new DatabaseError(error);
    }
  }

  async authenticate(email, password) {
    const user = await User.findOne({ email }).select('+password +refreshToken');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid credentials', 401);
    }

    return this._generateTokens(user);
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.sub);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      return this._generateTokens(user);
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      throw new AppError('Authentication failed', 401);
    }
  }

  _generateTokens(user) {
    const accessToken = jwt.sign(
      { sub: user.id, roles: user.roles },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiration }
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiration }
    );

    user.refreshToken = refreshToken;
    user.save();

    return { accessToken, refreshToken };
  }
}