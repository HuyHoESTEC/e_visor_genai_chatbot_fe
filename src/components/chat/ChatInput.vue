<template>
  <div class="chat-input-area">
    <div class="input-container">
      <el-input
        v-model="message"
        placeholder="Type a message..."
        :rows="1"
        type="textarea"
        resize="none"
        @keyup.enter="sendMessage"
        class="message-textarea"
      ></el-input>
      <el-button type="primary" :icon="Promotion" circle class="send-button" v-on:click="sendMessage"></el-button>
    </div>
    <div class="input-actions">
      <el-button :icon="Upload" class="action-button">Upload</el-button>
      <el-button :icon="Search" class="action-button">Deep research</el-button>
      </div>
    <div class="disclaimer">
      ESTEC AI can make mistakes. Please check the information before use.
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Upload, Search, Promotion } from '@element-plus/icons-vue';

export default {
  name: 'ChatInput',
  emits: ['sendMessage'],
  setup(props, { emit }) {
    const message = ref('');
    const sendMessage = () => {
      if (message.value.trim()) {
        emit('sendMessage', message.value.trim());
        message.value = '';
      }
    }
    
    return {
      message,
      sendMessage,
      Upload,
      Search,
      Promotion
    }
  }
}
</script>

<style scoped>
.chat-input-area {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0; /* Ngăn khu vực input bị co lại */
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 800px; /* Giới hạn chiều rộng tối đa */
  margin: 0 auto; /* Căn giữa */
}

.input-container {
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  align-items: flex-end; /* Căn nút gửi với input */
}

.message-textarea {
  flex-grow: 1;
  margin-right: 10px;
  /* Override Element Plus default style nếu cần */
}

/* Tùy chỉnh chiều cao của textarea khi không có nhiều dòng */
.message-textarea :deep(.el-textarea__inner) {
  min-height: 40px !important; /* Chiều cao tối thiểu */
  padding-right: 40px; /* Để chừa chỗ cho nút gửi */
}


.send-button {
  width: 40px;
  height: 40px;
  font-size: 1.2em;
  background-color: #007bff;
  border-color: #007bff;
}

.send-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.input-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-button {
  background-color: #f0f2f5;
  border-color: #e0e0e0;
  color: #555;
  padding: 8px 15px;
  font-size: 0.9em;
}

.action-button:hover {
  background-color: #e9e9e9;
}

.disclaimer {
  font-size: 0.8em;
  color: #999;
  text-align: center;
}
</style>