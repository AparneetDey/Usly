import mongoose from 'mongoose';
import Complaint from '../models/complaint.model.js';
import notificationService from '../services/notification.service.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

const ALLOWED_CATEGORIES = [
  'food',
  'late',
  'ignored',
  'annoying',
  'serious',
  'funny',
  'other',
];

const ALLOWED_STATUSES = ['pending', 'seen', 'discussing', 'resolved'];

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private
 */
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, 'Title, description, and category are required');
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(
      400,
      `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`
    );
  }

  // createdBy MUST come strictly from authenticated req.user context
  const createdBy = req.user._id || req.user.id;

  const complaint = await Complaint.create({
    createdBy,
    title,
    description,
    category,
    status: 'pending',
  });

  const populatedComplaint = await Complaint.findById(complaint._id).populate(
    'createdBy',
    'name email avatar'
  );

  // Trigger non-blocking email notification to the recipient partner
  notificationService.notifyNewComplaint(populatedComplaint).catch((err) => {
    console.error('[createComplaint] Background notification error:', err.message);
  });

  res.status(201).json(
    new ApiResponse(201, populatedComplaint, 'Complaint submitted successfully')
  );
});

/**
 * @desc    Get all complaints sorted newest first (with optional status & category filters)
 * @route   GET /api/complaints
 * @access  Private
 */
export const getComplaints = asyncHandler(async (req, res) => {
  const { status, category } = req.query;

  const filter = {};
  if (status && ALLOWED_STATUSES.includes(status)) {
    filter.status = status;
  }
  if (category && ALLOWED_CATEGORIES.includes(category)) {
    filter.category = category;
  }

  const complaints = await Complaint.find(filter)
    .populate('createdBy', 'name email avatar')
    .populate('responses.userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, complaints, 'Complaints retrieved successfully')
  );
});

/**
 * @desc    Get a single complaint by ID with embedded responses (auto-marks pending as seen when opened by recipient)
 * @route   GET /api/complaints/:id
 * @access  Private
 */
export const getComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Complaint ID format');
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  const currentUserId = (req.user._id || req.user.id).toString();

  // If viewed by the receiving partner and status is pending, mark as 'seen'
  if (complaint.status === 'pending' && complaint.createdBy.toString() !== currentUserId) {
    complaint.status = 'seen';
    await complaint.save();
  }

  const populatedComplaint = await Complaint.findById(id)
    .populate('createdBy', 'name email avatar')
    .populate('responses.userId', 'name email avatar')
    .lean();

  res.status(200).json(
    new ApiResponse(200, populatedComplaint, 'Complaint retrieved successfully')
  );
});

/**
 * @desc    Update a complaint's details or status
 * @route   PATCH /api/complaints/:id
 * @access  Private
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Complaint ID format');
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  // Filter allowed fields (prevent overwriting createdBy or responses array directly)
  const allowedUpdates = ['title', 'description', 'category', 'status'];
  const updates = {};

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'category' && !ALLOWED_CATEGORIES.includes(req.body[field])) {
        throw new ApiError(400, `Invalid category: ${req.body[field]}`);
      }
      if (field === 'status' && !ALLOWED_STATUSES.includes(req.body[field])) {
        throw new ApiError(400, `Invalid status: ${req.body[field]}`);
      }
      updates[field] = req.body[field];
    }
  });

  const updatedComplaint = await Complaint.findByIdAndUpdate(id, updates, {
    returnDocument: 'after',
    runValidators: true,
  })
    .populate('createdBy', 'name email avatar')
    .populate('responses.userId', 'name email avatar');

  res.status(200).json(
    new ApiResponse(200, updatedComplaint, 'Complaint updated successfully')
  );
});

/**
 * @desc    Add an embedded response to a complaint (auto-transitions status to 'discussing')
 * @route   POST /api/complaints/:id/responses
 * @access  Private
 */
export const addResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Complaint ID format');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new ApiError(400, 'Response message is required');
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  // userId MUST come strictly from authenticated user context
  const currentUserId = req.user._id || req.user.id;

  complaint.responses.push({
    userId: currentUserId,
    message: message.trim(),
    createdAt: new Date(),
  });

  // Auto-transition status to 'discussing' when a response is added (unless already resolved)
  if (complaint.status === 'pending' || complaint.status === 'seen') {
    complaint.status = 'discussing';
  }

  await complaint.save();

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('createdBy', 'name email avatar')
    .populate('responses.userId', 'name email avatar');

  // Trigger Activity notification for complaint comment
  notificationService
    .notifyComplaintComment(populatedComplaint, currentUserId, message.trim())
    .catch((err) => {
      console.error('[addResponse] Background notification error:', err.message);
    });

  res.status(201).json(
    new ApiResponse(
      201,
      populatedComplaint,
      'Response added to complaint successfully'
    )
  );
});

/**
 * @desc    Mark a complaint as resolved
 * @route   PATCH /api/complaints/:id/resolve
 * @access  Private
 */
export const resolveComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Complaint ID format');
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  complaint.status = 'resolved';
  complaint.resolvedAt = new Date();
  await complaint.save();

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('createdBy', 'name email avatar')
    .populate('responses.userId', 'name email avatar');

  res.status(200).json(
    new ApiResponse(200, populatedComplaint, 'Complaint marked as resolved')
  );
});

/**
 * @desc    Delete a complaint (Creator only)
 * @route   DELETE /api/complaints/:id
 * @access  Private
 */
export const deleteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Complaint ID format');
  }

  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  const currentUserId = (req.user._id || req.user.id).toString();

  // Authorization: Only the complaint creator can delete it
  if (complaint.createdBy.toString() !== currentUserId) {
    throw new ApiError(403, 'Only the complaint creator can delete this complaint');
  }

  await Complaint.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Complaint deleted successfully')
  );
});
