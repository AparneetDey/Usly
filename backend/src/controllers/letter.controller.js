import mongoose from 'mongoose';
import Letter from '../models/letter.model.js';
import User from '../models/user.model.js';
import notificationService from '../services/notification.service.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

/**
 * @desc    Create and send a new private letter (immediate or scheduled)
 * @route   POST /api/letters
 * @access  Private
 */
export const createLetter = asyncHandler(async (req, res) => {
  const { to, title, content, scheduledFor } = req.body;

  if (!to || !title || !content) {
    throw new ApiError(400, 'Recipient (to), title, and content are required');
  }

  if (!mongoose.Types.ObjectId.isValid(to)) {
    throw new ApiError(400, 'Invalid recipient User ID format');
  }

  // Sender MUST come strictly from authenticated req.user context
  const currentUserId = (req.user._id || req.user.id).toString();

  if (to.toString() === currentUserId) {
    throw new ApiError(400, 'You cannot send a letter to yourself');
  }

  // Ensure recipient exists
  const recipient = await User.findById(to);
  if (!recipient) {
    throw new ApiError(404, 'Recipient user not found');
  }

  const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;
  if (scheduledDate && isNaN(scheduledDate.getTime())) {
    throw new ApiError(400, 'Invalid scheduledFor date format');
  }

  const letter = await Letter.create({
    from: currentUserId,
    to,
    title,
    content,
    scheduledFor: scheduledDate,
  });

  const populatedLetter = await Letter.findById(letter._id).populate(
    'from to',
    'name email avatar'
  );

  // Trigger non-blocking email notification for delivered letters
  notificationService.notifyNewLetter(populatedLetter).catch((err) => {
    console.error('[createLetter] Background notification error:', err.message);
  });

  res.status(201).json(
    new ApiResponse(201, populatedLetter, 'Letter created successfully')
  );
});

/**
 * @desc    Get all letters received by the current user (hides content if scheduled for future)
 * @route   GET /api/letters/received
 * @access  Private
 */
export const getReceivedLetters = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id || req.user.id;
  const now = new Date();

  const letters = await Letter.find({ to: currentUserId })
    .populate('from', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  const formattedLetters = letters.map((letter) => {
    const isLocked =
      letter.scheduledFor && new Date(letter.scheduledFor) > now;

    if (isLocked) {
      const { content, ...metadata } = letter;
      return {
        ...metadata,
        isLocked: true,
      };
    }

    return {
      ...letter,
      isLocked: false,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      formattedLetters,
      'Received letters retrieved successfully'
    )
  );
});

/**
 * @desc    Get all letters sent by the current user
 * @route   GET /api/letters/sent
 * @access  Private
 */
export const getSentLetters = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id || req.user.id;
  const now = new Date();

  const letters = await Letter.find({ from: currentUserId })
    .populate('to', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  const formattedLetters = letters.map((letter) => ({
    ...letter,
    isLocked: letter.scheduledFor && new Date(letter.scheduledFor) > now,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      formattedLetters,
      'Sent letters retrieved successfully'
    )
  );
});

/**
 * @desc    Get a single letter by ID (hides content if recipient and scheduled for future)
 * @route   GET /api/letters/:id
 * @access  Private
 */
export const getLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Letter ID format');
  }

  const letter = await Letter.findById(id).populate('from to', 'name email avatar').lean();

  if (!letter) {
    throw new ApiError(404, 'Letter not found');
  }

  const currentUserId = (req.user._id || req.user.id).toString();
  const isSender = letter.from._id.toString() === currentUserId;
  const isRecipient = letter.to._id.toString() === currentUserId;

  if (!isSender && !isRecipient) {
    throw new ApiError(403, 'Not authorized to access this letter');
  }

  const now = new Date();
  const isLocked = isRecipient && letter.scheduledFor && new Date(letter.scheduledFor) > now;

  if (isLocked) {
    const { content, ...metadata } = letter;
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...metadata,
          isLocked: true,
          message: 'This letter is scheduled for a future date and remains locked.',
        },
        'Letter metadata retrieved (Content is locked)'
      )
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { ...letter, isLocked: false },
      'Letter retrieved successfully'
    )
  );
});

/**
 * @desc    Open a letter (Recipient only, marks as read and records openedAt)
 * @route   PATCH /api/letters/:id/open
 * @access  Private
 */
export const openLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Letter ID format');
  }

  const letter = await Letter.findById(id);

  if (!letter) {
    throw new ApiError(404, 'Letter not found');
  }

  const currentUserId = (req.user._id || req.user.id).toString();

  // Authorization: Only the recipient can open the letter
  if (letter.to.toString() !== currentUserId) {
    throw new ApiError(403, 'Only the recipient can open this letter');
  }

  const now = new Date();
  if (letter.scheduledFor && new Date(letter.scheduledFor) > now) {
    throw new ApiError(
      400,
      'Cannot open letter before its scheduled release date'
    );
  }

  if (!letter.isRead) {
    letter.isRead = true;
    letter.openedAt = now;
    await letter.save();
  }

  const populatedLetter = await Letter.findById(letter._id).populate(
    'from to',
    'name email avatar'
  );

  res.status(200).json(
    new ApiResponse(200, populatedLetter, 'Letter opened successfully')
  );
});

/**
 * @desc    Delete a letter (Sender only)
 * @route   DELETE /api/letters/:id
 * @access  Private
 */
export const deleteLetter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Letter ID format');
  }

  const letter = await Letter.findById(id);

  if (!letter) {
    throw new ApiError(404, 'Letter not found');
  }

  const currentUserId = (req.user._id || req.user.id).toString();

  // Authorization: Only the sender can delete the letter
  if (letter.from.toString() !== currentUserId) {
    throw new ApiError(403, 'Only the sender can delete this letter');
  }

  await Letter.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Letter deleted successfully')
  );
});
