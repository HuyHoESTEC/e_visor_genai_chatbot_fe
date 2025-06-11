<template>
    <div class="chat-side">
        <div class="chat-sidebar-header">
            <el-button type="primary" :icon="Plus" class="new-chat-button">Tin nhắn mới</el-button>
            <el-button :icon="Search" class="search-chat-button">Tìm tin nhắn</el-button>
        </div>
        <div class="chat-sidebar">
            <h3>Recent</h3>
            <ul>
                <li 
                    v-for="chat in recentChats" 
                    :key="chat.id" 
                    :class="{ 'active-chat': chat.isActive }"
                    v-on:click="selectChat(chat)"    
                >
                    {{ chat.title }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { Plus, Search } from '@element-plus/icons-vue';
export default {
    name: 'ChatSidebar',
    setup() {
        const recentChats = [
            { id: 1, title: 'How to use GAS to reduce costs of factory', isActive: true },
            { id: 2, title: 'What is the best way to reduce costs of factory', isActive: false },
            { id: 3, title: 'Implementing GAS in factory', isActive: false },
            { id: 4, title: 'Adjust BET in the multiple chain', isActive: false },
            { id: 5, title: 'Remove dust in the process of cement production', isActive: false },
            { id: 6, title: 'What kind of oxides are used in the cement production', isActive: false },
        ];

        const selectChat = (chatToSelect) => {
            recentChats.value.forEach(chat => {
                chat.isActive = chat.id === chatToSelect.id;
            });
            console.log('Selected chat:', chatToSelect.title);
        };

        return {
            recentChats,
            selectChat,
            Plus,
            Search
        }
    }
}
</script>

<style scoped>
.chat-sidebar {
  width: 300px; /* Chiều rộng sidebar chat */
  background-color: #f0f2f5; /* Nền xám nhạt */
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 15px;
  flex-shrink: 0;
  overflow-y: auto; /* Cho phép cuộn nếu nội dung dài */
}

.chat-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.new-chat-button {
  width: 100%;
  background-color: #2c2c6a; /* Màu xanh dương */
  border-color: #007bff;
}

.new-chat-button:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.search-chat-button {
  width: 100%;
  background-color: #52be80; /* Màu xanh dương */
  border-color: #52be80;
  color: #fff;
}

.search-chat-button:hover {
  background-color: #27ae60;
  border-color: #27ae60;
  color: #fff;
}

.chat-sidebar-recent-chats {
  flex-grow: 1; /* Chiếm hết không gian còn lại */
  margin-bottom: 20px;
}

.chat-sidebar-recent-chats h3 {
  font-size: 1.1em;
  color: #666;
  margin-top: 0;
  margin-bottom: 10px;
}

.chat-sidebar-recent-chats ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-sidebar-recent-chats li {
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 5px;
  font-size: 0.95em;
  color: #333;
  transition: background-color 0.2s ease;
  white-space: nowrap; /* Ngăn text xuống dòng */
  overflow: hidden; /* Ẩn text nếu tràn */
  text-overflow: ellipsis; /* Thêm dấu ba chấm nếu text bị tràn */
}

.chat-sidebar-recent-chats li:hover {
  background-color: #e9e9e9;
}

.chat-sidebar-recent-chats li.active-chat {
  background-color: #d6eaff; /* Màu nền cho chat đang hoạt động */
  font-weight: 500;
  color: #007bff;
}

.chat-sidebar-footer {
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}
</style>