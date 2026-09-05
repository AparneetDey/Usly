import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import pushService from './push.service.js';
import { ApiError } from '../utils/index.js';

export const MISS_YOU_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown

class NotificationService {
  /**
   * Core method to create an In-App notification and dispatch Web Push if required
   */
  async createNotification({
    recipient,
    actor = null,
    type,
    importance = 'activity',
    title,
    message,
    entityType = null,
    entityId = null,
    details = null,
    sendPush = false,
    url = '/',
  }) {
    try {
      // Avoid notifying users about their own actions
      if (
        actor &&
        recipient &&
        actor.toString() === recipient.toString()
      ) {
        return null;
      }

      // 1. Create In-App Notification in MongoDB
      const notificationData = {
        recipient,
        actor,
        type,
        importance,
        title,
        message,
        entityType,
        entityId,
        isRead: false,
      };

      if (details) {
        notificationData.details = details;
      }

      const notification = await Notification.create(notificationData);

      const populatedNotification = await Notification.findById(notification._id)
        .populate('actor', 'name avatar')
        .lean();

      // 2. Dispatch Web Push if sendPush is true or if notification is priority or informative
      const shouldPush = sendPush || importance === 'priority' || importance === 'informative';
      if (shouldPush) {
        const resolvedUrl = url === '/' && importance === 'informative'
          ? `/?notificationId=${notification._id}`
          : url;

        const pushTitle = title.trim().toLowerCase().startsWith('usly')
          ? title.trim()
          : `Usly • ${title.trim()}`;

        const pushPayload = {
          title: pushTitle,
          body: message,
          icon: '/usly-logo.png',
          badge: '/usly-logo.png',
          url: resolvedUrl,
          data: {
            notificationId: notification._id,
            importance,
            type,
            entityType,
            entityId,
            url: resolvedUrl,
          },
        };

        // Fire-and-forget push dispatch (does not block core flow or fail DB record)
        pushService.sendNotificationToUser(recipient, pushPayload).catch((err) => {
          console.error('[NotificationService] Push dispatch warning:', err.message);
        });
      }

      return populatedNotification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  }

  /**
   * Helper: Resolve user's partner ID in Usly's 2-user system
   */
  async getPartnerId(userId) {
    const user = await User.findById(userId);
    if (user?.partner) return user.partner;

    const partner = await User.findOne({ _id: { $ne: userId } });
    return partner?._id || null;
  }

  /**
   * Priority: Letter Received (In-App: YES, Push: YES, Email: NO)
   */
  async notifyNewLetter(letter) {
    try {
      if (!letter) return;
      const now = new Date();
      if (letter.scheduledFor && new Date(letter.scheduledFor) > now) {
        return; // Deferred until delivery
      }

      const recipientId = letter.to?._id || letter.to;
      const senderId = letter.from?._id || letter.from;
      const senderName = letter.from?.name || (await User.findById(senderId))?.name || 'Your partner';

      await this.createNotification({
        recipient: recipientId,
        actor: senderId,
        type: 'LETTER_RECEIVED',
        importance: 'priority',
        title: '💌 New Letter',
        message: `You received a new letter from ${senderName}.`,
        entityType: 'Letter',
        entityId: letter._id,
        sendPush: true,
        url: '/letters',
      });
    } catch (error) {
      console.error('[NotificationService] notifyNewLetter error:', error.message);
    }
  }

  /**
   * Priority: Complaint Filed (In-App: YES, Push: YES, Email: NO)
   */
  async notifyNewComplaint(complaint) {
    try {
      if (!complaint) return;
      const creatorId = complaint.createdBy?._id || complaint.createdBy;
      const creatorName = complaint.createdBy?.name || (await User.findById(creatorId))?.name || 'Your partner';
      const recipientId = await this.getPartnerId(creatorId);

      if (!recipientId) return;

      await this.createNotification({
        recipient: recipientId,
        actor: creatorId,
        type: 'COMPLAINT_FILED',
        importance: 'priority',
        title: 'Important',
        message: `${creatorName} filed a complaint.`,
        entityType: 'Complaint',
        entityId: complaint._id,
        sendPush: true,
        url: '/complaints',
      });
    } catch (error) {
      console.error('[NotificationService] notifyNewComplaint error:', error.message);
    }
  }

  /**
   * Priority: Event Reminder (In-App: YES, Push: YES, Email: NO)
   */
  async notifyEventReminder({ event, recipient }) {
    try {
      if (!event || !recipient) return { success: false, error: 'Missing parameters' };
      const recipientId = recipient._id || recipient;

      await this.createNotification({
        recipient: recipientId,
        actor: null,
        type: 'EVENT_REMINDER',
        importance: 'priority',
        title: '📅 Event Tomorrow',
        message: `Your ${event.title} is tomorrow.`,
        entityType: 'Event',
        entityId: event._id,
        sendPush: true,
        url: '/calendar',
      });

      return { success: true };
    } catch (error) {
      console.error('[NotificationService] notifyEventReminder error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Activity: Partner Added Event (In-App: YES, Push: NO, Email: NO)
   */
  async notifyEventAdded(event) {
    try {
      if (!event) return;
      const creatorId = event.createdBy?._id || event.createdBy;
      const creatorName = event.createdBy?.name || (await User.findById(creatorId))?.name || 'Your partner';
      const recipientId = await this.getPartnerId(creatorId);

      if (!recipientId) return;

      await this.createNotification({
        recipient: recipientId,
        actor: creatorId,
        type: 'EVENT_ADDED',
        importance: 'activity',
        title: 'Event Added',
        message: `${creatorName} added a new event: "${event.title}"`,
        entityType: 'Event',
        entityId: event._id,
        sendPush: false,
        url: '/calendar',
      });
    } catch (error) {
      console.error('[NotificationService] notifyEventAdded error:', error.message);
    }
  }

  /**
   * Activity: Complaint Comment/Response (In-App: YES, Push: NO, Email: NO)
   */
  async notifyComplaintComment(complaint, responderId, responseMessage) {
    try {
      if (!complaint) return;
      const creatorId = complaint.createdBy?._id || complaint.createdBy;
      const responder = await User.findById(responderId);
      const responderName = responder?.name || 'Your partner';

      // Send to the other user involved in the complaint
      const recipientId =
        responderId.toString() === creatorId.toString()
          ? await this.getPartnerId(creatorId)
          : creatorId;

      if (!recipientId) return;

      await this.createNotification({
        recipient: recipientId,
        actor: responderId,
        type: 'COMPLAINT_COMMENTED',
        importance: 'activity',
        title: 'Complaint Comment',
        message: `${responderName} commented on "${complaint.title}"`,
        entityType: 'Complaint',
        entityId: complaint._id,
        sendPush: false,
        url: '/complaints',
      });
    } catch (error) {
      console.error('[NotificationService] notifyComplaintComment error:', error.message);
    }
  }

  /**
   * Activity: Moment Reaction (In-App: YES, Push: NO, Email: NO)
   */
  async notifyMomentReaction({ moment, reactorId, emoji }) {
    try {
      if (!moment) return;
      const creatorId = moment.createdBy?._id || moment.createdBy;
      if (reactorId.toString() === creatorId.toString()) return; // Don't notify self

      const reactor = await User.findById(reactorId);
      const reactorName = reactor?.name || 'Your partner';

      await this.createNotification({
        recipient: creatorId,
        actor: reactorId,
        type: 'MOMENT_REACTION',
        importance: 'activity',
        title: 'Moment Reaction',
        message: `${reactorName} reacted ${emoji} to your Moment.`,
        entityType: 'Moment',
        entityId: moment._id,
        sendPush: false,
        url: '/',
      });
    } catch (error) {
      console.error('[NotificationService] notifyMomentReaction error:', error.message);
    }
  }

  /**
   * Activity: Moment Comment (In-App: YES, Push: NO, Email: NO)
   */
  async notifyMomentComment({ moment, commenterId, message }) {
    try {
      if (!moment) return;
      const creatorId = moment.createdBy?._id || moment.createdBy;
      if (commenterId.toString() === creatorId.toString()) return; // Don't notify self

      const commenter = await User.findById(commenterId);
      const commenterName = commenter?.name || 'Your partner';
      const snippet = message.length > 30 ? `${message.substring(0, 30)}...` : message;

      await this.createNotification({
        recipient: creatorId,
        actor: commenterId,
        type: 'MOMENT_COMMENT',
        importance: 'activity',
        title: 'Moment Comment',
        message: `${commenterName} commented: "${snippet}"`,
        entityType: 'Moment',
        entityId: moment._id,
        sendPush: false,
        url: '/',
      });
    } catch (error) {
      console.error('[NotificationService] notifyMomentComment error:', error.message);
    }
  }

  /**
   * Informative: Usly Product & Feature Updates (In-App: YES, Push: YES, Email: NO)
   * Sends an informative update to both users (or specified recipients).
   */
  async createInformativeNotification({
    title,
    message,
    details = null,
    recipients = null,
  }) {
    try {
      if (!title || !message) {
        throw new Error('Title and message are required for informative notifications');
      }

      // Resolve target recipients
      let targetRecipientIds = [];
      if (Array.isArray(recipients) && recipients.length > 0) {
        targetRecipientIds = recipients.map((r) => (r._id || r).toString());
      } else if (recipients) {
        targetRecipientIds = [(recipients._id || recipients).toString()];
      } else {
        // Default: send to all active Usly relationship users
        const users = await User.find({}, '_id').lean();
        targetRecipientIds = users.map((u) => u._id.toString());
      }

      if (targetRecipientIds.length === 0) {
        console.warn('[NotificationService] No recipients found for informative notification.');
        return [];
      }

      const createdNotifications = [];
      for (const recipientId of targetRecipientIds) {
        const notification = await this.createNotification({
          recipient: recipientId,
          actor: null,
          type: 'USLY_UPDATE',
          importance: 'informative',
          title,
          message,
          entityType: null,
          entityId: null,
          details,
          sendPush: true,
          url: '/',
        });

        if (notification) {
          createdNotifications.push(notification);
        }
      }

      return createdNotifications;
    } catch (error) {
      console.error('[NotificationService] createInformativeNotification error:', error.message);
      return [];
    }
  }

  /**
   * Alias for createInformativeNotification
   */
  async createUslyUpdateNotification(params) {
    return this.createInformativeNotification(params);
  }

  /**
   * Priority: "I Miss You" emotional ping
   * (In-App: YES, Push: YES, Email: NO)
   */
  async notifyMissYou(senderId) {
    const sender = await User.findById(senderId).select('name avatar');
    if (!sender) {
      throw new ApiError(404, 'Sender user not found');
    }

    const recipientId = await this.getPartnerId(senderId);
    if (!recipientId) {
      throw new ApiError(400, 'You must be connected with a partner in Usly to send an "I miss you".');
    }

    // Server-side cooldown check
    const lastMissYou = await Notification.findOne({
      actor: senderId,
      recipient: recipientId,
      type: 'I_MISS_YOU',
    }).sort({ createdAt: -1 });

    if (lastMissYou) {
      const elapsed = Date.now() - new Date(lastMissYou.createdAt).getTime();
      if (elapsed < MISS_YOU_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((MISS_YOU_COOLDOWN_MS - elapsed) / 1000);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        throw new ApiError(
          429,
          `You already sent an "I miss you" recently. You can send another in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        );
      }
    }

    const senderName = sender.name || 'Your partner';

    const notification = await this.createNotification({
      recipient: recipientId,
      actor: senderId,
      type: 'I_MISS_YOU',
      importance: 'priority',
      title: `${senderName} misses you 💜`,
      message: `They just sent you an "I miss you."`,
      entityType: null,
      entityId: null,
      sendPush: true,
      url: '/',
    });

    return {
      notification,
      cooldownSeconds: Math.ceil(MISS_YOU_COOLDOWN_MS / 1000),
      cooldownEndsAt: new Date(Date.now() + MISS_YOU_COOLDOWN_MS).toISOString(),
    };
  }

  /**
   * Check "I Miss You" cooldown status for current user
   */
  async getMissYouStatus(senderId) {
    const recipientId = await this.getPartnerId(senderId);
    if (!recipientId) {
      return {
        canSend: false,
        remainingSeconds: 0,
        reason: 'No partner connected',
      };
    }

    const lastMissYou = await Notification.findOne({
      actor: senderId,
      recipient: recipientId,
      type: 'I_MISS_YOU',
    }).sort({ createdAt: -1 });

    if (!lastMissYou) {
      return {
        canSend: true,
        remainingSeconds: 0,
        lastSentAt: null,
      };
    }

    const elapsed = Date.now() - new Date(lastMissYou.createdAt).getTime();
    if (elapsed < MISS_YOU_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((MISS_YOU_COOLDOWN_MS - elapsed) / 1000);
      return {
        canSend: false,
        remainingSeconds,
        lastSentAt: lastMissYou.createdAt,
        cooldownEndsAt: new Date(new Date(lastMissYou.createdAt).getTime() + MISS_YOU_COOLDOWN_MS).toISOString(),
      };
    }

    return {
      canSend: true,
      remainingSeconds: 0,
      lastSentAt: lastMissYou.createdAt,
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
