import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiError, asyncHandler } from '../utils/index.js';

/**
 * Middleware to protect routes and verify JWT tokens.
 * Populates req.user with the authenticated user document.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no authentication token provided');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'usly_default_secret_key_change_in_production'
    );

    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      throw new ApiError(401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized, token validation failed');
  }
});
