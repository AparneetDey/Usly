import express from 'express';
import { heartbeat, getPartnerPresence } from '../controllers/presence.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All presence endpoints require an authenticated user
router.use(protect);

/**
 * @route   POST /api/v1/presence/heartbeat
 * @desc    Record client heartbeat for authenticated user
 * @access  Private
 */
router.post('/heartbeat', heartbeat);

/**
 * @route   GET /api/v1/presence/partner
 * @desc    Get partner presence information
 * @access  Private
 */
router.get('/partner', getPartnerPresence);

export default router;
