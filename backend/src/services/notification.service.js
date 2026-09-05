import User from '../models/user.model.js';
import emailService from './email.service.js';
import { getNewLetterEmailTemplate } from '../templates/email/new-letter.template.js';
import { getNewComplaintEmailTemplate } from '../templates/email/new-complaint.template.js';
import { getEventReminderEmailTemplate } from '../templates/email/event-reminder.template.js';

class NotificationService {
  /**
   * Dispatches an email notification for an upcoming event reminder
   * @param {Object} params
   * @param {Object} params.event - Event document
   * @param {Object} params.recipient - User document (recipient)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async notifyEventReminder({ event, recipient }) {
    try {
      if (!event || !recipient || !recipient.email) {
        console.warn(`[NotificationService] Cannot send event reminder: Event or recipient email missing.`);
        return { success: false, error: 'Missing event or recipient email' };
      }

      const recipientName = recipient.name || 'Love';
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const eventUrl = `${frontendUrl.replace(/\/$/, '')}/calendar`;

      const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const { subject, html, text } = getEventReminderEmailTemplate({
        recipientName,
        eventTitle: event.title,
        eventDate: formattedDate,
        eventDescription: event.description || '',
        eventUrl,
      });

      const result = await emailService.sendEmail({
        to: recipient.email,
        subject,
        html,
        text,
      });

      return result;
    } catch (error) {
      console.error(`[NotificationService] Error dispatching event reminder for event ${event?._id} to ${recipient?.email}:`, error.message);
      return { success: false, error: error.message };
    }
  }
  /**
   * Dispatches an email notification when a letter is delivered to recipient
   * @param {Object} letter - Populated or raw Letter Mongoose document
   */
  async notifyNewLetter(letter) {
    try {
      if (!letter) return;

      const now = new Date();
      // If letter is scheduled for a future date, do NOT notify until delivered
      if (letter.scheduledFor && new Date(letter.scheduledFor) > now) {
        console.log(`[NotificationService] Letter ${letter._id} is scheduled for future (${letter.scheduledFor}). Notification deferred until delivery.`);
        return;
      }

      // Resolve recipient user details safely from DB
      const recipientId = letter.to?._id || letter.to;
      const recipient = typeof letter.to === 'object' && letter.to.email
        ? letter.to
        : await User.findById(recipientId);

      if (!recipient || !recipient.email) {
        console.warn(`[NotificationService] Cannot send letter notification: Recipient missing or has no email.`);
        return;
      }

      // Resolve sender user details
      const senderId = letter.from?._id || letter.from;
      const sender = typeof letter.from === 'object' && letter.from.name
        ? letter.from
        : await User.findById(senderId);

      const senderName = sender?.name || 'Your partner';
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const letterUrl = `${frontendUrl.replace(/\/$/, '')}/letters`;

      const { subject, html, text } = getNewLetterEmailTemplate({
        senderName,
        letterTitle: letter.title,
        letterUrl,
      });

      await emailService.sendEmail({
        to: recipient.email,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('[NotificationService] Error dispatching letter notification:', error.message);
    }
  }

  /**
   * Dispatches an email notification when a complaint is created
   * @param {Object} complaint - Populated or raw Complaint Mongoose document
   */
  async notifyNewComplaint(complaint) {
    try {
      if (!complaint) return;

      // Resolve creator user details
      const creatorId = complaint.createdBy?._id || complaint.createdBy;
      const creator = typeof complaint.createdBy === 'object' && complaint.createdBy.name
        ? complaint.createdBy
        : await User.findById(creatorId);

      const creatorName = creator?.name || 'Your partner';

      // Determine recipient: the other partner in Usly's 2-user system
      const recipientPartner = await User.findOne({ _id: { $ne: creatorId } });

      if (!recipientPartner || !recipientPartner.email) {
        console.warn(`[NotificationService] Cannot send complaint notification: Partner user missing or has no email.`);
        return;
      }

      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const complaintUrl = `${frontendUrl.replace(/\/$/, '')}/complaints`;

      const { subject, html, text } = getNewComplaintEmailTemplate({
        creatorName,
        complaintTitle: complaint.title,
        complaintUrl,
      });

      await emailService.sendEmail({
        to: recipientPartner.email,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error('[NotificationService] Error dispatching complaint notification:', error.message);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
