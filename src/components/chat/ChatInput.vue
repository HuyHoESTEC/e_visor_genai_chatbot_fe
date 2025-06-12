<template>
  <div class="chat-input-container">
    <div class="input-container">
      <textarea class="input-message" v-on:keyup.enter="handleEnter" v-model="message" placeholder="Type a message..." />
      <div class="input-action-container">
        <div class="input-actions">
          <button class="action-button"><img src="@/assets/icon/image-icon.svg" />Upload Image</button>
          <button 
            class="action-button"
            :class="{ 'active': isDeepResearch }"
            v-on:click="toggleDeepResearch"
          >
            <img src="@/assets/icon/deep-research-icon.svg" />Deep Research
          </button>
        </div>
        <button
          class="send-button" 
          v-on:click="sendMessage"
          :disabled="!message.trim() || isGenerateResponse"
        >
          <img src="@/assets/icon/send-icon.svg" />
        </button>
      </div>
    </div>
    
    <div class="disclaimer">
      ESTEC AI can make mistakes. Please check the information before use.
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ChatInput',
  emits: ['send-message', 'toggle-deep-research'],
  props: {
    isConnected: {
      type: Boolean,
      default: false
    },
    isGenerateResponse: {
      type: Boolean,
      default: false
    },
    isDeepResearch: {
      type: Boolean,
      default: false
    }
  },
  setup(_, { emit }) {
    const message = ref('');
    const sendMessage = () => {
      if (message.value.trim()) {
        emit('sendMessage', message.value);
        message.value = '';
      }
    };

    const handleEnter = (event) => {
      if (event.shiftKey) {
        message.value += '\n';
      } else {
        sendMessage();
      }
    };

    const toggleDeepResearch = () => {
      emit('toggle-deep-research');
    }
    
    return {
      message,
      sendMessage,
      handleEnter,
      toggleDeepResearch
    }
  }
}
</script>

<style scoped>
.chat-input-container {
  padding: 13px;
  background-color: #fff;
  flex-shrink: 0; /* Ngăn khu vực input bị co lại */
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 800px; /* Giới hạn chiều rộng tối đa */
  margin: 0 auto; /* Căn giữa */
  width: 100%;
  gap: 10px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 10px 20px;
  width: 100%;
  border: 1px solid var(--border-radius-gray-smooth);
  border-radius: 20px;
}

.input-action-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}

.input-message {
  background-color: white;
  color: black;
  border: none;
  outline: none;
  padding: 10px 14px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
  height: 70px;
  resize: none; /* Cho phép người dùng kéo để thay đổi chiều cao */
  min-height: 40px; /* Chiều cao tối thiểu */
  line-height: 1.5; /* Khoảng cách dòng */
  overflow-y: auto; /* Hiển thị scrollbar khi nội dung vượt quá chiều cao */
  white-space: pre-wrap; /* Giữ nguyên khoảng trắng và xuống dòng */
}

.send-button {
  background-color: transparent;
  border: none;
  border-radius: 50%; /* bo tròn hoàn toàn */
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.send-button:hover {
  border: 1px solid #e9e9e9;
}

.input-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--siements_web_functional_black);
  font-size: 0.9em;
  font-weight: normal;
  cursor: pointer;
  transition: background-color 0.2s ease;
  outline: none;
}

.action-button img {
  filter: invert(70%) sepia(9%) saturate(225%) hue-rotate(189deg) brightness(84%) contrast(85%); /* Đổi màu icon sang xám nhạt */
}

.action-button:hover {
  border: 1px solid #e9e9e9;
}

.action-button.active {
  background-color: #34495e; /* Màu nền xanh đậm khi active, tương tự active chat item */
  color: var(--siements_web_functional_gray); /* Chữ màu trắng khi active */
}


.disclaimer {
  font-size: 0.8em;
  color: #999;
  text-align: center;
}
</style>