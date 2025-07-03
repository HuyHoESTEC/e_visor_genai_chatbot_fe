<template>
  <header class="app-header">
    <div class="header-left">
      <h1 class="current-tab-name">{{ currentTabName }}</h1>
    </div>
    <div class="header-right">
      <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
    </div>
  </header>
</template>

<script>
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { computed } from "vue";
import defaultAvatar from "@/assets/img/default-profile-ava.png";
import { MENU_ITEMS } from "../../constants/menuItems";

export default {
  name: "AppHeader",
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();

    // Hàm tìm kiếm label từ MENU_ITEMS dựa trên routeName
    const findLabelByRouteName = (routeName, items) => {
      for (const item of items) {
        // Nếu item hiện tại có routeName trùng khớp, trả về label của nó
        if (item.routeName === routeName) {
          return item.label;
        }
        // Nếu item có children (là dropdown), đệ quy tìm kiếm trong children
        if (item.isDropdown && item.children) {
          const foundLabel = findLabelByRouteName(routeName, item.children);
          if (foundLabel) {
            return foundLabel;
          }
        }
      }
      return null; // Không tìm thấy label
    };

    // Computed property để lấy tên tab hiện tại
    const currentTabName = computed(() => {
      // Ưu tiên Route.meta.title nếu có
      if (route.meta.title) {
        return route.meta.title;
      }

      // Sau đó, tìm label trong MENU_ITEMS dựa trên route.name
      const foundLabel = findLabelByRouteName(route.name, MENU_ITEMS);
      if (foundLabel) {
        return foundLabel;
      }

      // Nếu không tìm thấy trong meta.title hoặc MENU_ITEMS, fallback về route.name
      // hoặc một giá trị mặc định (ví dụ: "Chat")
      return route.name || "Chat";
    });

    const userAvatar = computed(() => {
      return authStore.user?.avataUrl || defaultAvatar;
    });

    return {
      route,
      authStore,
      currentTabName,
      userAvatar,
    };
  },
};
</script>

<style scoped>
/* (CSS giữ nguyên) */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px; /* Padding chỉ ở hai bên */
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  width: 100%; /* Đảm bảo header chiếm toàn bộ chiều rộng của parent */
  box-sizing: border-box; /* Quan trọng để padding không làm tăng chiều rộng */
}

.header-left .current-tab-name {
  font-size: 1.5em;
  font-weight: 600;
  color: var(--estec-unique-color);
  margin: 0;
}

.header-right .user-avatar {
  width: 40px; /* Kích thước avatar */
  height: 40px;
  border-radius: 50%; /* Làm cho avatar tròn */
  object-fit: cover; /* Đảm bảo hình ảnh không bị biến dạng */
  border: 2px solid #e0e0e0; /* Viền nhỏ quanh avatar (tùy chọn) */
  cursor: pointer; /* Biểu tượng con trỏ khi di chuột qua */
}
</style>