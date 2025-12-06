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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Login sayfasında isek redirect yapma
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Hata mesajını çeşitli kaynaklardan al
    let errorMessage = 'An error occurred';
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // Backend'den dönen hata mesajı (camelCase veya PascalCase)
      errorMessage = data.message || 
                     data.Message || 
                     data.error ||
                     data.Error;
      
      // ModelState veya validation hataları için
      if (!errorMessage && data.errors) {
        const errorMessages = Object.values(data.errors).flat();
        errorMessage = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : errorMessage;
      }
      
      // FluentValidation hataları için
      if (!errorMessage && Array.isArray(data.errors)) {
        errorMessage = data.errors.map(e => e.message || e).join(', ');
      }
    }
    
    // Eğer hala mesaj yoksa, axios'un varsayılan mesajını kullan
    if (!errorMessage || errorMessage === 'An error occurred') {
      errorMessage = error.message || errorMessage;
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      response: error.response
    });
  }
);

export default apiClient;
export { API_URL };

