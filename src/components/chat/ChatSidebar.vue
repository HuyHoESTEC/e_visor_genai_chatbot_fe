<template>
  <div class="chat-sidebar">
    <div class="chat-sidebar-intro">
      <img src="@/assets/img/estec-icon.png" alt="ESTEC AI Icon" class="chat-sidebar-icon">
      <span class="chat-sidebar-text">ESTEC AI</span>
    </div>
    <div class="chat-sidebar-header">
        <button class="new-chat-button">
            <img src="@/assets/icon/new-chat-icon.svg" />
            Cuộc trò chuyện mới
        </button>
        <button class="search-chat-button">
            <img src="@/assets/icon/search-icon.svg" />
            Tìm cuộc trò chuyện
        </button>
    </div>
    <div class="chat-sidebar-history">
        <h3>Đoạn Chat</h3>
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
import { ref, computed } from 'vue'; // Import ref và computed
// import { EditPen, Search } from '@element-plus/icons-vue'; // Nếu bạn đang dùng Element Plus icons

export default {
    name: 'ChatSidebar',
    setup() {
        // Sử dụng ref để recentChats có thể được thay đổi và theo dõi reactivity
        const recentChats = ref([
            { id: 1, title: 'How to use GAS to reduce costs of factory', isActive: true },
            { id: 2, title: 'What is the best way to reduce costs of factory', isActive: false },
            { id: 3, title: 'Implementing GAS in factory', isActive: false },
            { id: 4, title: 'Adjust BET in the multiple chain', isActive: false },
            { id: 5, title: 'Remove dust in the process of cement production', isActive: false },
            { id: 6, title: 'What kind of oxides are used in the cement production', isActive: false },
        ]);

        const selectChat = (chatToSelect) => {
            recentChats.value.forEach(chat => {
                chat.isActive = chat.id === chatToSelect.id;
            });
            console.log('Selected chat:', chatToSelect.title);
        };

        return {
            recentChats,
            selectChat,
            // EditPen, // Chỉ trả về nếu bạn thực sự dùng chúng trong template
            // Search // Chỉ trả về nếu bạn thực sự dùng chúng trong template
        }
    }
}
</script>

<style scoped>
.chat-sidebar {
    width: 300px; /* Chiều rộng sidebar chat */
    background-color: var(--background-white-smooth); /* Nền tối hơn giống ảnh */
    display: flex;
    flex-direction: column;
    padding: 15px;
    flex-shrink: 0;
    overflow-y: auto; /* Cho phép cuộn nếu nội dung dài */
}

.chat-sidebar-header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.new-chat-button,
.search-chat-button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    background-color: transparent;; /* Nút màu tối hơn */
    border: 1px solid transparent;
    color: var(--siements_web_functional_black);
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    width: 100%;
    padding: 10px 12px; /* Thêm padding cho nút */
    border-radius: 8px; /* Bo tròn góc nút */
    margin-bottom: 8px; /* Khoảng cách giữa các nút */
}

.new-chat-button:hover,
.search-chat-button:hover {
    border: 1px solid #b3b6b7;
}

.new-chat-button:focus,
.search-chat-button:focus {
    outline: none;
}

/* Đảm bảo các icon trong button có kích thước phù hợp nếu chúng là SVG hoặc icon font */
.new-chat-button img,
.search-chat-button img {
    width: 20px; /* Điều chỉnh kích thước icon */
    height: 20px;
    filter: invert(70%) sepia(9%) saturate(225%) hue-rotate(189deg) brightness(84%) contrast(85%); /* Đổi màu icon sang xám nhạt */
}


.chat-sidebar-history {
    flex-grow: 1; /* Chiếm hết không gian còn lại */
    text-align: start;
}

.chat-sidebar-history h3 {
    font-size: 1.1em;
    color: var(--siements_web_functional_black);
    margin-top: 0;
    margin-bottom: 10px;
}

.chat-sidebar-history ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.chat-sidebar-history li {
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 5px;
    font-size: 0.95em;
    color: var(--siements_web_functional_black); /* Màu chữ sáng hơn */
    transition: background-color 0.2s ease;
    white-space: nowrap; /* Ngăn text xuống dòng */
    overflow: hidden; /* Ẩn text nếu tràn */
    text-overflow: ellipsis; /* Thêm dấu ba chấm nếu text bị tràn */
    border: 1px solid transparent;
}

.chat-sidebar-history li:hover {
    border: 1px solid #b3b6b7;
}

.chat-sidebar-history li.active-chat {
    background-color: #1976d2; /* Màu nền xanh đậm cho chat đang hoạt động */
    font-weight: 500;
    color: #ffffff; /* Chữ màu trắng cho chat đang hoạt động */
}

.chat-sidebar-footer {
    padding-top: 15px;
    border-top: 1px solid #3a3b3c; /* Đường kẻ tối hơn */
}

.chat-sidebar-intro {
    display: flex;
    align-items: center;
    gap: 10px; /* Khoảng cách giữa icon và chữ */
    padding: 10px 0; /* Padding trên dưới */
    margin-bottom: 20px; /* Khoảng cách với phần header bên dưới */
    /* Nếu bạn muốn có đường viền dưới như một số thiết kế, bạn có thể thêm: */
    /* border-bottom: 1px solid #e0e0e0; */
}

.chat-sidebar-icon {
    width: 30px; /* Kích thước của icon */
    height: 30px;
    /* Nếu icon của bạn có màu nền xanh mặc định, không cần filter */
    /* Nếu không, bạn có thể cần filter hoặc background-color cho div chứa icon */
}

.chat-sidebar-text {
    font-size: 1.2em; /* Kích thước chữ */
    font-weight: 600; /* Độ đậm của chữ */
    color: #333; /* Màu chữ, có thể điều chỉnh */
    white-space: nowrap; /* Ngăn chữ xuống dòng */
}
</style>