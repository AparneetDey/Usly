import api from './api.js';

export const letterService = {
  getReceivedLetters: async () => {
    const response = await api.get('/letters/received');
    return response.data;
  },

  getSentLetters: async () => {
    const response = await api.get('/letters/sent');
    return response.data;
  },

  getLetter: async (id) => {
    const response = await api.get(`/letters/${id}`);
    return response.data;
  },

  createLetter: async (letterData) => {
    const response = await api.post('/letters', letterData);
    return response.data;
  },

  openLetter: async (id) => {
    const response = await api.patch(`/letters/${id}/open`);
    return response.data;
  },

  deleteLetter: async (id) => {
    const response = await api.delete(`/letters/${id}`);
    return response.data;
  },
};

export default letterService;
