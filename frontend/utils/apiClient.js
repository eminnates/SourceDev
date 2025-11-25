import axios from 'axios';

// In production (Vercel), use relative path to proxy through Next.js
// In development, use the full backend URL
const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is set and starts with /, use it as relative path (production)
  if (process.env.NEXT_PUBLIC_API_URL?.startsWith('/')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Otherwise use the full URL (development or if explicitly set)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api';
};

const API_URL = getApiUrl();

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.Message ||
      error.message ||
      'An error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default apiClient;
export { API_URL };

