import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import notificationService from './notification.service.js';

/**
 * Sweeps the database for events occurring tomorrow and dispatches 1-day-before email reminders
 * to both partners in Usly's private relationship app.
 */
export const sendUpcomingEventReminders = async () => {
  try {
    const now = new Date();
    console.log(`[Event Reminder] Checking upcoming event reminders... (Current time: ${now.toISOString()})`);

    // Determine tomorrow's local calendar day start (00:00:00) and end (23:59:59)
    const localTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const localTomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

    // Determine tomorrow's UTC calendar day start and end to prevent timezone mismatch
    const utcTomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const utcTomorrowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 23, 59, 59, 999));

    // Find all events occurring tomorrow (local or UTC bounds)
    const upcomingEvents = await Event.find({
      $or: [
        { date: { $gte: localTomorrowStart, $lte: localTomorrowEnd } },
        { date: { $gte: utcTomorrowStart, $lte: utcTomorrowEnd } },
      ],
    });

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log('[Event Reminder] No events occurring tomorrow.');
      return { processed: 0, sent: 0 };
    }

    console.log(`[Event Reminder] Found ${upcomingEvents.length} event(s) occurring tomorrow.`);

    // Retrieve all registered partners in Usly (private two-person application)
    const users = await User.find({ email: { $exists: true, $ne: '' } });

    if (!users || users.length === 0) {
      console.warn('[Event Reminder] No users found with valid email addresses.');
      return { processed: upcomingEvents.length, sent: 0 };
    }

    let totalSent = 0;

    for (const event of upcomingEvents) {
      console.log(`[Event Reminder] Processing reminder for event: "${event.title}" (ID: ${event._id}, Date: ${event.date})`);

      // Track already reminded user IDs for this event
      const remindedUserIds = new Set(
        (event.remindersSent || []).map((r) => r.userId?.toString())
      );

      for (const user of users) {
        const userIdStr = user._id.toString();

        // Skip if this partner has already received a reminder for this event
        if (remindedUserIds.has(userIdStr)) {
          console.log(`[Event Reminder] User ${user.email} already received reminder for event "${event.title}". Skipping.`);
          continue;
        }

        // Send Priority In-App & Push reminder to partner
        console.log(`[Event Reminder] Dispatching In-App & Push reminder for event "${event.title}" to user ${user._id}...`);
        const result = await notificationService.notifyEventReminder({
          event,
          recipient: user,
        });

        if (result && result.success) {
          totalSent++;
          console.log(`[Event Reminder] Successfully dispatched reminder for "${event.title}" to user ${user._id}.`);

          // Atomically update event document with this partner's reminder status to prevent duplicates
          await Event.updateOne(
            { _id: event._id },
            {
              $addToSet: {
                remindersSent: {
                  userId: user._id,
                  sentAt: new Date(),
                },
              },
            }
          );
        } else {
          console.error(`[Event Reminder] Failed to dispatch reminder for "${event.title}" to user ${user._id}: ${result?.error || 'Unknown error'}. Will retry on next scheduler run.`);
        }
      }
    }

    console.log(`[Event Reminder] Event reminder sweep completed. Dispatched ${totalSent} reminder(s).`);
    return { processed: upcomingEvents.length, sent: totalSent };
  } catch (error) {
    console.error('[Event Reminder] Error during event reminder sweep:', error.message);
    return { processed: 0, sent: 0, error: error.message };
  }
};

let schedulerIntervalId = null;

/**
 * Starts periodic background scheduler for event reminders
 * @param {number} intervalMs - Check interval in ms (default: 1 hour)
 */
export const startEventReminderScheduler = (intervalMs = 60 * 60 * 1000) => {
  if (schedulerIntervalId) {
    console.log('[Event Reminder] Scheduler already running.');
    return schedulerIntervalId;
  }

  // Run an immediate check on startup
  sendUpcomingEventReminders();

  // Schedule periodic checks
  schedulerIntervalId = setInterval(sendUpcomingEventReminders, intervalMs);
  console.log(`[Event Reminder] Background scheduler initialized (Interval: ${intervalMs / 1000}s).`);

  return schedulerIntervalId;
};

/**
 * Stops background scheduler gracefully
 */
export const stopEventReminderScheduler = () => {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    console.log('[Event Reminder] Background scheduler stopped.');
  }
};

export default {
  sendUpcomingEventReminders,
  startEventReminderScheduler,
  stopEventReminderScheduler,
};
