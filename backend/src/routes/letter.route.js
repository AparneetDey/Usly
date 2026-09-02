import express from 'express';
import {
  createLetter,
  getReceivedLetters,
  getSentLetters,
  getLetter,
  openLetter,
  deleteLetter,
} from '../controllers/letter.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all letter routes with authentication middleware
router.use(protect);

/**
 * @route   POST /api/letters
 * @desc    Send a new letter
 * @access  Private
 */
router.post('/', createLetter);

/**
 * @route   GET /api/letters/received
 * @desc    Get all received letters (hides content if scheduled for future)
 * @access  Private
 * Note: Must be registered before GET /:id route to prevent route matching conflict
 */
router.get('/received', getReceivedLetters);

/**
 * @route   GET /api/letters/sent
 * @desc    Get all sent letters
 * @access  Private
 * Note: Must be registered before GET /:id route to prevent route matching conflict
 */
router.get('/sent', getSentLetters);

/**
 * @route   GET /api/letters/:id
 * @desc    Get a single letter by ID
 * @access  Private
 */
router.get('/:id', getLetter);

/**
 * @route   PATCH /api/letters/:id/open
 * @desc    Mark a letter as opened (Recipient only)
 * @access  Private
 */
router.patch('/:id/open', openLetter);

/**
 * @route   DELETE /api/letters/:id
 * @desc    Delete a letter (Sender only)
 * @access  Private
 */
router.delete('/:id', deleteLetter);

export default router;
