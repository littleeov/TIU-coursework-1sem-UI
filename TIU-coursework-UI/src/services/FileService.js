// src/services/FileService.js
import { createApiInstance, SERVICE_URLS } from './ApiService';

const fileApi = createApiInstance(SERVICE_URLS.FILE_STORAGE_SERVICE);

export const FileService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await fileApi.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  search: async (query) => {
    // Важно: передаём параметр name_like как часть params
    return await fileApi.get('/files', { params: { name_like: query } });
  },

  delete: async (id) => {
    return await fileApi.delete(`/files/${id}`);
  },

  save: async (id) => {
    return await fileApi.post(`/files/${id}/save`);
  },
};