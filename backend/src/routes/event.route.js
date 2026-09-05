import express from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  triggerEventRemindersDev,
} from '../controllers/event.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all event routes with authentication middleware
router.use(protect);

/**
 * @route   POST /api/events/dev/trigger-reminders
 * @desc    Dev-only endpoint to manually trigger event reminder sweep
 * @access  Private (Dev only)
 */
router.post('/dev/trigger-reminders', triggerEventRemindersDev);

/**
 * @route   POST /api/events
 * @desc    Create a new calendar event
 * @access  Private
 */
router.post('/', createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all calendar events (sorted chronologically)
 * @access  Private
 */
router.get('/', getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Private
 */
router.get('/:id', getEvent);

/**
 * @route   PATCH /api/events/:id
 * @desc    Update an event by ID
 * @access  Private
 */
router.patch('/:id', updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event by ID
 * @access  Private
 */
router.delete('/:id', deleteEvent);

export default router;
