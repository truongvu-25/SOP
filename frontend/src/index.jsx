import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

// 1. Cấu hình kết nối trực tiếp đến cổng Backend của Dev 1, Dev 2, Dev 3
axios.defaults.baseURL = 'http://localhost:8080';

// 2. Tự động đính kèm JWT Token (nếu có) từ localStorage vào mọi request 
axios.interceptors.request.use(
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);