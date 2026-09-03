import api from './api.js';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getPartnerDetails: async () => {
    const response = await api.get('/auth/partner');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/me', profileData);
    return response.data;
  },

  requestEmailChange: async ({ newEmail, currentPassword }) => {
    const response = await api.post('/auth/change-email/request', {
      newEmail,
      currentPassword,
    });
    return response.data;
  },

  verifyEmailChange: async (token) => {
    const response = await api.post('/auth/change-email/verify', { token });
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  getImageKitAuth: async () => {
    const response = await api.get('/imagekit/auth');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network logout errors
    } finally {
      localStorage.removeItem('token');
    }
  },
};

export default authService;
