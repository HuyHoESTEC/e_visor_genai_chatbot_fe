<template>
    <header class="app-header">
        <div class="header-left">
            <h1 class="current-tab-name">{{ currentTabName }}</h1>
        </div>
        <div class="header-right">
            <span class="user-name">{{ userName }}</span>
        </div>
    </header>
</template>

<script>
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { computed } from 'vue';

export default {
    name: 'AppHeader',
    setup(){
        const route = useRoute();
        const authStore = useAuthStore();

        // Computed property to get current tab
        const currentTabName = computed(() => {
            // Priority Route.meta.title if any, if not, use route.name
            return route.meta.title || route.name || 'Chat'
        });
        // Computed property to get user name
        const userName = computed(() => {
            return authStore.user?.username || 'Guest'
        })

        return {
            route,
            authStore,
            currentTabName,
            userName
        }
    }
}
</script>

<style scoped>
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
  color: #333;
  margin: 0;
}

.header-right .user-name {
  font-size: 1.1em;
  font-weight: 500;
  color: #555;
}
</style>