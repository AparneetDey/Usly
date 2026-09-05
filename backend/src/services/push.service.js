import webpush from 'web-push';
import PushSubscription from '../models/push-subscription.model.js';

class PushService {
  constructor() {
    this.configured = false;
    this.initWebPush();
  }

  /**
   * Initializes web-push with server VAPID keys if provided
   */
  initWebPush() {
    const rawPublic = process.env.VAPID_PUBLIC_KEY || '';
    const rawPrivate = process.env.VAPID_PRIVATE_KEY || '';
    const publicKey = rawPublic.trim().replace(/^["']|["']$/g, '');
    const privateKey = rawPrivate.trim().replace(/^["']|["']$/g, '');
    const subject = (process.env.VAPID_SUBJECT || 'mailto:support@usly.app').trim().replace(/^["']|["']$/g, '');

    if (!publicKey || !privateKey) {
      console.warn(
        '⚠️ VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY missing in environment. Web Push notifications will be skipped.'
      );
      this.configured = false;
      return;
    }

    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
      console.log('✅ Web Push initialized successfully with VAPID keys.');
    } catch (error) {
      console.error('[PushService] VAPID configuration error:', error.message);
      this.configured = false;
    }
  }

  getPublicKey() {
    if (!this.configured) {
      this.initWebPush();
    }
    const rawPublic = process.env.VAPID_PUBLIC_KEY || '';
    return rawPublic.trim().replace(/^["']|["']$/g, '');
  }

  /**
   * Saves or updates a push subscription for a user
   */
  async saveSubscription(userId, subscription, userAgent = '') {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new Error('Invalid push subscription structure');
    }

    const { endpoint, keys } = subscription;

    return await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId,
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
        userAgent,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * Removes a subscription by endpoint (e.g. when un-subscribing or endpoint expires)
   */
  async removeSubscription(endpoint) {
    if (!endpoint) return;
    await PushSubscription.deleteOne({ endpoint });
    console.log(`[PushService] Removed subscription for endpoint: ${endpoint.substring(0, 30)}...`);
  }

  /**
   * Sends web push notification to all active devices for a given recipient user
   */
  async sendNotificationToUser(recipientId, payload) {
    if (!this.configured) {
      this.initWebPush();
      if (!this.configured) {
        console.warn(`[PushService] Skipping push to ${recipientId}: VAPID not configured.`);
        return { successCount: 0, failureCount: 0 };
      }
    }

    try {
      const subscriptions = await PushSubscription.find({ userId: recipientId });

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`[PushService] No push subscriptions found for user ${recipientId}.`);
        return { successCount: 0, failureCount: 0 };
      }

      const stringifiedPayload = JSON.stringify(payload);
      let successCount = 0;
      let failureCount = 0;

      for (const sub of subscriptions) {
        const pushSubscriptionObject = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscriptionObject, stringifiedPayload);
          successCount++;
        } catch (error) {
          failureCount++;
          console.error(
            `[PushService] Web Push failed for user ${recipientId} endpoint ${sub.endpoint.substring(0, 30)}...: Status ${error.statusCode || 'N/A'}`
          );

          // If subscription is expired (404 Not Found or 410 Gone), automatically clean it up
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log(`[PushService] Removing invalid/expired subscription: ${sub._id}`);
            await PushSubscription.deleteOne({ _id: sub._id });
          }
        }
      }

      console.log(
        `[PushService] Push dispatch completed for user ${recipientId}. Successes: ${successCount}, Failures: ${failureCount}`
      );
      return { successCount, failureCount };
    } catch (error) {
      console.error(`[PushService] Error during push notification dispatch:`, error.message);
      return { successCount: 0, failureCount: 0 };
    }
  }
}

export const pushService = new PushService();
export default pushService;
