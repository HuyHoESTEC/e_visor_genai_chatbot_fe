<script setup>
import { useAuthStore } from './stores/auth';
import SideBar from './components/layout/SideBar.vue';
import { computed, ref } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';

const authStore = useAuthStore();

// Add the neat state of the sidebar
const isSidebarCollapsed = ref(false);
// The event processing function when the sidebar is toggle
const handleSidebarToggle = (collapsedStatus) => {
  isSidebarCollapsed.value = collapsedStatus;
};

const dynamicMarginLeft = computed(() => {
  if (authStore.isLoggedIn) {
    return isSidebarCollapsed.value ? '10px' : '10px';
  }
  return '0';
});

const currentYear = new Date().getFullYear();
</script>

<template>
  <div id="app" :class="{ 'app-layout': authStore.isLoggedIn, 'full-page-layout': !authStore.isLoggedIn }">
    <SideBar v-if="authStore.isLoggedIn" @toggle-sidebar="handleSidebarToggle" />
    <div
      v-if="authStore.isLoggedIn" 
      class="main-content-wrapper"
      :style="{ marginLeft: dynamicMarginLeft }"
    >
      <AppHeader class="fixed-header" />
      <div class="content-and-footer">
        <router-view />
        <footer class="app-footer">
          Một sản phẩm của ESTEC Digital - Solution @{{ currentYear }}
        </footer>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<style scoped>
/* Layout khi người dùng đã đăng nhập (có sidebar) */
.app-layout {
  width: 100%;
  display: flex;
  min-height: 100vh;
}

/* Layout khi người dùng chưa đăng nhập (login/register, chiếm toàn bộ trang) */
.full-page-layout {
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Wrapper cho nội dung chính khi có sidebar */
.main-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column; /* Sắp xếp các thành phần theo chiều dọc */
  overflow: hidden; /* Ngăn chặn cuộn trên main-content-wrapper */
  transition: margin-left 0.3s ease;
  width: 100%;
}

.fixed-header {
  position: sticky; /* Hoặc 'fixed' nếu bạn muốn nó luôn ở vị trí cố định trên viewport */
  top: 0;
  z-index: 1000; /* Đảm bảo header nằm trên các nội dung khác */
  background-color: white; /* Đặt màu nền để che đi nội dung bên dưới khi cuộn */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Tùy chọn: thêm đổ bóng */
  width: 100%; /* Đảm bảo chiều rộng */
}

.content-and-footer {
  flex-grow: 1; /* Chiếm toàn bộ không gian còn lại */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Cho phép cuộn nội dung chính */
}

/* Điều chỉnh lại router-view trong main-content-wrapper để chiếm hết không gian còn lại */
.content-and-footer > :deep(.router-view) {
  flex-grow: 1;
  /* padding: 20px; */ /* Thường thì mỗi trang sẽ có padding riêng */
}

.app-footer {
  text-align: center;
  color: var(--estec-unique-color);
  font-size: 0.9em;
  font-weight: bold;
}
</style>
