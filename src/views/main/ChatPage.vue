<template>
  <div class="chat-page-container">
    <ChatSidebar />
    <div class="chat-main-content">
      <ChatMessage ref="messageRef" />
      <ChatInput
        :is-deep-research="isDeepResearchMode"
        @send-message="handleSendMessage" 
        @toggle-deep-research="isDeepResearchMode = !isDeepResearchMode" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ChatInput from '../../components/chat/ChatInput.vue';
import ChatMessage from '../../components/chat/ChatMessage.vue';
import ChatSidebar from '../../components/chat/ChatSidebar.vue';

export default {
  name: 'ChatPage',
  components: {
    ChatSidebar,
    ChatMessage,
    ChatInput
  },
  setup() {
    const messageRef = ref('');
    const isDeepResearchMode = ref(false);

    const handleSendMessage = (newMessage) => {
      if (messageRef.value) {
        console.log("Tin nhắn được gửi:", newMessage);
        if (messageRef.value && messageRef.value.messages && isDeepResearchMode.value) {
          messageRef.value.messages.push({
            id: messageRef.value.messages.length + 1,
            text: newMessage,
            sender: 'user'
          });
          // Giả lập phản hồi từ AI
          setTimeout(() => {
            messageRef.value.messages.push({
              id: messageRef.value.messages.length + 1,
              text: `AI: Received your message "${newMessage}". How can I process it further?`,
              sender: 'ai'
            });
          }, 500);
        }
      }
    };

    return {
      messageRef,
      isDeepResearchMode,
      handleSendMessage
    }
  }
}
</script>

<style scoped>
.chat-page-container {
  display: flex;
  height: calc(100vh - 60px); /* Chiều cao = 100% viewport - chiều cao header */
  /* Thay đổi chiều cao nếu header của bạn có chiều cao khác */
}

.chat-main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
</style>