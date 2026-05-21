import axios from 'axios';

const API_URL = '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Chi redirect neu token thuc su het han (khong co token)
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Neu co token ma van 401 -> khong redirect, de component xu ly
    }
    return Promise.reject(error);
  }
);

export default apiClient;
