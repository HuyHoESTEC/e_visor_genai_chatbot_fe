<template>
    <div class="chat-message-area">
        <div v-if="!messages.length" class="welcome-message">
            <h2>Hello, how are you !</h2>
            <h3>How can I help you today ?</h3>
        </div>
        <div class="message-list" ref="messageListRef">
            <div v-for="message in messages" :key="message.id" :class="[ 'message-item', message.sender ]">
                <div class="message-content">
                    <div class="message-text">{{ message.text }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue';

export default {
    name: 'ChatMessage',
    setup() {
        const messages = ref([
            { id: 1, text: 'Hello, how can I help you today?', sender: 'ai' },
            { id: 2, text: 'I need to reduce GAS costs in my factory. Do you have any suggestions?', sender: 'user' },
            { id: 3, text: 'Certainly! To reduce GAS costs, you could consider optimizing your boiler efficiency, checking for leaks in your distribution system, and implementing a robust energy management system. Would you like to delve into any of these areas?', sender: 'ai' },
            { id: 4, text: 'Tell me more about optimizing boiler efficiency.', sender: 'user' },
        ]);

        const messageListRef = ref(null);
        // Cuộn xuống cuối tin nhắn khi có tin nhắn mới
        watch(messages, () => {
            nextTick(() => {
                if (messageListRef.value) {
                    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
                }
            });
        }, { deep: true });

        return {
            messages,
            messageListRef
        }
    }
}
</script>

<style scoped>
.chat-message-area {
  flex-grow: 1; /* Chiếm hết không gian còn lại */
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 20px;
  position: relative; /* Để welcome message có thể nằm giữa */
}

.welcome-message {
  position: absolute;
  top: 30%; /* Điều chỉnh để nằm giữa trang */
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

.message-list {
  flex-grow: 1; /* Cho phép danh sách tin nhắn cuộn và chiếm không gian */
  overflow-y: auto; /* Cho phép cuộn tin nhắn */
  padding-right: 10px; /* Tạo khoảng trống cho scrollbar */
}

.message-item {
  display: flex;
  margin-bottom: 15px;
}

.message-item.user {
  justify-content: flex-end; /* Tin nhắn người dùng căn phải */
}

.message-item.ai {
  justify-content: flex-start; /* Tin nhắn AI căn trái */
}

.message-content {
  max-width: 70%; /* Giới hạn chiều rộng của bong bóng tin nhắn */
  padding: 10px 15px;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word; /* Xuống dòng khi tin nhắn dài */
}

.message-item.user .message-content {
  background-color: #2c2c6a; /* Màu xanh dương cho tin nhắn người dùng */
  color: #fff;
  border-bottom-right-radius: 2px; /* Góc nhọn */
}

.message-item.ai .message-content {
  background-color: #f0f2f5; /* Màu xám nhạt cho tin nhắn AI */
  color: #333;
  border-bottom-left-radius: 2px; /* Góc nhọn */
}
</style>