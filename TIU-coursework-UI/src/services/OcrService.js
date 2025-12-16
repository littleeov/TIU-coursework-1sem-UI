// src/services/OcrService.js
import { createApiInstance, SERVICE_URLS } from './ApiService';

const ocrApi = createApiInstance(SERVICE_URLS.OCR_SERVICE);

export const OcrService = {
  recognize: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await ocrApi.post('/ocr/recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};