<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Login</h2>
      <el-form @submit.prevent="handleLogin">
          <el-form-item label="Email">
            <el-input v-model="email" type="email" placeholder="Typing your email" />
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="password" type="password" placeholder="Typing your password" show-password />
          </el-form-item>
          <el-alert v-if="authStore.error" type="error" :title="authStore.error" show-icon class="mb-3" />
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="authStore.loading" class="full-width">Login</el-button>
          </el-form-item>
      </el-form>
      <p class="mt-3">
        No account ? <router-link to="/register">Register now</router-link>
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
  background-color: #f0f2f5;
  width: 100%; /* Đảm bảo chiếm toàn bộ chiều rộng khi sidebar không hiển thị */
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