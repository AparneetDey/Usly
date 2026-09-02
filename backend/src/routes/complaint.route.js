import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  addResponse,
  resolveComplaint,
  deleteComplaint,
} from '../controllers/complaint.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all complaint routes with authentication middleware
router.use(protect);

/**
 * @route   POST /api/complaints
 * @desc    Submit a new complaint
 * @access  Private
 */
router.post('/', createComplaint);

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (sorted newest first, with filters)
 * @access  Private
 */
router.get('/', getComplaints);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by ID with embedded responses
 * @access  Private
 */
router.get('/:id', getComplaint);

/**
 * @route   PATCH /api/complaints/:id
 * @desc    Update complaint details or status
 * @access  Private
 */
router.patch('/:id', updateComplaint);

/**
 * @route   POST /api/complaints/:id/responses
 * @desc    Add an embedded response to a complaint
 * @access  Private
 */
router.post('/:id/responses', addResponse);

/**
 * @route   PATCH /api/complaints/:id/resolve
 * @desc    Mark complaint status as resolved
 * @access  Private
 */
router.patch('/:id/resolve', resolveComplaint);

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a complaint (Creator only)
 * @access  Private
 */
router.delete('/:id', deleteComplaint);

export default router;
