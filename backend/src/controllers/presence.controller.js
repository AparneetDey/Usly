import User from '../models/user.model.js';
import { PRESENCE_ONLINE_THRESHOLD_MS } from '../config/presence.config.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';

/**
 * @desc    Record client heartbeat and update user's lastSeenAt timestamp
 * @route   POST /api/v1/presence/heartbeat
 * @access  Private (Authenticated user only)
 */
export const heartbeat = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  // Perform an atomic, efficient update on lastSeenAt without loading or writing full user doc
  await User.updateOne(
    { _id: userId },
    { $set: { lastSeenAt: new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, { success: true }, 'Heartbeat recorded')
  );
});

/**
 * @desc    Get current user's partner presence (isOnline, lastSeenAt)
 * @route   GET /api/v1/presence/partner
 * @access  Private (Authenticated user only)
 */
export const getPartnerPresence = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const currentUser = req.user;

  // Resolve partner strictly via Usly relationship logic
  let partner = null;
  if (currentUser.partner) {
    partner = await User.findById(currentUser.partner).select('lastSeenAt');
  } else {
    partner = await User.findOne({ _id: { $ne: userId } }).select('lastSeenAt');
  }

  if (!partner) {
    return res.status(200).json(
      new ApiResponse(200, { isOnline: false, lastSeenAt: null }, 'No partner connected')
    );
  }

  const lastSeenAt = partner.lastSeenAt || null;
  const isOnline =
    lastSeenAt !== null &&
    Date.now() - new Date(lastSeenAt).getTime() <= PRESENCE_ONLINE_THRESHOLD_MS;

  // Return strictly presence fields (no emails, passwords, IDs or sensitive user data)
  res.status(200).json(
    new ApiResponse(
      200,
      {
        isOnline,
        lastSeenAt: lastSeenAt ? new Date(lastSeenAt).toISOString() : null,
      },
      'Partner presence retrieved'
    )
  );
});
