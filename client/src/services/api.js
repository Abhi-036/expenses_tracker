import axios from 'axios';

const api = axios.create({
  // Local development uses VITE_API_URL from client/.env.
  // Production uses the same-origin /api path routed by Vercel Services.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (err) =>
  err.response?.data?.message ||
  err.message ||
  'Something went wrong. Please try again.';

export default api;
