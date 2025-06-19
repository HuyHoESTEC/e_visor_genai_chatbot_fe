<template>
  <div class="auth-page">
    <div class="auth-card">
      <RegisterForm
        @handle-register="handleTraditionalRegister"
        @social-login="handleSocialLogin"
      />
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "../../stores/auth";
import RegisterForm from "../../components/auth/RegisterForm.vue";

export default {
  name: "RegisterPage",
  components: {
    RegisterForm,
  },
  setup() {
    const authStore = useAuthStore();

    const handleTraditionalRegister = async (
      fullName,
      phoneNumber,
      addressVal,
      emailVal,
      passwordVal,
      confirmPassword
    ) => {
      if (passwordVal.value !== confirmPassword.value) {
        authStore.error = "Password confirm is not valid";
        return;
      }
      console.log("User informations has been registered:", {
        fullname: fullName,
        phonenumber: phoneNumber,
        address: addressVal,
        email: emailVal,
        password: passwordVal,
      });

      await authStore.register({
        fullname: fullName,
        phonenumber: phoneNumber,
        address: addressVal,
        email: emailVal,
        password: passwordVal,
      });
    };

    const handleSocialLogin = () => {
      return;
    };

    return {
      authStore,
      handleTraditionalRegister,
      handleSocialLogin,
    };
  },
};
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0.6),
      /* overlay bóng mờ màu đen 50% */ rgba(0, 0, 0, 0.6)
    ),
    url("../../assets/img/login_bg.jpg");
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
