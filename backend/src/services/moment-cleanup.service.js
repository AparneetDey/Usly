import Moment from '../models/moment.model.js';
import imageKitService from './imagekit.service.js';

/**
 * Sweeps the database for expired Moments, deletes their corresponding ImageKit media files,
 * and removes their MongoDB documents.
 */
export const cleanupExpiredMoments = async () => {
  try {
    const now = new Date();
    const expiredMoments = await Moment.find({ expiresAt: { $lte: now } });

    if (expiredMoments.length === 0) {
      return;
    }

    console.log(`[Moment Cleanup] Found ${expiredMoments.length} expired moment(s) to clean up.`);

    for (const moment of expiredMoments) {
      try {
        const fileId = moment.media?.fileId;
        let deleteOk = false;

        if (fileId) {
          const result = await imageKitService.deleteFile(fileId);
          // Consider cleanup successful if ImageKit deletion succeeds OR if file is already deleted/not found
          if (result.success || (result.error && result.error.includes('not found'))) {
            deleteOk = true;
          } else {
            console.error(`[Moment Cleanup] ImageKit deletion failed for moment ${moment._id} (fileId: ${fileId}): ${result.error}. Will retry on next cleanup cycle.`);
          }
        } else {
          // No fileId recorded, safe to remove document
          deleteOk = true;
        }

        if (deleteOk) {
          await Moment.deleteOne({ _id: moment._id });
          console.log(`[Moment Cleanup] Successfully cleaned up expired moment ${moment._id}.`);
        }
      } catch (err) {
        console.error(`[Moment Cleanup] Error processing expired moment ${moment._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[Moment Cleanup] Error during expired moments sweep:', error.message);
  }
};

/**
 * Starts periodic background cleanup interval for expired Moments
 * @param {number} intervalMs - Interval in milliseconds (default: 3 minutes)
 */
export const startMomentCleanupInterval = (intervalMs = 3 * 60 * 1000) => {
  // Run an immediate sweep on server startup
  cleanupExpiredMoments();

  // Schedule periodic background sweep
  const intervalId = setInterval(cleanupExpiredMoments, intervalMs);
  console.log(`[Moment Cleanup] Background cleanup scheduler initialized (Interval: ${intervalMs / 1000}s).`);

  return intervalId;
};

export default {
  cleanupExpiredMoments,
  startMomentCleanupInterval,
};
