import api from './api.js';

export const momentService = {
  getActiveMoments: async () => {
    const response = await api.get('/moments');
    return response.data || response;
  },

  getMoment: async (id) => {
    const response = await api.get(`/moments/${id}`);
    return response.data || response;
  },

  createMoment: async ({ media, caption, duration }) => {
    const response = await api.post('/moments', {
      media,
      caption,
      duration,
    });
    return response.data || response;
  },

  deleteMoment: async (id) => {
    const response = await api.delete(`/moments/${id}`);
    return response.data || response;
  },

  addReaction: async (id, reaction) => {
    const response = await api.post(`/moments/${id}/reactions`, { reaction });
    return response.data || response;
  },

  removeReaction: async (id) => {
    const response = await api.delete(`/moments/${id}/reactions`);
    return response.data || response;
  },

  addComment: async (id, message) => {
    const response = await api.post(`/moments/${id}/comments`, { message });
    return response.data || response;
  },

  deleteComment: async (id, commentId) => {
    const response = await api.delete(`/moments/${id}/comments/${commentId}`);
    return response.data || response;
  },
};

export default momentService;
