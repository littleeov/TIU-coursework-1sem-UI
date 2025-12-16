<template>
  <div id="app">
    <!-- Header -->
    <header>
      <div class="logo">Информационная система по управлению документами</div>
    </header>

    <div class="container">
      <!-- Controls Row -->
      <div class="controls-row">
        <div class="left-controls">
          <div class="toggle-container">
            <div 
              class="toggle-btn" 
              :class="{ active: mode === 'file' }"
              @click="switchMode('file')"
            >
              Файл
            </div>
            <div 
              class="toggle-btn" 
              :class="{ active: mode === 'table' }"
              @click="switchMode('table')"
            >
              Таблица
            </div>
          </div>
        </div>

        <button class="action-btn" @click="showOcrForm = true">Распознать текст</button>
      </div>

      <!-- Action Buttons Row -->
      <div class="main-actions">
        <button class="action-btn" @click="openSearchForm">
          {{ mode === 'file' ? 'Поиск файла' : 'Поиск таблицы' }}
        </button>
        <button class="action-btn" @click="openUploadForm">
          {{ mode === 'file' ? 'Загрузка файла' : 'Загрузка таблицы' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main style="flex: 1;">
      <div class="info-block">
        <div class="hidden-buttons">
          <button 
            class="hidden-btn save-btn" 
            :class="{ show: selectedFile }"
            @click="openSaveForm"
          >
            {{ mode === 'file' ? 'Сохранить' : 'Экспортировать' }}
          </button>
          <button 
            class="hidden-btn delete-btn" 
            :class="{ show: selectedFile }"
            @click="openDeleteForm"
          >
            Удалить
          </button>
        </div>

        <div v-if="searchResults.length > 0" class="file-list">
          <h3>{{ mode === 'file' ? 'Найденные файлы:' : 'Найденные таблицы:' }}</h3>
          <div 
            v-for="(item, index) in searchResults" 
            :key="index" 
            class="file-item" 
            :class="{ selected: selectedFile && selectedFile.id === item.id }"
            @click="selectItem(item)"
          >
            <div class="file-info">
              <p><strong>Имя:</strong> {{ item.name }}</p>
              <p><strong>Дата:</strong> {{ item.date }}</p>
              <p><strong>Размер:</strong> {{ item.size }}</p>
            </div>
            <div class="file-actions">
              <button class="action-btn" @click.stop="selectAndSave(item)">
                {{ mode === 'file' ? 'Сохранить' : 'Экспортировать' }}
              </button>
              <button class="action-btn" @click.stop="selectAndDelete(item)">Удалить</button>
            </div>
          </div>
        </div>

        <div v-if="searchResults.length === 0 && lastSearchResult" class="result-info">
          <h3>{{ mode === 'file' ? 'Найден файл:' : 'Найдена таблица:' }}</h3>
          <p><strong>Имя:</strong> {{ lastSearchResult.name }}</p>
          <p><strong>Дата:</strong> {{ lastSearchResult.date }}</p>
          <p><strong>Размер:</strong> {{ lastSearchResult.size }}</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer>
      <p>Разработчик: Ерохина О.В.,НТм-25-1, 2025 г.</p>
    </footer>

    <!-- Modals -->
    <!-- Upload Form -->
    <div class="modal-overlay" v-if="showUploadForm">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ mode === 'file' ? 'Загрузка файла' : 'Загрузка таблицы' }}</div>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body">
          <div 
            class="upload-area" 
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <p v-if="!fileName">Перетащите файл сюда или кликните для выбора</p>
            <p v-else>Выбран файл: {{ fileName }}</p>
            <input 
              type="file" 
              ref="fileInputRef"
              style="display: none;"
              @change="onFileSelect"
            >
          </div>
          <button class="action-btn" @click="uploadItem" style="margin-top: 15px; align-self: center;">Загрузить</button>

          <div v-if="uploadMessage" class="message" :class="{ success: uploadSuccess, error: !uploadSuccess }">
            {{ uploadMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Search Form -->
    <div class="modal-overlay" v-if="showSearchForm">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ mode === 'file' ? 'Поиск файла' : 'Поиск таблицы' }}</div>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="searchName">Введите имя {{ mode === 'file' ? 'файла' : 'таблицы' }}:</label>
            <input type="text" id="searchName" v-model="searchQuery">
          </div>
          <button class="action-btn" @click="performSearch" style="align-self: center;">Найти</button>

          <div v-if="searchMessage" class="message" :class="{ success: searchSuccess, error: !searchSuccess }">
            {{ searchMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Save Form -->
    <div class="modal-overlay" v-if="showSaveForm">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            {{ mode === 'file' ? 'Сохранить файл' : 'Экспортировать таблицу' }}
          </div>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body">
          <div class="message" :class="{ success: saveSuccess, error: !saveSuccess }">
            {{ saveSuccess ? 'Успешно' : 'Ошибка' }}
          </div>
          <button class="action-btn" @click="confirmSave" style="margin-top: 15px; align-self: center;">Ок</button>
        </div>
      </div>
    </div>

    <!-- Delete Form -->
    <div class="modal-overlay" v-if="showDeleteForm">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ mode === 'file' ? 'Удалить файл' : 'Удалить таблицу' }}</div>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body">
          <div class="message" :class="{ success: deleteSuccess, error: !deleteSuccess }">
            {{ deleteSuccess ? 'Успешно' : 'Ошибка' }}
          </div>
          <button class="action-btn" @click="confirmDelete" style="margin-top: 15px; align-self: center;">Ок</button>
        </div>
      </div>
    </div>

    <!-- OCR Form -->
    <div class="modal-overlay" v-if="showOcrForm">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Распознавание текста</div>
          <button class="close-btn" @click="closeModals">&times;</button>
        </div>
        <div class="modal-body">
          <div 
            class="upload-area" 
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDropOcr"
            @click="triggerOcrFileInput"
          >
            <p v-if="!ocrFileName">Перетащите PDF/JPG файл сюда или кликните для выбора</p>
            <p v-else>Выбран файл: {{ ocrFileName }}</p>
            <input 
              type="file" 
              ref="ocrFileInputRef"
              accept=".pdf,.jpg,.jpeg"
              style="display: none;"
              @change="onOcrFileSelect"
            >
          </div>
          <button class="action-btn" @click="performOcr" style="margin-top: 15px; align-self: center;">Распознать</button>

          <div v-if="ocrMessage" class="message" :class="{ success: ocrSuccess, error: !ocrSuccess }">
            {{ ocrMessage }}
          </div>

          <textarea 
            v-if="ocrResult" 
            v-model="ocrResult" 
            readonly 
            style="align-self: center; margin-top: 15px; width: 100%; height: 200px;"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div 
      class="notification" 
      :class="{ success: notification.type === 'success', error: notification.type === 'error' }"
      v-if="notification.message"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

// State variables
const mode = ref('file');
const lastSearchResult = ref(null);
const searchResults = ref([]);
const selectedFile = ref(null);

// Modal flags
const showUploadForm = ref(false);
const showSearchForm = ref(false);
const showSaveForm = ref(false);
const showDeleteForm = ref(false);
const showOcrForm = ref(false);

// Form data
const searchQuery = ref('');
const selectedFileForUpload = ref(null);
const selectedOcrFile = ref(null);
const fileName = ref('');
const ocrFileName = ref('');

// Messages
const uploadMessage = ref('');
const uploadSuccess = ref(false);
const searchMessage = ref('');
const searchSuccess = ref(true);
const ocrMessage = ref('');
const ocrSuccess = ref(true);
const ocrResult = ref('');
const saveSuccess = ref(true);
const deleteSuccess = ref(true);

// File inputs (using template refs)
const fileInputRef = ref(null);
const ocrFileInputRef = ref(null);

// Notification
const notification = reactive({
  message: '',
  type: '' // 'success' or 'error'
});

// API URLs из .env
const FILE_STORAGE_URL = import.meta.env.VUE_APP_FILE_STORAGE_SERVICE_URL || 'http://localhost:3000';
const TABLE_STORAGE_URL = import.meta.env.VUE_APP_TABLE_STORAGE_SERVICE_URL || 'http://localhost:3001';
const OCR_SERVICE_URL = import.meta.env.VUE_APP_OCR_SERVICE_URL || 'http://localhost:3002';
const EXPORT_SERVICE_URL = import.meta.env.VUE_APP_EXPORT_SERVICE_URL || 'http://localhost:3003';

// === API Service (реальный или заглушка) ===
const ApiService = {
  // Загрузка файла или таблицы
  upload: async (file, isTable = false) => {
    // Проверяем, есть ли реальный API
    const url = isTable ? `${TABLE_STORAGE_URL}/tables` : `${FILE_STORAGE_URL}/files`;

    // === ЗАГЛУШКА: создаем объект, как если бы бэкенд его сохранил ===
    const newEntry = {
      id: Date.now().toString(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: new Date().toISOString().split('T')[0],
    };

    // В реальном API тут будет:
    // const formData = new FormData();
    // formData.append('file', file);
    // return await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    // Пока возвращаем заглушку
    return { data: newEntry };
  },

  // Поиск файлов или таблиц
  search: async (query, isTable = false) => {
    const url = isTable ? `${TABLE_STORAGE_URL}/tables` : `${FILE_STORAGE_URL}/files`;

    // В реальном API:
    // return await axios.get(url, { params: { name_like: query } });

    // === ЗАГЛУШКА: запрос к mock-серверу, фильтруем на клиенте ===
    const response = await axios.get(url);
    const allItems = response.data;
    const filteredItems = allItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    return { data: filteredItems };
  },

  // Удаление файла или таблицы
  delete: async (id, isTable = false) => {
    const url = isTable ? `${TABLE_STORAGE_URL}/tables/${id}` : `${FILE_STORAGE_URL}/files/${id}`;

    // В реальном API:
    // return await axios.delete(url);

    // === ЗАГЛУШКА: запрос к mock-серверу ===
    await axios.delete(url);
    return { data: { message: 'Успешно удалено' } };
  },

  // Сохранение файла (фиктивное действие)
  saveFile: async (id) => {
    // В реальном API:
    // return await axios.post(`${FILE_STORAGE_URL}/files/${id}/save`);

    // === ЗАГЛУШКА: просто возвращаем успех ===
    return { data: { message: 'Файл успешно сохранен' } };
  },

  // Экспорт таблицы
  exportTable: async (id) => {
    // В реальном API:
    // return await axios.get(`${EXPORT_SERVICE_URL}/tables/${id}/export`, { responseType: 'blob' });

    // === ЗАГЛУШКА: запрос к mock-серверу ===
    const response = await axios.get(`${EXPORT_SERVICE_URL}/tables/${id}/export`, { responseType: 'blob' });
    return response;
  },

  // OCR
  recognize: async (file) => {
    // В реальном API:
    // const formData = new FormData();
    // formData.append('file', file);
    // return await axios.post(`${OCR_SERVICE_URL}/ocr/recognize`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    // === ЗАГЛУШКА: возвращаем фиктивный текст ===
    const mockOcrResult = `Результат распознавания из файла "${file.name}":\n\nLorem ipsum dolor sit amet...`;
    return { data: { text: mockOcrResult } };
  }
};

// Methods
const switchMode = (newMode) => {
  if (mode.value !== newMode) {
    mode.value = newMode;
    searchQuery.value = '';
    lastSearchResult.value = null;
    searchResults.value = [];
    selectedFile.value = null;
  }
};

const openUploadForm = () => {
  showUploadForm.value = true;
  selectedFileForUpload.value = null;
  fileName.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
  uploadMessage.value = '';
  uploadSuccess.value = false;
};

const openSearchForm = () => {
  showSearchForm.value = true;
};

const openSaveForm = () => {
  if (selectedFile.value) {
    showSaveForm.value = true;
  }
};

const openDeleteForm = () => {
  if (selectedFile.value) {
    showDeleteForm.value = true;
  }
};

const closeModals = () => {
  showUploadForm.value = false;
  showSearchForm.value = false;
  showSaveForm.value = false;
  showDeleteForm.value = false;
  showOcrForm.value = false;

  searchQuery.value = '';
  selectedFileForUpload.value = null;
  fileName.value = '';
  selectedOcrFile.value = null;
  ocrFileName.value = '';
  uploadMessage.value = '';
  searchMessage.value = '';
  ocrMessage.value = '';
  ocrResult.value = '';

  if (fileInputRef.value) fileInputRef.value.value = '';
  if (ocrFileInputRef.value) ocrFileInputRef.value.value = '';
};

const handleDragOver = (e) => {
  e.target.classList.add('dragover');
};

const handleDragLeave = (e) => {
  e.target.classList.remove('dragover');
};

const handleDrop = (e) => {
  e.target.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const allowedExtensions = mode.value === 'file'
      ? ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt']
      : ['.xlsx', '.xls', '.csv', '.ods'];

    const isValid = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValid) {
      uploadMessage.value = `Недопустимый формат файла для режима "${mode.value === 'file' ? 'Файл' : 'Таблица'}"`;
      uploadSuccess.value = false;
      selectedFileForUpload.value = null;
      fileName.value = '';
      return;
    }

    selectedFileForUpload.value = file;
    fileName.value = file.name;
  }
};

const handleDropOcr = (e) => {
  e.target.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg'];

    const isValid = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

    if (!isValid) {
      ocrMessage.value = 'Для распознавания текста разрешены только .pdf, .jpg, .jpeg';
      ocrSuccess.value = false;
      selectedOcrFile.value = null;
      ocrFileName.value = '';
      return;
    }

    selectedOcrFile.value = file;
    ocrFileName.value = file.name;
  }
};

const triggerFileInput = () => {
  fileName.value = '';
  fileInputRef.value.click();
};

const triggerOcrFileInput = () => {
  ocrFileName.value = '';
  ocrFileInputRef.value.click();
};

const onFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileNameLower = file.name.toLowerCase();
  const allowedExtensions = mode.value === 'file'
    ? ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt']
    : ['.xlsx', '.xls', '.csv', '.ods'];

  const isValid = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

  if (!isValid) {
    uploadMessage.value = `Недопустимый формат файла для режима "${mode.value === 'file' ? 'Файл' : 'Таблица'}"`;
    uploadSuccess.value = false;
    selectedFileForUpload.value = null;
    fileName.value = '';
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  selectedFileForUpload.value = file;
  fileName.value = file.name;
};

const onOcrFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileNameLower = file.name.toLowerCase();
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg'];

  const isValid = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

  if (!isValid) {
    ocrMessage.value = 'Для распознавания текста разрешены только .pdf, .jpg, .jpeg';
    ocrSuccess.value = false;
    selectedOcrFile.value = null;
    ocrFileName.value = '';
    if (ocrFileInputRef.value) ocrFileInputRef.value.value = '';
    return;
  }

  selectedOcrFile.value = file;
  ocrFileName.value = file.name;
};

const uploadItem = async () => {
  if (!selectedFileForUpload.value) {
    uploadMessage.value = 'Пожалуйста, выберите файл';
    uploadSuccess.value = false;
    return;
  }

  try {
    // Вызываем API
    const response = await ApiService.upload(selectedFileForUpload.value, mode.value === 'table');

    uploadMessage.value = 'Файл успешно загружен';
    uploadSuccess.value = true;
    showNotification('Файл успешно загружен', 'success');
  } catch (error) {
    uploadMessage.value = 'Ошибка загрузки: ' + (error.response?.data?.message || error.message);
    uploadSuccess.value = false;
    showNotification('Ошибка загрузки', 'error');
  } finally {
    selectedFileForUpload.value = null;
    fileName.value = '';
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchMessage.value = 'Введите имя для поиска';
    searchSuccess.value = false;
    return;
  }

  try {
    const response = await ApiService.search(searchQuery.value, mode.value === 'table');
    searchResults.value = response.data;
    lastSearchResult.value = null;

    searchMessage.value = '';
    searchSuccess.value = true;
    showSearchForm.value = false;
    showNotification('Поиск выполнен успешно', 'success');
  } catch (error) {
    searchMessage.value = 'Ошибка поиска: ' + (error.response?.data?.message || error.message);
    searchSuccess.value = false;
    showNotification('Ошибка поиска', 'error');
  }
};

const selectItem = (item) => {
  selectedFile.value = item;
};

const selectAndSave = (item) => {
  selectedFile.value = item;
  openSaveForm();
};

const selectAndDelete = (item) => {
  selectedFile.value = item;
  openDeleteForm();
};

const confirmSave = async () => {
  try {
    if (mode.value === 'file') {
      await ApiService.saveFile(selectedFile.value.id);
      saveSuccess.value = true;
      showNotification('Файл успешно сохранен', 'success');
    } else {
      const response = await ApiService.exportTable(selectedFile.value.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile.value.name + '.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      saveSuccess.value = true;
      showNotification('Таблица успешно экспортирована', 'success');
    }
  } catch (error) {
    saveSuccess.value = false;
    showNotification('Ошибка сохранения/экспорта', 'error');
  }
  closeModals();
};

const confirmDelete = async () => {
  if (!selectedFile.value) return;

  try {
    await ApiService.delete(selectedFile.value.id, mode.value === 'table');

    searchResults.value = searchResults.value.filter(f => f.id !== selectedFile.value.id);
    if (searchResults.value.length === 0) {
      lastSearchResult.value = null;
    }
    selectedFile.value = null;

    deleteSuccess.value = true;
    showNotification(
      mode.value === 'file' ? 'Файл успешно удален' : 'Таблица успешно удалена',
      'success'
    );
  } catch (error) {
    deleteSuccess.value = false;
    showNotification('Ошибка удаления', 'error');
  }
  closeModals();
};

const performOcr = async () => {
  if (!selectedOcrFile.value) {
    ocrMessage.value = 'Пожалуйста, выберите файл';
    ocrSuccess.value = false;
    return;
  }

  try {
    // Вызываем API
    const response = await ApiService.recognize(selectedOcrFile.value);

    ocrResult.value = response.data.text;
    ocrMessage.value = '';
    ocrSuccess.value = true;
    showNotification('Текст успешно распознан', 'success');
  } catch (error) {
    ocrMessage.value = 'Ошибка распознавания: ' + error.message;
    ocrSuccess.value = false;
    showNotification('Ошибка распознавания', 'error');
  }
};

const showNotification = (message, type) => {
  notification.message = message;
  notification.type = type;
  setTimeout(() => {
    notification.message = '';
  }, 3000);
};
</script>

<style>
/* Твой CSS остаётся без изменений */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #444;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.info-block {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: relative;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 20px;
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.toggle-container {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-btn.active {
  background-color: #f4a261;
  color: white;
}

.main-actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.action-btn {
  padding: 12px 24px;
  background-color: #f4a261;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background-color: #e69554;
}

.hidden-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  justify-content: flex-end;
}

.hidden-btn {
  padding: 12px 24px;
  background-color: #f4a261;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: none;
}

.hidden-btn.show {
  display: inline-block;
}

.result-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #e9f7ef;
  border: 1px solid #28a745;
  border-radius: 4px;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-item.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.file-info {
  flex: 1;
}

.file-actions {
  display: flex;
  gap: 10px;
}

footer {
  background-color: #ffffff;
  padding: 20px;
  text-align: center;
  margin-top: auto;
  border-top: 1px solid #eee;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  position: relative;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  position: absolute;
  right: 10px;
  top: 10px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  width: 100%;
}

.upload-area:hover {
  border-color: #f4a261;
}

.upload-area.dragover {
  border-color: #f4a261;
  background-color: #f0f8ff;
}

.input-group {
  margin-bottom: 15px;
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  text-align: center;
}

input[type="text"], textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  height: 200px;
  resize: vertical;
  width: 100%;
}

.message {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  width: 100%;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  z-index: 1001;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.notification.success {
  background-color: #28a745;
}

.notification.error {
  background-color: #dc3545;
}
</style>