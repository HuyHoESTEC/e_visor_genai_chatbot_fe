<script setup>
import { useAuthStore } from "./stores/auth";
import SideBar from "./components/layout/SideBar.vue";
import { computed, ref, onMounted } from "vue"; // Import onMounted
import AppHeader from "./components/layout/AppHeader.vue";
import CompanyLogo from "./assets/img/estec-icon.png"; // Đường dẫn tới logo của bạn

const authStore = useAuthStore();

// Add the neat state of the sidebar
const isSidebarCollapsed = ref(false);
// The event processing function when the sidebar is toggle
const handleSidebarToggle = (collapsedStatus) => {
  isSidebarCollapsed.value = collapsedStatus;
};

const dynamicMarginLeft = computed(() => {
  if (authStore.isLoggedIn) {
    // Có vẻ như dynamicMarginLeft không thay đổi dựa trên collapsedStatus ở đây.
    // Nếu bạn muốn sidebar thu gọn thì margin-left thay đổi, cần điều chỉnh logic này.
    // Ví dụ: return isSidebarCollapsed.value ? '60px' : '200px'; // Giá trị giả định
    return "5px";
  }
  return "0";
});

const currentYear = new Date().getFullYear();

// --- Bổ sung cho hiệu ứng Spinner ---
const isLoading = ref(true); // Trạng thái loading ban đầu là true

onMounted(() => {
  // Sau khi DOM của App.vue được gắn kết (mount), chúng ta có thể giả lập thời gian tải
  // Trong ứng dụng thực tế, bạn sẽ tắt spinner sau khi tất cả dữ liệu ban đầu đã được tải
  setTimeout(() => {
    isLoading.value = false;
  }, 1500); // Giả lập 1.5 giây tải
});
</script>

<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-container">
        <img :src="CompanyLogo" alt="ESTEC Company" class="company-logo-spinner" />
        <div class="spinner"></div>
      </div>
    </div>

    <div v-else :class="{ 'app-layout': authStore.isLoggedIn, 'full-page-layout': !authStore.isLoggedIn }">
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
            Sản phẩm của ESTEC Automation & Digitalization - Research and Development Department ©{{ currentYear }}
          </footer>
        </div>
      </div>
      <router-view v-else />
    </div>
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
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  width: 100%;
}

.fixed-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.content-and-footer {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.content-and-footer > :deep(.router-view) {
  flex-grow: 1;
}

.app-footer {
  text-align: center;
  color: var(--estec-unique-color);
  background-color: white;
  font-size: 0.7em;
  font-weight: normal;
  padding: 10px; /* Thêm padding để footer không bị dính sát đáy */
  user-select: none;
}

/* --- CSS cho hiệu ứng Spinner --- */
.loading-overlay {
  position: fixed; /* Hoặc absolute nếu muốn trong phạm vi cha */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9); /* Nền mờ trắng */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Đảm bảo nó nằm trên tất cả các thành phần khác */
  transition: opacity 0.5s ease-in-out; /* Hiệu ứng mờ dần khi biến mất */
}

.spinner-container {
  position: relative;
  width: 120px; /* Kích thước tổng thể của spinner và logo */
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.company-logo-spinner {
  width: 120px; /* Kích thước của logo */
  height: 120px;
  object-fit: contain; /* Đảm bảo logo không bị méo */
  border-radius: 50%; /* Nếu logo là hình tròn hoặc muốn bo tròn */
  z-index: 10; /* Đảm bảo logo nằm trên spinner */
}

.spinner {
  position: absolute;
  width: 140px; /* Kích thước vòng quay */
  height: 140px;
  border: 5px solid #f3f3f3; /* Light grey */
  border-top: 5px solid var(--estec-unique-color); /* Blue or your company's primary color */
  border-radius: 50%;
  animation: spin 1.5s linear infinite; /* Hiệu ứng xoay */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
