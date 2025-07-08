<template>
  <el-form @submit.prevent="handleSubmit" label-width="auto" style="max-width: 600px">
    <el-form-item label="Tên đăng nhập">
      <el-input
        v-model="username"
        type="text"
        placeholder="Vui lòng nhập tên đăng nhập"
      />
    </el-form-item>
    <el-form-item label="Mật khẩu">
      <el-input
        v-model="password"
        type="password"
        placeholder="Vui lòng nhập mật khẩu"
        show-password
      />
    </el-form-item>
    <el-alert v-if="error" type="error" :title="error" show-icon class="mb-3" />
    <el-form-item>
      <el-button
        color="#2c2c6a"
        native-type="submit"
        :loading="loading"
        class="full-width"
      >
        Đăng nhập
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { ref } from "vue";

export default {
  name: "LoginForm",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },
  emits: ["submit-login"],
  setup(_, { emit }) {
    const username = ref("");
    const password = ref("");

    const handleSubmit = () => {
      // Emit event with username and password data
      emit("submit-login", { username: username.value, password: password.value });
    };

    return {
      username,
      password,
      handleSubmit,
    };
  },
};
</script>

<style>
.full-width {
  width: 100%;
  background-color: var(--estec-unique-color);
}

.mb-3 {
  margin-bottom: 15px;
}
</style>