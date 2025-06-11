<template>
  <div class="chat-page-container">
    <ChatSidebar />
    <div class="chat-main-content">
      <ChatMessage ref="messageRef" />
      <ChatInput @send-message="handleSendMessage" />
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
    const handleSendMessage = (newMessage) => {
      if (messageRef.value) {
        // Thêm tin nhắn mới vào danh sách tin nhắn của ChatMessageArea
        // Bạn cần expose một method hoặc prop để làm điều này trong ChatMessageArea
        // Hiện tại, ChatMessageArea có biến `messages` riêng, bạn sẽ cần truyền nó qua prop
        // hoặc sử dụng Vuex/Pinia để quản lý state global.
        // Ví dụ đơn giản:
        // messageAreaRef.value.addMessage({
        //   id: messageAreaRef.value.messages.length + 1,
        //   text: newMessage,
        //   sender: 'user'
        // });

        // Để demo, chúng ta sẽ log ra và giả lập thêm vào.
        console.log("Tin nhắn được gửi:", newMessage);

        // Dưới đây là cách bạn có thể giả lập việc thêm tin nhắn vào ChatMessageArea
        // Để làm điều này hiệu quả, bạn cần truyền `messages` state từ ChatPage xuống
        // ChatMessageArea thông qua props và `v-model` hoặc `emit` từ ChatInput lên ChatPage
        // để ChatPage quản lý danh sách tin nhắn.

        // Tạm thời, để demo: Bạn có thể cập nhật prop 'messages' của ChatMessageArea
        // Giả sử ChatMessageArea chấp nhận prop `messages`
        if (messageRef.value && messageRef.value.messages) {
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