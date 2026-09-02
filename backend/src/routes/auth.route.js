import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  getPartnerDetails,
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
 * @desc    Authenticate user, set HTTP-only cookie & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear auth cookie
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   GET /api/auth/partner
 * @desc    Get partner details for logged in user
 * @access  Private
 */
router.get('/partner', protect, getPartnerDetails);

export default router;
