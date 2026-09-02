import express from 'express';
import {
  register,
  login,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Max 2 users)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

export default router;
