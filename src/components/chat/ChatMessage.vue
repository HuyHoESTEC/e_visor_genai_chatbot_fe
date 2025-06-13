<template>
  <div class="chat-message-area">
    <div v-if="!currentMessages.length" class="welcome-message">
      <h2>Hello, how are you!</h2>
      <h3>How can I help you today?</h3>
    </div>
    <div class="message-list" ref="messageListRef">
      <div v-for="message in currentMessages" :key="message.id" :class="['message-item', message.sender]">
        <div class="message-content" :class="{ 'error-message': message.isError }">
          <div v-if="message.type === 'thinking'" class="thinking-spinner-container">
            <div class="spinner"></div>
            <span>Thinking...</span>
          </div>
          <template v-else>
            <div v-for="(item, index) in message.content" :key="message.id + '-' + index">
              <div v-if="item.type === 'text'" class="message-text">
                <span v-html="formatMessageText(item.value)"></span>
              </div>
              <div 
                v-else-if="item.type === 'image'" 
                class="message-image-container"
                @click="handleImageClick(item.imageUrl, item.imageCaption)"
              >
                <img :src="item.imageUrl" :alt="item.imageCaption" class="message-image" />
                <div v-if="item.imageCaption" class="image-caption">{{ item.imageCaption }}</div>
              </div>
              <div v-else-if="item.type === 'citation'" class="message-citation">
                <span v-if="item.value" v-html="formatMessageText(item.value)"></span>
              </div>
            </div>
          </template>
          
          <div v-if="message.type !== 'thinking'" class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue';

export default {
  name: 'ChatMessage',
  emits: ['view-image'],
  props: {
    messages: {
      type: Array,
      default: () => ([])
    }
  },
  setup(props, { emit }) {
    const currentMessages = ref(props.messages);
    const messageListRef = ref(null);

    // BỎ HÀM startTypingEffect VÀ TOÀN BỘ LOGIC WATCH CŨ
    // Thay vào đó, chỉ cần một watch đơn giản để cập nhật currentMessages và cuộn xuống cuối
    watch(() => props.messages, (newMessages) => { // Không cần oldMessages nữa
      currentMessages.value = newMessages;
      nextTick(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        }
      });
    }, { deep: true, immediate: true }); // immediate: true để load tin nhắn ban đầu

    const formatMessageText = (text) => {
      if (!text) return '';
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const options = {
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      return date.toLocaleString('vi-VN', options);
    };

    const handleImageClick = (imageUrl, imageCaption) => {
      emit('view-image', { imageUrl, imageCaption });
    };

    return {
      currentMessages,
      messageListRef,
      formatMessageText,
      formatTimestamp,
      handleImageClick
    }
  }
}
</script>

<style scoped>
/* Giữ nguyên CSS của bạn từ các bản sửa lỗi trước, chỉ thêm các điều chỉnh chiều cao dưới đây */
/* Vấn đề tràn màn hình */
/* Đảm bảo html, body có chiều cao 100% hoặc 100vh */
html, body {
  margin: 0;
  padding: 0;
  height: 100%; 
  overflow: hidden; /* Quan trọng để ngăn cuộn toàn bộ trang */
}

/* ChatPage.vue (styles) */
.chat-page-container {
  display: flex;
  height: 100vh; /* Sử dụng 100vh để chiếm toàn bộ chiều cao viewport */
  /* Nếu có header/navbar, điều chỉnh: height: calc(100vh - [chiều cao header]px); */
  overflow: hidden; /* Ngăn chặn tràn */
}

.chat-main-content {
  flex-grow: 1; /* Cho phép nó mở rộng để chiếm không gian còn lại */
  display: flex;
  flex-direction: column; /* Các item bên trong (ChatMessage, ChatInput) sẽ xếp dọc */
  background-color: #fff;
  /* overflow: hidden; */ /* Có thể thêm nếu có vấn đề tràn dọc bất ngờ */
}

/* ChatMessage.vue (styles) */
.chat-message-area {
  flex-grow: 1; /* Rất quan trọng: cho phép nó co giãn để lấp đầy không gian */
  display: flex;
  flex-direction: column; /* Để message-list và welcome-message xếp dọc */
  background-color: #fff;
  padding: 20px;
  position: relative;
  overflow-y: auto; /* CUỘN CHỈ Ở ĐÂY để tin nhắn cuộn trong vùng này */
}

.message-list {
  /* Không cần flex-grow hay overflow-y: auto ở đây nữa */
  padding-right: 10px; /* Vẫn giữ để có khoảng trống cho scrollbar */
}

/* ChatInput.vue (styles) - Nếu có file CSS riêng, hoặc thêm vào ChatPage.vue */
/* Đảm bảo ChatInput có chiều cao cố định hoặc tự động co giãn và không bị co lại */
/* Ví dụ cho ChatInput, đảm bảo nó có chiều cao cố định hoặc tự động co giãn */
.chat-input-container { /* Thay thế bằng class/ID thực của ChatInput */
  flex-shrink: 0; /* Đảm bảo nó không bị co lại khi không đủ chỗ */
  padding: 10px 20px; /* Hoặc padding bạn muốn */
  background-color: #f8f8f8;
  border-top: 1px solid #eee;
  /* Có thể thêm chiều cao cố định nếu cần: height: 60px; */
}

/* Các CSS khác giữ nguyên */
.welcome-message {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

.welcome-message h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: #555;
}

.welcome-message h3 {
  font-size: 1.2em;
  font-weight: normal;
  color: #777;
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.user {
  justify-content: flex-end; 
}

.message-item.ai {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-item.user .message-content {
  background-color: #2c2c6a;
  color: #fff;
  border-bottom-right-radius: 2px;
  text-align: left;
}

.message-item.ai .message-content {
  background-color: #f0f2f5;
  color: #333;
  border-bottom-left-radius: 2px;
  text-align: left;
}

.message-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.message-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-caption {
  font-size: 0.8em;
  color: #666;
  text-align: center;
}

.message-citation {
  font-size: 0.85em;
  color: #777;
  margin-top: 10px;
  padding-left: 10px;
  border-left: 3px solid #ccc;
  font-style: italic;
}

.error-message {
  color: red;
  font-weight: bold;
}

.message-timestamp {
  font-size: 0.75em;
  color: #888;
  margin-top: 5px;
  align-self: flex-end;
}

.message-item.ai .message-timestamp {
    align-self: flex-start;
}

.thinking-spinner-container {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px; 
  padding: 5px;
  width: auto;
  color: #555;
  font-size: 0.9em;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-text {
  white-space: pre-wrap;
}

/* Các CSS liên quan đến typing (con trỏ |) sẽ bị loại bỏ vì không còn v-if="message.shouldType" và data-full-text */
/* @keyframes blink {
  50% { border-color: transparent; }
}

.message-text span[data-full-text]::after {
  content: '|';
  display: inline-block;
  vertical-align: bottom;
  margin-left: 2px;
  animation: blink 0.7s infinite step-end;
} */
</style>