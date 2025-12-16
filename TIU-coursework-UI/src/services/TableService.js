// src/services/TableService.js
import { createApiInstance, SERVICE_URLS } from './ApiService';

const tableApi = createApiInstance(SERVICE_URLS.TABLE_STORAGE_SERVICE);

export const TableService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await tableApi.post('/tables', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  search: async (query) => {
    return await tableApi.get('/tables', { params: { name_like: query } });
  },

  delete: async (id) => {
    return await tableApi.delete(`/tables/${id}`);
  },

  // exportTable: async (id) => {
  //   return await tableApi.get(`/tables/${id}/export`, { responseType: 'blob' });
  // },
};