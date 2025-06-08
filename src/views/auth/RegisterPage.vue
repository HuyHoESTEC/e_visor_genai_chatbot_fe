<template>
  <div class="auth-page">
    <div class="auth-car">
      <h2>Register new account</h2>
      <el-form @submit.prevent="handleRegister">
        <el-form-item label="Email">
          <el-input v-model="email" type="email" placeholder="Typing your email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="password" type="password" placeholder="Create password" show-password />
        </el-form-item>
        <el-form-item label="Confirm the password">
          <el-input v-model="confirmPassword" type="password" placeholder="Confirm the password" />
        </el-form-item>
        <el-alert v-if="authStore.error" type="error" :title="authStore.error" show-icon class="mb-3" />
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="authStore.loading" class="full-width">
            Register
          </el-button>
        </el-form-item>
      </el-form>
      <p class="mt-3">
        There are accounts ? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'RegisterPage',
  setup() {
    const authStore = useAuthStore();

    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');

    const handleRegister = async () => {
      if (password.value !== confirmPassword.value) {
        authStore.error = 'Password confirm is not valid';
        return;
      }
      await authStore.register({ email: email.value, password: password.value });
    }

    return {
      authStore,
      email,
      password,
      confirmPassword,
      handleRegister
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
  width: 100%;
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