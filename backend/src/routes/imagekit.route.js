import express from 'express';
import { getImageKitAuth } from '../controllers/imagekit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/imagekit/auth
 * @desc    Get ImageKit authentication parameters for client-side uploads
 * @access  Private (Protected by JWT auth middleware)
 */
router.get('/auth', protect, getImageKitAuth);

export default router;
