<template>
  <div class="upload-area-wrapper">
    <div class="upload-area"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragging }"
    >
      <input type="file" ref="fileInput" @change="handleFileSelect" multiple hidden />
      <div class="upload-content" @click="openFilePicker">
        <el-icon class="upload-icon"><UploadFilled /></el-icon>
        <p class="upload-text">Bấm để tải liền hoặc kéo và thả tệp</p>
        <p class="upload-support-text">Hỗ trợ định dạng: .docx, .xlsx, .xls, .pdf</p>
      </div>
      <div v-if="uploadedFiles.length > 0" class="file-list">
        <h4>Tệp đã tải lên:</h4>
        <ul>
          <li v-for="file in uploadedFiles" :key="file.name">
            {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { UploadFilled } from '@element-plus/icons-vue';
import { ref } from 'vue';
export default {
  name: 'ContractUploadArea',
  setup() {
    const isDragging = ref(false);
    const fileInput = ref(null);
    const uploadedFiles = ref([]);

    const handleDragOver = () => {
      isDragging.value = true;
    };

    const handleDragLeave = () => {
      isDragging.value = false;
    };

    const handleDrop = (event) => {
      isDragging.value = false;
      const files = event.dataTransfer.files;
      processFiles(files);
    };

    const openFilePicker = () => {
      fileInput.value.click();
    };

    const handleFileSelect = (event) => {
      const files = event.target.files;
      processFiles(files);
    };

    const processFiles = (files) => {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Check file format if needed
          const allowedExtentions = ['docx', 'xlsx', 'xls', 'pdf'];
          const fileExtention = file.name.split('.').pop();
          if (!allowedExtentions.includes(fileExtention.toLowerCase())) {
            alert(`File "${file.name}" there is no support. Only accept .docx, .xlsx, .xls, .pdf.`);
            continue;
          }
          uploadedFiles.value.push(file);
          // Here you can call API to upload the file to the server
          console.log('File selected/dropped:', file.name);
          // Example: uploadedFiles(file);
        }
      }
    }

    return {
      isDragging,
      fileInput,
      uploadedFiles,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      openFilePicker,
      handleFileSelect,
      processFiles
    }
  }
}
</script>

<style scoped>
.upload-area-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  flex-grow: 1; /* Chiếm hết không gian có thể */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-area.drag-over {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 3em;
  color: #007bff;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.upload-support-text {
  font-size: 0.9em;
  color: #777;
  margin: 5px 0 0;
}

.file-list {
  margin-top: 20px;
  text-align: left;
  width: 100%;
}

.file-list h4 {
  margin-top: 0;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.file-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-list li {
  background-color: #f0f0f0;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 5px;
  color: #444;
  font-size: 0.9em;
}
</style>