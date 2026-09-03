import Moment from '../models/moment.model.js';
import imageKitService from './imagekit.service.js';

class MomentService {
  /**
   * Create a new Moment
   */
  async createMoment({ createdBy, media, caption, duration = 0 }) {
    if (!media || !media.url || !media.fileId || !media.type) {
      throw new Error('Media URL, fileId, and type are required');
    }

    if (!['image', 'video'].includes(media.type)) {
      throw new Error('Media type must be image or video');
    }

    if (media.type === 'video' && Number(duration) > 30.5) {
      throw new Error('Video duration cannot exceed 30 seconds');
    }

    // Backend calculates 24-hour expiration strictly
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const moment = await Moment.create({
      createdBy,
      media: {
        url: media.url,
        fileId: media.fileId,
        type: media.type,
      },
      caption: caption ? caption.trim() : '',
      duration: Number(duration) || 0,
      createdAt,
      expiresAt,
    });

    return await Moment.findById(moment._id)
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }

  /**
   * Get all active (unexpired) moments
   */
  async getActiveMoments() {
    const now = new Date();
    return await Moment.find({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }

  /**
   * Get a single active moment by ID
   */
  async getMomentById(momentId) {
    const now = new Date();
    const moment = await Moment.findOne({ _id: momentId, expiresAt: { $gt: now } })
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');

    if (!moment) {
      throw new Error('Moment not found or has expired');
    }

    return moment;
  }

  /**
   * Creator deletes their own moment
   */
  async deleteMoment(momentId, userId) {
    const moment = await Moment.findById(momentId);

    if (!moment) {
      throw new Error('Moment not found');
    }

    if (moment.createdBy.toString() !== userId.toString()) {
      throw new Error('Unauthorized to delete this moment');
    }

    // Delete ImageKit media file
    if (moment.media?.fileId) {
      await imageKitService.deleteFile(moment.media.fileId).catch((err) => {
        console.error(`[MomentService] ImageKit file deletion error for ${moment.media.fileId}:`, err.message);
      });
    }

    await Moment.deleteOne({ _id: momentId });
    return { success: true, message: 'Moment deleted successfully' };
  }

  /**
   * Add or update user reaction on active moment
   */
  async addOrUpdateReaction(momentId, userId, reactionEmoji) {
    const now = new Date();
    const moment = await Moment.findOne({ _id: momentId, expiresAt: { $gt: now } });

    if (!moment) {
      throw new Error('Moment not found or has expired');
    }

    // Remove any existing reaction by this user
    moment.reactions = moment.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    // Add new reaction
    moment.reactions.push({
      userId,
      reaction: reactionEmoji,
      createdAt: new Date(),
    });

    await moment.save();

    return await Moment.findById(moment._id)
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }

  /**
   * Remove user reaction from active moment
   */
  async removeReaction(momentId, userId) {
    const now = new Date();
    const moment = await Moment.findOne({ _id: momentId, expiresAt: { $gt: now } });

    if (!moment) {
      throw new Error('Moment not found or has expired');
    }

    moment.reactions = moment.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    await moment.save();

    return await Moment.findById(moment._id)
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }

  /**
   * Add comment to active moment
   */
  async addComment(momentId, userId, message) {
    const now = new Date();
    const moment = await Moment.findOne({ _id: momentId, expiresAt: { $gt: now } });

    if (!moment) {
      throw new Error('Moment not found or has expired');
    }

    if (!message || !message.trim()) {
      throw new Error('Comment message cannot be empty');
    }

    moment.comments.push({
      userId,
      message: message.trim(),
      createdAt: new Date(),
    });

    await moment.save();

    return await Moment.findById(moment._id)
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }

  /**
   * Delete user comment from active moment
   */
  async deleteComment(momentId, commentId, userId) {
    const now = new Date();
    const moment = await Moment.findOne({ _id: momentId, expiresAt: { $gt: now } });

    if (!moment) {
      throw new Error('Moment not found or has expired');
    }

    const comment = moment.comments.id(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId.toString() !== userId.toString() && moment.createdBy.toString() !== userId.toString()) {
      throw new Error('Unauthorized to delete this comment');
    }

    moment.comments.pull(commentId);
    await moment.save();

    return await Moment.findById(moment._id)
      .populate('createdBy', 'name avatar')
      .populate('reactions.userId', 'name avatar')
      .populate('comments.userId', 'name avatar');
  }
}

export const momentService = new MomentService();
export default momentService;
