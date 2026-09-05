import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';
import { sendUpcomingEventReminders } from '../services/event-reminder.service.js';

/**
 * @desc    Create a new special date/calendar event
 * @route   POST /api/events
 * @access  Private
 */
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    type,
    startTime,
    endTime,
    isRecurring,
    recurrenceRule,
  } = req.body;

  if (!title || !date) {
    throw new ApiError(400, 'Event title and date are required');
  }

  // createdBy MUST strictly come from authenticated user context
  const createdBy = req.user._id || req.user.id;

  const event = await Event.create({
    title,
    description: description || '',
    date: new Date(date),
    type: type || 'special_day',
    createdBy,
    startTime: startTime || null,
    endTime: endTime || null,
    isRecurring: isRecurring || false,
    recurrenceRule: recurrenceRule || 'none',
  });

  const populatedEvent = await Event.findById(event._id).populate(
    'createdBy',
    'name email avatar'
  );

  res.status(201).json(
    new ApiResponse(201, populatedEvent, 'Event created successfully')
  );
});

/**
 * @desc    Get all events (sorted chronologically) with optional date filtering
 * @route   GET /api/events
 * @access  Private
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { year, month, startDate, endDate, type } = req.query;

  const queryFilter = {};

  if (type) {
    queryFilter.type = type;
  }

  if (startDate && endDate) {
    queryFilter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (year && month) {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10) - 1; // JS 0-indexed months
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    queryFilter.date = { $gte: start, $lte: end };
  } else if (year) {
    const y = parseInt(year, 10);
    const start = new Date(Date.UTC(y, 0, 1));
    const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    queryFilter.date = { $gte: start, $lte: end };
  }

  const events = await Event.find(queryFilter)
    .populate('createdBy', 'name email avatar')
    .sort({ date: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, events, 'Events retrieved successfully')
  );
});

/**
 * @desc    Get a single event by ID
 * @route   GET /api/events/:id
 * @access  Private
 */
export const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Event ID format');
  }

  const event = await Event.findById(id)
    .populate('createdBy', 'name email avatar')
    .lean();

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  res.status(200).json(
    new ApiResponse(200, event, 'Event retrieved successfully')
  );
});

/**
 * @desc    Update an event by ID
 * @route   PATCH /api/events/:id
 * @access  Private
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Event ID format');
  }

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Filter allowed fields (prevent overwriting createdBy or _id)
  const allowedUpdates = [
    'title',
    'description',
    'date',
    'type',
    'startTime',
    'endTime',
    'isRecurring',
    'recurrenceRule',
  ];

  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = field === 'date' ? new Date(req.body[field]) : req.body[field];
    }
  });

  const updatedEvent = await Event.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email avatar');

  res.status(200).json(
    new ApiResponse(200, updatedEvent, 'Event updated successfully')
  );
});

/**
 * @desc    Delete an event by ID
 * @route   DELETE /api/events/:id
 * @access  Private
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Event ID format');
  }

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  await Event.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Event deleted successfully')
  );
});

/**
 * @desc    Dev-only trigger for sending upcoming event reminders manually
 * @route   POST /api/events/dev/trigger-reminders
 * @access  Private (Dev only)
 */
export const triggerEventRemindersDev = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    throw new ApiError(403, 'Dev trigger endpoint is disabled in production environment');
  }

  const result = await sendUpcomingEventReminders();

  res.status(200).json(
    new ApiResponse(200, result, 'Dev event reminder check triggered successfully')
  );
});
