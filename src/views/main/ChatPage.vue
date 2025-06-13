<template>
  <div class="chat-page-container">
    <ChatSidebar />
    <div class="chat-main-content">
      <ChatMessage :messages="chatMessages" @view-image="handleViewImage" />
      <ChatInput
        :is-deep-research="isDeepResearchMode"
        :is-generate-response="isGenerateResponse"
        @send-message="handleSendMessage" 
        @toggle-deep-research="isDeepResearchMode = !isDeepResearchMode" />
    </div>

    <div v-if="imageViewModalOpen" class="image-modal-overlay" @click="closeImageViewModal">
      <div class="image-modal-content" @click.stop>
        <button class="close-modal-button" @click="closeImageViewModal">X</button>
        <img :src="currentImageUrl" alt="Enlarged Image" class="enlarged-image" />
        <div v-if="currentImageCaption" class="enlarged-image-caption">{{ currentImageCaption }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import ChatInput from '../../components/chat/ChatInput.vue';
import ChatMessage from '../../components/chat/ChatMessage.vue';
import ChatSidebar from '../../components/chat/ChatSidebar.vue';
import axios from 'axios';

export default {
  name: 'ChatPage',
  components: {
    ChatSidebar,
    ChatMessage,
    ChatInput
  },
  setup() {
    const isDeepResearchMode = ref(false);
    const isGenerateResponse = ref(false);

    const chatMessages = ref([
      // Ví dụ về tin nhắn mẫu với cấu trúc content mới (loại bỏ shouldType ở đây)
      { 
        id: 1, 
        sender: 'ai', 
        timestamp: new Date().toISOString(),
        content: [
          { type: 'text', value: 'Hello, how can I help you today?' }
        ]
      }
    ]);
    let thinkingMessageId = ref(null);

    const imageViewModalOpen = ref(false);
    const currentImageCaption = ref('');
    const currentImageUrl = ref('');

    const handleViewImage = (imageData) => {
      currentImageUrl.value = imageData.imageUrl;
      currentImageCaption.value = imageData.imageCaption;
      imageViewModalOpen.value = true;
    }

    const closeImageViewModal = () => {
      imageViewModalOpen.value = false;
      currentImageUrl.value = '';
      currentImageCaption.value = '';
    };

    onMounted(() => {
      // Logic onMounted (nếu có)
    })

    const handleSendMessage = async (newMessage) => {
      if (!newMessage.trim()) return;

      // Thêm tin nhắn của người dùng
      chatMessages.value.push({
        id: chatMessages.value.length + 1,
        sender: 'user',
        timestamp: new Date().toISOString(),
        content: [{ type: 'text', value: newMessage }]
      });
      isGenerateResponse.value = true;

      // Thêm tin nhắn "Thinking"
      const newThinkingId = chatMessages.value.length + 1;
      chatMessages.value.push({
        id: newThinkingId,
        sender: 'ai',
        type: 'thinking',
        timestamp: new Date().toISOString(),
        content: [{ type: 'text', value: '...' }]
      });
      thinkingMessageId.value = newThinkingId;

      try {
        const payload = {
          action: 'sendMessage',
          inputText: newMessage
        };

        const response = await axios.post('http://localhost:3000/api/get-websocket-data', payload);
        const data = response.data;
        console.log('Data receive from API:', data);

        // Chuẩn bị nội dung mới cho AI
        const newAiContent = [];
        if (data.messageText) {
          newAiContent.push({ type: 'text', value: data.messageText });
        }
        if (data.imageUrl) {
          newAiContent.push({ type: 'image', imageUrl: data.imageUrl, imageCaption: data.imageCaption });
        }
        if (data.citation) {
          newAiContent.push({ type: 'citation', value: `**Citation:**\n${data.citation}` });
        }

        // Xóa tin nhắn "Thinking"
        if (thinkingMessageId.value !== null) {
          const index = chatMessages.value.findIndex(msg => msg.id === thinkingMessageId.value);
          if (index !== -1) {
            chatMessages.value.splice(index, 1);
          }
          thinkingMessageId.value = null;
        }
        
        // Thêm tin nhắn phản hồi của AI với nội dung đã gom
        if (newAiContent.length > 0) {
          chatMessages.value.push({
            id: chatMessages.value.length + 1,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            content: newAiContent,
            // shouldType: true // BỎ DÒNG NÀY ĐỂ VÔ HIỆU HÓA TYPING
          });
        }
        
      } catch(err) {
        console.error('Error when call API:', err);
        if (thinkingMessageId.value !== null) {
          const index = chatMessages.value.findIndex(msg => msg.id === thinkingMessageId.value);
          if (index !== -1) {
            chatMessages.value.splice(index, 1);
          }
          thinkingMessageId.value = null;
        }
        chatMessages.value.push({
          id: chatMessages.value.length + 1,
          sender: 'ai',
          isError: true,
          timestamp: new Date().toISOString(),
          content: [{ type: 'text', value: `Xin lỗi, đã có lỗi xảy ra: ${err.message}. Vui lòng thử lại.` }]
        });
      } finally {
        isGenerateResponse.value = false;
      }
    };

    return {
      isDeepResearchMode,
      isGenerateResponse,
      handleSendMessage,
      chatMessages,
      thinkingMessageId,
      imageViewModalOpen,
      currentImageCaption,
      currentImageUrl,
      handleViewImage,
      closeImageViewModal
    }
  }
}
</script>

<style scoped>
/* Giữ nguyên CSS của ChatPage.vue */
.chat-page-container {
  display: flex;
  height: calc(100vh - 60px); /* Đảm bảo chiều cao không tràn màn hình */
  overflow: hidden; /* Ngăn chặn tràn nếu có nội dung vượt quá */
}

.chat-main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* Modal CSS giữ nguyên */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-modal-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #333;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s;
  z-index: 1001;
}

.close-modal-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.enlarged-image {
  max-width: 100%;
  max-height: 75vh;
  display: block;
  border-radius: 4px;
}

.enlarged-image-caption {
  margin-top: 15px;
  font-size: 1.1em;
  color: #555;
  text-align: center;
  max-width: 100%;
  word-wrap: break-word;
}

.download-image-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff; /* Màu xanh dương */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.download-image-button:hover {
  background-color: #0056b3; /* Màu xanh đậm hơn khi hover */
}
</style>