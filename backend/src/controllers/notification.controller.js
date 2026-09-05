import Notification from '../models/notification.model.js';
import Moment from '../models/moment.model.js';
import pushService from '../services/push.service.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

/**
 * @desc    Get public VAPID key for Web Push subscription
 * @route   GET /api/v1/notifications/vapid-key
 * @access  Private
 */
export const getVapidPublicKey = asyncHandler(async (req, res) => {
  const publicKey = pushService.getPublicKey();
  res.status(200).json(
    new ApiResponse(200, { publicKey }, 'Public VAPID key retrieved')
  );
});

/**
 * @desc    Get notifications feed for currently logged-in user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { limit = 30, importance } = req.query;

  const filter = { recipient: userId };
  if (importance && ['priority', 'informative', 'activity'].includes(importance)) {
    filter.importance = importance;
  }

  const notifications = await Notification.find(filter)
    .populate('actor', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Check and flag any notifications pointing to expired entities (e.g. Moments)
  const now = new Date();
  const momentIds = notifications
    .filter((n) => n.entityType === 'Moment' && n.entityId)
    .map((n) => n.entityId);

  let activeMomentIds = new Set();
  if (momentIds.length > 0) {
    const activeMoments = await Moment.find({
      _id: { $in: momentIds },
      expiresAt: { $gt: now },
    }).select('_id');
    activeMomentIds = new Set(activeMoments.map((m) => m._id.toString()));
  }

  const formattedNotifications = notifications.map((n) => {
    let isExpired = false;
    if (n.entityType === 'Moment' && n.entityId) {
      isExpired = !activeMomentIds.has(n.entityId.toString());
    }

    return {
      ...n,
      isExpired,
    };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      formattedNotifications,
      'Notifications retrieved successfully'
    )
  );
});

/**
 * @desc    Get unread notification count for current user
 * @route   GET /api/v1/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, 'Unread count retrieved')
  );
});

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  // Authorization: Only recipient can mark notification as read
  if (notification.recipient.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized to modify this notification');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  const populated = await Notification.findById(notification._id)
    .populate('actor', 'name avatar')
    .lean();

  res.status(200).json(
    new ApiResponse(200, populated, 'Notification marked as read')
  );
});

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications marked as read')
  );
});

/**
 * @desc    Save/update Web Push subscription for current user
 * @route   POST /api/v1/notifications/push/subscribe
 * @access  Private
 */
export const subscribePush = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { subscription } = req.body;
  const userAgent = req.headers['user-agent'] || '';

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new ApiError(400, 'Valid push subscription object is required');
  }

  const savedSubscription = await pushService.saveSubscription(
    userId,
    subscription,
    userAgent
  );

  res.status(200).json(
    new ApiResponse(
      200,
      savedSubscription,
      'Push subscription registered successfully'
    )
  );
});

/**
 * @desc    Unsubscribe Web Push for current user
 * @route   DELETE /api/v1/notifications/push/subscribe
 * @access  Private
 */
export const unsubscribePush = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;

  if (endpoint) {
    await pushService.removeSubscription(endpoint);
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Push subscription removed successfully')
  );
});

/**
 * @desc    Delete all notifications for current user
 * @route   DELETE /api/v1/notifications
 * @access  Private
 */
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  await Notification.deleteMany({ recipient: userId });

  res.status(200).json(
    new ApiResponse(200, null, 'All notifications deleted successfully')
  );
});

/**
 * @desc    Delete single notification by ID
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  // Authorization: Only recipient can delete their notification
  if (notification.recipient.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized to delete this notification');
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Notification deleted successfully')
  );
});
