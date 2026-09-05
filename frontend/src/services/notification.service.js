import api from './api.js';

class NotificationApiService {
  /**
   * Fetch notification feed (supports optional importance filter)
   */
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  /**
   * Fetch unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    if (typeof response?.unreadCount === 'number') return response.unreadCount;
    if (typeof response?.data?.unreadCount === 'number') return response.data.unreadCount;
    return 0;
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }

  /**
   * Get backend public VAPID key for Web Push registration
   */
  async getVapidPublicKey() {
    const response = await api.get('/notifications/vapid-key');
    return response.data?.publicKey || '';
  }

  /**
   * Register push subscription with backend
   */
  async subscribePush(subscription) {
    const response = await api.post('/notifications/push/subscribe', { subscription });
    return response.data;
  }

  /**
   * Remove push subscription from backend
   */
  async unsubscribePush(endpoint) {
    const response = await api.delete('/notifications/push/subscribe', { data: { endpoint } });
    return response.data;
  }

  /**
   * Delete all notifications for the current user
   */
  async deleteAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data;
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
}

export const notificationApiService = new NotificationApiService();
export default notificationApiService;
