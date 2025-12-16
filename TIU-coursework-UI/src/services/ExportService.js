// src/services/ExportService.js
import { createApiInstance, SERVICE_URLS } from './ApiService';

const exportApi = createApiInstance(SERVICE_URLS.EXPORT_SERVICE);

export const ExportService = {
  exportTable: async (id) => {
    return await exportApi.get(`/tables/${id}/export`, { responseType: 'blob' });
  },
};