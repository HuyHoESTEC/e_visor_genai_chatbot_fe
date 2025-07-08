<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <img class="img-login" src="../../assets/img/estec-icon.png" />
        <h2>Đăng nhập</h2>
      </div>
      <LoginForm 
        :loading="authStore.loading"
        :error="authStore.error"
        @submit-login="handleLogin"
      />
      <!-- <p class="mt-3">
        Bạn chưa có tài khoản ? <router-link to="/register">Đăng ký tại đây</router-link>
      </p> -->
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../../stores/auth'; 
import LoginForm from '../../components/auth/LoginForm.vue';
import router from '../../router';

export default {
  name: 'LoginPage',
  components: {
    LoginForm
  },
  setup() {
    const authStore = useAuthStore();

    const handleLogin = async (credentials) => {
      await authStore.login(credentials);
      try {
        router.push('/summary-dashboard');
      } catch (err) {
        alert('Login failed. Please check your credentials.');
      }
    };

    return {
      authStore,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%; /* Đảm bảo chiếm toàn bộ chiều rộng khi sidebar không hiển thị */
  background-image:
    linear-gradient(
      rgba(0, 0, 0, 0.6),   /* overlay bóng mờ màu đen 50% */
      rgba(0, 0, 0, 0.6)
    ),
    url('../../assets/img/estec-visor-bg.png');
  background-size: cover;
  background-position: center;
  width: 100vw;         
  height: 100vh;          
  overflow: hidden;
}

.auth-card {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.auth-card h2 {
  margin-bottom: 25px;
  color: #333;
}

.auth-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
}

.img-login {
  width: 80px;
  height: 80px;
  align-self: center;
}

.full-width {
  width: 100%;
}

.mt-3 {
  margin-top: 15px;
}

.mb-3 {
  margin-bottom: 15px;
}
</style>