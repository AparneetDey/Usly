import momentService from '../services/moment.service.js';
import imageKitService from '../services/imagekit.service.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

/**
 * @desc    Create a new Moment
 * @route   POST /api/moments
 * @access  Private
 */
export const createMoment = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { media, caption, duration } = req.body;

  if (!media || !media.url || !media.fileId || !media.type) {
    throw new ApiError(400, 'Media URL, fileId, and type are required');
  }

  if (media.type === 'video' && Number(duration) > 30.5) {
    // If video duration exceeds limit, attempt to clean up orphaned ImageKit file
    if (media.fileId) {
      imageKitService.deleteFile(media.fileId).catch(() => {});
    }
    throw new ApiError(400, 'Videos must be 30 seconds or shorter');
  }

  try {
    const moment = await momentService.createMoment({
      createdBy: userId,
      media,
      caption,
      duration,
    });

    res.status(201).json(
      new ApiResponse(201, moment, 'Moment created successfully')
    );
  } catch (err) {
    // Attempt orphaned file cleanup on creation error
    if (media?.fileId) {
      imageKitService.deleteFile(media.fileId).catch(() => {});
    }
    throw new ApiError(400, err.message || 'Failed to create moment');
  }
});

/**
 * @desc    Get all active (unexpired) moments
 * @route   GET /api/moments
 * @access  Private
 */
export const getActiveMoments = asyncHandler(async (req, res) => {
  const moments = await momentService.getActiveMoments();
  res.status(200).json(
    new ApiResponse(200, moments, 'Active moments retrieved successfully')
  );
});

/**
 * @desc    Get single active moment by ID
 * @route   GET /api/moments/:id
 * @access  Private
 */
export const getMomentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const moment = await momentService.getMomentById(id);
    res.status(200).json(
      new ApiResponse(200, moment, 'Moment retrieved successfully')
    );
  } catch (err) {
    throw new ApiError(404, err.message || 'Moment not found');
  }
});

/**
 * @desc    Delete a moment (Creator only)
 * @route   DELETE /api/moments/:id
 * @access  Private
 */
export const deleteMoment = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;

  try {
    const result = await momentService.deleteMoment(id, userId);
    res.status(200).json(
      new ApiResponse(200, result, 'Moment deleted successfully')
    );
  } catch (err) {
    const statusCode = err.message?.includes('Unauthorized') ? 403 : 400;
    throw new ApiError(statusCode, err.message || 'Failed to delete moment');
  }
});

/**
 * @desc    Add or update reaction on a moment
 * @route   POST /api/moments/:id/reactions
 * @access  Private
 */
export const addOrUpdateReaction = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;
  const { reaction } = req.body;

  if (!reaction) {
    throw new ApiError(400, 'Reaction emoji is required');
  }

  try {
    const moment = await momentService.addOrUpdateReaction(id, userId, reaction);
    res.status(200).json(
      new ApiResponse(200, moment, 'Reaction added successfully')
    );
  } catch (err) {
    throw new ApiError(400, err.message || 'Failed to add reaction');
  }
});

/**
 * @desc    Remove reaction from a moment
 * @route   DELETE /api/moments/:id/reactions
 * @access  Private
 */
export const removeReaction = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;

  try {
    const moment = await momentService.removeReaction(id, userId);
    res.status(200).json(
      new ApiResponse(200, moment, 'Reaction removed successfully')
    );
  } catch (err) {
    throw new ApiError(400, err.message || 'Failed to remove reaction');
  }
});

/**
 * @desc    Add a comment to a moment
 * @route   POST /api/moments/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, 'Comment message is required');
  }

  try {
    const moment = await momentService.addComment(id, userId, message);
    res.status(201).json(
      new ApiResponse(201, moment, 'Comment added successfully')
    );
  } catch (err) {
    throw new ApiError(400, err.message || 'Failed to add comment');
  }
});

/**
 * @desc    Delete a comment from a moment
 * @route   DELETE /api/moments/:id/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { id, commentId } = req.params;

  try {
    const moment = await momentService.deleteComment(id, commentId, userId);
    res.status(200).json(
      new ApiResponse(200, moment, 'Comment deleted successfully')
    );
  } catch (err) {
    const statusCode = err.message?.includes('Unauthorized') ? 403 : 400;
    throw new ApiError(statusCode, err.message || 'Failed to delete comment');
  }
});
