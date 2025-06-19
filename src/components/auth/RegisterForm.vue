<template>
  <div class="register-form-container">
    <div class="register-card">
      <h2>Register new account</h2>
      <el-form @submit.prevent="handleRegister" label-width="100px">
        <el-form-item label="Full Name">
          <el-input v-model="fullName" type="text" placeholder="Typing your full name" />
        </el-form-item>
        <el-form-item label="Phone Number">
          <el-input
            v-model="phoneNumber"
            type="text"
            placeholder="Typing your phone number"
          />
        </el-form-item>
        <el-form-item label="Address">
          <el-input v-model="addressVal" type="text" placeholder="Typing your address" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="emailVal" type="email" placeholder="Typing your email" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input
            v-model="passwordVal"
            type="password"
            placeholder="Typing your password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Password confirm">
          <el-input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password again"
            show-password
          />
        </el-form-item>
        <el-alert type="error" :title="errorMessage" show-icon class="mb-3" />
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="authStore.loading"
            class="full-width"
          >
            Register
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider>OR</el-divider>
      <div class="social-login-buttons">
        <el-button
          type="info"
          class="full-width social-button google-button"
          v-on:click="handleGoogleLogin"
        >
          <img src="@/assets/icon/google-circle.png" alt="Google" class="social-icon" />
          Login with Google
        </el-button>
      </div>
      <p class="mt-3">
        Do you have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from "element-plus";

export default {
  methods: {},
  name: "RegisterForm",
  emits: ["handle-register", "social-login"],
  setup(_, { emit }) {
    // Init default variable is null
    const fullName = ref("");
    const phoneNumber = ref("");
    const addressVal = ref("");
    const emailVal = ref("");
    const passwordVal = ref("");
    const confirmPassword = ref("");

    const errorMessage = ref("");

    const authStore = useAuthStore();

    const handleRegister = () => {
      if (validateDataInput()) {
        emit(
          "handle-register",
          fullName.value,
          phoneNumber.value,
          addressVal.value,
          emailVal.value,
          passwordVal.value,
          confirmPassword.value
        );
      }
    };

    const handleGoogleLogin = () => {
      try {
        ElMessage.success("Login success with Google");
        emit("social-login", "google");
      } catch (err) {
        ElMessage.error("Login Google fail:" + err.message);
        console.error("Something error when login with Google", err);
      }
    };

    const validateDataInput = () => {
      const errors = [];

      if (!fullName.value) {
        errors.push("Full name is required.");
      }

      if (!phoneNumber.value) {
        errors.push("Phone number is required");
      }

      if (!addressVal.value) {
        errors.push("Address is required.");
      }

      if (!emailVal.value) {
        errors.push("Email is required.");
      }

      if (!passwordVal.value) {
        errors.push("Password is required.");
      }

      if (passwordVal.value !== confirmPassword.value) {
        errors.push("Confirm password is invalid");
      }

      if (errors.length > 0) {
        errorMessage.value = errors.join("\n");
        return false;
      } else {
        errorMessage.value = "";
        return true;
      }
    };

    return {
      fullName,
      phoneNumber,
      addressVal,
      emailVal,
      passwordVal,
      confirmPassword,
      errorMessage,
      authStore,
      handleRegister,
      handleGoogleLogin,
      validateDataInput,
    };
  },
};
</script>

<style lang="css" scoped>
.register-form-container {
  display: flex;
  flex-direction: column;
}

/* Thêm CSS cho nút xã hội */
.social-login-buttons {
  display: flex;
  gap: 10px; /* Khoảng cách giữa các nút */
  margin-top: 20px;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.social-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

/* Tùy chỉnh màu sắc hoặc style riêng cho từng nút */
.google-button {
  background-color: var(--google-background-color); /* Màu Google */
  color: white;
  border-color: var(--google-background-color);
  width: 100%;
}

.google-button:hover {
  background-color: #c03d32;
  border-color: #c03d32;
}
</style>
