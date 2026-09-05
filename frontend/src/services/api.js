import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1` || 'https://usly-gold.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract response data and handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid/expired token from localStorage
      localStorage.removeItem('token');
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Session expired or unauthorized. Please log in again. 💜';

    return Promise.reject(new Error(message));
  }
);

export default api;
