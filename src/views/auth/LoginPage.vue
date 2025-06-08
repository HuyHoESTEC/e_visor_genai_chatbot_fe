<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Đăng nhập</h2>
      <el-form @submit.prevent="handleLogin">
          <el-form-item label="Email">
            <el-input v-model="email" type="email" placeholder="Vui lòng nhập email của bạn" />
          </el-form-item>
          <el-form-item label="Mật khẩu">
            <el-input v-model="password" type="password" placeholder="Vui lòng nhập mật khẩu của bạn" show-password />
          </el-form-item>
          <el-alert v-if="authStore.error" type="error" :title="authStore.error" show-icon class="mb-3" />
          <el-form-item>
            <el-button type="success" native-type="submit" :loading="authStore.loading" class="full-width">Đăng nhập</el-button>
          </el-form-item>
      </el-form>
      <p class="mt-3">
        Bạn chưa có tài khoản ? <router-link to="/register">Đăng ký tại đây</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'LoginPage',
  setup() {
    const authStore = useAuthStore();
    const email = ref('');
    const password = ref('');

    const handleLogin = async () => {
      await authStore.login({ email: email.value, password: password.value });
    };

    return {
      authStore,
      email,
      password,
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
    url('../../assets/img/form_bg.jpg');
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