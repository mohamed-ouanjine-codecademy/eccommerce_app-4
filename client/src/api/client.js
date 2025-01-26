// client/src/api/client.js
import axios from 'axios';
import { showErrorToast } from '../utils/notifications';
import { renewAuthToken } from './auth';

const apiClient = axios.create({
  baseURL: '/api', // Use proxy instead of direct URL
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Version': '1.0.0'
  }
});

// Request interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (config.version) {
    config.url = `/v${config.version}${config.url}`;
    delete config.version;
  }
  
  return config;
}, error => Promise.reject(error));

// Response interceptor
apiClient.interceptors.response.use(response => response, async error => {
  const originalRequest = error.config;
  
  // Handle token refresh
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const newToken = await renewAuthToken();
      localStorage.setItem('accessToken', newToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      window.location = '/login';
      return Promise.reject(refreshError);
    }
  }

  // Unified error handling
  const errorMessage = error.response?.data?.error?.message || 
    error.message || 'Request failed';
  showErrorToast(errorMessage);
  
  return Promise.reject(error);
});

export const configureClient = (options = {}) => {
  return apiClient.create(options);
};

export default apiClient;