import express from 'express';
import {
  createMoment,
  getActiveMoments,
  getMomentById,
  deleteMoment,
  addOrUpdateReaction,
  removeReaction,
  addComment,
  deleteComment,
} from '../controllers/moment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all moment routes with authentication middleware
router.use(protect);

/**
 * @route   POST /api/moments
 * @desc    Create a new moment
 * @access  Private
 */
router.post('/', createMoment);

/**
 * @route   GET /api/moments
 * @desc    Get active unexpired moments
 * @access  Private
 */
router.get('/', getActiveMoments);

/**
 * @route   GET /api/moments/:id
 * @desc    Get single active moment by ID
 * @access  Private
 */
router.get('/:id', getMomentById);

/**
 * @route   DELETE /api/moments/:id
 * @desc    Delete a moment by ID
 * @access  Private
 */
router.delete('/:id', deleteMoment);

/**
 * @route   POST /api/moments/:id/reactions
 * @desc    Add or update reaction on a moment
 * @access  Private
 */
router.post('/:id/reactions', addOrUpdateReaction);

/**
 * @route   DELETE /api/moments/:id/reactions
 * @desc    Remove reaction from a moment
 * @access  Private
 */
router.delete('/:id/reactions', removeReaction);

/**
 * @route   POST /api/moments/:id/comments
 * @desc    Add a comment to a moment
 * @access  Private
 */
router.post('/:id/comments', addComment);

/**
 * @route   DELETE /api/moments/:id/comments/:commentId
 * @desc    Delete a comment from a moment
 * @access  Private
 */
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
