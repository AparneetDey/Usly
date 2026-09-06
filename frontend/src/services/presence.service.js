import api from './api.js';

class PresenceApiService {
  /**
   * Send heartbeat to update authenticated user's lastSeenAt timestamp
   * Catches errors silently to avoid disrupting user experience during transient network issues
   */
  async sendHeartbeat() {
    try {
      const response = await api.post('/presence/heartbeat');
      return response.data || response;
    } catch {
      return null;
    }
  }

  /**
   * Fetch current partner presence status ({ isOnline, lastSeenAt })
   */
  async getPartnerPresence() {
    try {
      const response = await api.get('/presence/partner');
      return response.data || response;
    } catch {
      return null;
    }
  }
}

export const presenceApiService = new PresenceApiService();
export default presenceApiService;
