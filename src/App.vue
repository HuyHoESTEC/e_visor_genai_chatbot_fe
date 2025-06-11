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
</script>

<template>
  <div id="app" :class="{ 'app-layout': authStore.isLoggedIn, 'full-page-layout': !authStore.isLoggedIn }">
    <SideBar v-if="authStore.isLoggedIn" @toggle-sidebar="handleSidebarToggle" />
    <div
      v-if="authStore.isLoggedIn" 
      class="main-content-wrapper"
      :style="{ marginLeft: dynamicMarginLeft }"
    >
      <AppHeader />
      <router-view />
    </div>
    <router-view v-else />
  </div>
</template>

<style scoped>
/* Layout khi người dùng đã đăng nhập (có sidebar) */
.app-layout {
  width: 100%;
}

/* Layout khi người dùng chưa đăng nhập (login/register, chiếm toàn bộ trang) */
.full-page-layout {
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Wrapper cho nội dung chính khi có sidebar */
.main-content-wrapper {
  flex-grow: 1; /* Chiếm hết không gian còn lại */
  display: flex;
  flex-direction: column; /* Sắp xếp nội dung theo chiều dọc nếu có header/footer */
  overflow-y: auto; /* Cho phép cuộn nội dung chính */
  transition: margin-left 0.3s ease; /* Hiệu ứng chuyển động cho margin */
  width: 100%;
  gap: 2px;
}

/* Điều chỉnh lại router-view trong main-content-wrapper để chiếm hết không gian còn lại */
.main-content-wrapper > :deep(.router-view) {
  flex-grow: 1;
  /* padding: 20px; */ /* Thường thì mỗi trang sẽ có padding riêng */
}
</style>
