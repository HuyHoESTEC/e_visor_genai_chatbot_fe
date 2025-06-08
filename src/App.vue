<script setup>
import { useAuthStore } from './stores/auth';
import SideBar from './components/layout/SideBar.vue';

const authStore = useAuthStore();
</script>

<template>
  <div id="app" :class="{ 'app-layout': authStore.isLoggedIn, 'full-page-layout': !authStore.isLoggedIn }">
    <SideBar v-if="authStore.isLoggedIn" />
    <router-view />
  </div>
</template>

<style scoped>
/* Layout khi người dùng đã đăng nhập (có sidebar) */
.app-layout {
  display: flex;
  width: 100%;
}

/* Layout khi người dùng chưa đăng nhập (login/register, chiếm toàn bộ trang) */
.full-page-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
