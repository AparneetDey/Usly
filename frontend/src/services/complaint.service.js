import api from './api.js';

export const complaintService = {
  getComplaints: async (params = {}) => {
    const response = await api.get('/complaints', { params });
    return response.data;
  },

  getComplaint: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  updateComplaint: async (id, complaintData) => {
    const response = await api.patch(`/complaints/${id}`, complaintData);
    return response.data;
  },

  addResponse: async (id, message) => {
    const response = await api.post(`/complaints/${id}/responses`, { message });
    return response.data;
  },

  resolveComplaint: async (id) => {
    const response = await api.patch(`/complaints/${id}/resolve`);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export default complaintService;
