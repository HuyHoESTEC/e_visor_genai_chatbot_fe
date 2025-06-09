<template>
  <div class="chat-window-wrapper">
    <div class="chat-header">
      <h3>Hỏi đáp về hợp đồng</h3>
    </div>
    <div class="messages-container">
      <div class="initial-message-box">
        <p>I've analyzed your contract. What specific questions do you have about it?</p>
      </div>
      <div v-for="(msgPayload, payloadIndex) in messages" class="message-group">
        <div v-for="(item, itemIndex) in msgPayload.response" class="message-item">
          <template v-if="item.type === 'text'">
            <p v-if="payloadIndex === currentMessageIndex && itemIndex === currentTextItemIndex" class="ai-response ai-typing">
              {{ currentTypingText }}<span class="typing-cursor">|</span>
            </p>
            <p v-else class="ai-response">{{ item.text }}</p>
          </template>
          <template v-else-if="item.type === 'image'">
            <img :src="item.url" alt="item.caption" :width="item.width" :height="item.height" class="ai-image">
            <p v-if="item.caption" class="image-caption">{{ item.caption }}</p>
          </template>
          <template v-else-if="item.type === 'citation'">
            <small class="citation">{{ item.text }}</small>
          </template>
          <template v-else>
            <p class="ai-reponse unknown-type">Không thể hiển thị loại nội dung này: {{ item.type }}</p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useWebSocket } from '../../composables/useWebSocket';

export default {
  name: 'ChatWindow',
  setup() {
    const WS_URL = 'ws://localhost:3000';
    const {
      messages,
      currentTypingText,
      currentMessageIndex,
      currentTextItemIndex
    } = useWebSocket(WS_URL);

    return {
      WS_URL,
      messages,
      currentTypingText,
      currentMessageIndex,
      currentTextItemIndex
    }
  }
}
</script>

<style scoped>
.chat-window-wrapper {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative; /* Cho phép header và container cuộn riêng */
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fefefe;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.chat-header h3 {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.messages-container {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto; /* Cho phép cuộn */
  height: 100%; /* Đảm bảo nó chiếm đủ chiều cao để cuộn */
  max-height: 500px; /* Giới hạn chiều cao để thấy hiệu ứng cuộn */
  display: flex; /* Dùng flex để các tin nhắn đẩy xuống dưới */
  flex-direction: column;
  justify-content: flex-end; /* Đẩy nội dung từ dưới lên */
}

.initial-message-box {
  background-color: #f0f0f0;
  padding: 12px 18px;
  border-radius: 8px;
  margin-bottom: 15px;
  align-self: flex-start; /* Tin nhắn đầu tiên nằm bên trái */
  max-width: 80%;
  color: #555;
  font-size: 0.95em;
}

.message-group {
  margin-bottom: 15px;
  padding: 10px 0;
  /* Nếu bạn muốn phân biệt tin nhắn của người dùng và AI */
  /* align-self: flex-start; */
  /* Hoặc align-self: flex-end cho tin nhắn người dùng */
}

.ai-response {
  background-color: #e6f0ff; /* Màu nền cho tin nhắn AI */
  padding: 12px 18px;
  border-radius: 8px;
  margin-bottom: 8px;
  align-self: flex-start;
  max-width: 85%; /* Giới hạn chiều rộng tin nhắn AI */
  line-height: 1.5;
  color: #333;
  word-wrap: break-word; /* Ngắt chữ dài */
  white-space: pre-wrap; /* Giữ định dạng khoảng trắng và dòng mới */
}

.ai-typing {
  background-color: #f0f8ff; /* Màu nền nhẹ hơn khi đang typing */
  color: #007bff;
}

.ai-image {
  max-width: 80%;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.image-caption {
  font-size: 0.85em;
  color: #666;
  text-align: center;
  margin-top: 0;
}

.citation {
  font-style: italic;
  font-size: 0.8em;
  color: #888;
  margin-top: 5px;
  display: block; /* Đảm bảo citation nằm trên một dòng riêng */
}

.unknown-type {
  background-color: #ffe6e6;
  color: #cc0000;
}

/* Con trỏ typing (từ useWebSocket) */
.typing-cursor {
  display: inline-block;
  width: 0.5em;
  height: 1em;
  background-color: black;
  vertical-align: middle;
  margin-left: 2px;
  animation: blink-caret 0.75s step-end infinite;
}

@keyframes blink-caret {
  from, to { opacity: 0; }
  50% { opacity: 1; }
}
</style>