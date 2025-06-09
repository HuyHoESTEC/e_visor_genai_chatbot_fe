<template>
  <div class="chat-input-area">
    <textarea
      v-model="messageInput"
      @keyup.enter.prevent="handleEnter"
      :disabled="!isConnected"
      placeholder="Nhập câu hỏi về hợp đồng..."
      rows="1"
    ></textarea>
    <button @click="sendClientMessage" :disabled="!isConnected">
      <i class="fas fa-paper-plane send-icon"></i>
    </button>
  </div>
  <p class="input-hint">Bạn có thể hỏi các điều khoản cụ thể hoặc các điểm yếu.</p>
</template>

<script>
import { ref } from 'vue';
import { useWebSocket } from '../../composables/useWebSocket';

export default {
  name: 'ChatInput',
  setup() {
    const { isConnected, sendMessage, messages } = useWebSocket();
    const messageInput = ref('');

    const handleEnter = (event) => {
      if (!event.shiftKey) {
        sendClientMessage();
      }
    };

    const sendClientMessage = () => {
      if (messageInput.value.trim() && isConnected.value) {
        sendMessage({
          type: 'user_message',
          message: messageInput.value.trim(),
          sessionId: messages.length > 0 ? messages[messages.length - 1].sessionId : 'new_session_id'
        });
        messageInput.value = ''; // Delete input after send request
      }
    }

    return {
      isConnected,
      sendMessage,
      messages,
      messageInput,
      handleEnter
    }
  }
}
</script>

<style lang="css" scoped>
.chat-input-area {
  display: flex;
  align-items: flex-end; /* Căn chỉnh input và nút gửi */
  background-color: #ffffff;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.chat-input-area textarea {
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 20px; /* Bo tròn các góc */
  padding: 10px 15px;
  font-size: 1em;
  resize: none; /* Ngăn người dùng kéo dãn textarea */
  max-height: 100px; /* Giới hạn chiều cao để không bị quá lớn */
  overflow-y: auto; /* Cho phép cuộn nếu text quá dài */
  margin-right: 10px;
}

.chat-input-area textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.chat-input-area button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%; /* Nút gửi tròn */
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0; /* Ngăn nút bị co lại */
}

.chat-input-area button:hover:not(:disabled) {
  background-color: #0056b3;
}

.chat-input-area button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.send-icon {
  font-size: 1.2em;
}

.input-hint {
  font-size: 0.85em;
  color: #777;
  text-align: center;
  margin-top: 10px;
  padding-bottom: 10px;
}
</style>