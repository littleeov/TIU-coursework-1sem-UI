// src/services/ApiService.js
import axios from 'axios';

// Вместо process.env.VUE_APP_... используем window для доступа к переменным
// Это работает, если ты используешь Vite
const SERVICE_URLS = {
  FILE_STORAGE_SERVICE: import.meta.env.VUE_APP_FILE_STORAGE_SERVICE_URL || 'http://localhost:3000',
  TABLE_STORAGE_SERVICE: import.meta.env.VUE_APP_TABLE_STORAGE_SERVICE_URL || 'http://localhost:3001',
  OCR_SERVICE: import.meta.env.VUE_APP_OCR_SERVICE_URL || 'http://localhost:3002',
  EXPORT_SERVICE: import.meta.env.VUE_APP_EXPORT_SERVICE_URL || 'http://localhost:3003',
};

const createApiInstance = (baseUrl) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export { SERVICE_URLS, createApiInstance };