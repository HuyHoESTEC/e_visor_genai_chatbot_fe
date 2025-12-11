<template>
  <header class="app-header">
    <div class="header-left">
      <h1 class="current-tab-name">{{ currentTabName }}</h1>
    </div>
    <div class="header-right">
      <el-tag 
        v-if="authStore.isLoggedIn && currentUserRole"
        size="small"
        type="primary"
        effect="dark"
        style="margin-right: 5px;"
      >
        {{ currentUserRoleTag }}
      </el-tag>
      <el-tag 
        v-if="authStore.isLoggedIn && currentUserDepartment"
        size="small"
        type="success"
        effect="dark"
        style="margin-right: 5px;"
      >
        {{ currentUserDepartmentTag }}
      </el-tag>
      <el-select
        v-model="selectedLanguage"
        placeholder="Select Language"
        style="width: 120px; margin-right: 15px;"
        size="small"
      >
        <el-option
          v-for="option in languageOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
          <template #default>
            <img :src="option.flag" :alt="option.label" class="flag-icon" />
            <span>{{ option.label }}</span>
          </template>
        </el-option>
      </el-select>
      <span v-if="authStore.isLoggedIn" class="user-greeting">
        {{ langStore.t('hi') }} <b>{{ authStore.user?.name }}</b>
      </span>
      <el-dropdown trigger="click" @command="handleCommand">
        <el-avatar :size="45" :src="userAvatar" class="user-avatar-el">
          <img :src="defaultAvatar" alt="Default Avatar" />
        </el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="change-password">
              <Lock style="width: 1em; height: 1em; margin-right: 8px" /> Đổi mật khẩu
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog
      title="Đổi mật khẩu"
      v-model="showChangePasswordDialog"
      width="400px"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="160px"
      >
        <el-form-item label="Mật khẩu cũ" prop="old_password">
          <el-input v-model="passwordForm.old_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Mật khẩu mới" prop="new_password">
          <el-input v-model="passwordForm.new_password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Xác nhận mật khẩu" prop="confirm_password">
          <el-input v-model="passwordForm.confirm_password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordDialog = false">Hủy</el-button>
          <el-button type="primary" @click="handleChangePassword">Lưu</el-button>
        </span>
      </template>
    </el-dialog>
  </header>
</template>

<script>
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { computed, reactive, ref } from "vue";
import defaultAvatar from "@/assets/img/default-user.png";
import { MENU_ITEMS } from "../../constants/menuItems";
import { ElAvatar, ElMessage } from "element-plus"; // Thêm dòng này
import { useLanguageStore } from "../../stores/language";
import vnFlag from "../../assets/flags/vietnam-flag.png";
import enFlag from "../../assets/flags/usa-flag.png";
import jpFlag from "../../assets/flags/jp-flag.png";
import frFlag from "../../assets/flags/fr-flag.png";
import rsFlag from "../../assets/flags/russian-flag.png";
import chFlag from "../../assets/flags/china-flag.png";
import koreFlag from "../../assets/flags/korea-flag.png";
import { changePassword }  from "../../services/auth.service";
import { Lock } from "@element-plus/icons-vue";
import { getRoleName } from "../../constants/roleList";
import { getDepartmentName } from "../../constants/departmentList";

export default {
  name: "AppHeader",
  // Thêm ElAvatar vào components
  components: {
    ElAvatar,
  },
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    const langStore = useLanguageStore();

    const currentUserRole = authStore.user?.role;
    const currentUserDepartment = authStore.user?.department;

    const currentUserRoleTag = getRoleName(currentUserRole);
    const currentUserDepartmentTag = getDepartmentName(currentUserDepartment);

    const showChangePasswordDialog = ref(false);
    const passwordForm = reactive({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    const passwordFormRef = ref(null);
    
    const handleCommand = (command) => {
      if (command === 'change-password') {
        showChangePasswordDialog.value = true;
        if (passwordFormRef.value) {
          passwordFormRef.value.resetFields();
        }
      }
    };

    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '' ) {
        callback(new Error('Vui lòng xác nhận mật khẩu mới'));
      } else if (value !== passwordForm.new_password) {
        callback(new Error('Mật khẩu xác nhận không khớp với mật khẩu mới'));
      } else {
        callback();
      }
    };

    // Validate rule for change password form
    const passwordRules = {
      old_password: [
        { required: true, message: 'Vui lòng nhập mật khẩu cũ', trigger: 'blur' }
      ],
      new_password: [
        { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
      ],
      confirm_password: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu mới', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
      ]
    };

    const handleChangePassword = async () => {
      const valid = await passwordFormRef.value.validate();
      if (valid) {
        try {
          const payload = {
            username: authStore.user?.id,
            password: passwordForm.old_password,
            newpassword: passwordForm.new_password
          };

          const response = await changePassword(payload);
          if (response.data.status === 'success') {
            ElMessage({
            message: response.data.message,
              type: 'success'
            });
            showChangePasswordDialog.value = false;
            passwordFormRef.value.resetFields();
          } else if (response.data.status === 'error') {
            ElMessage({
            message: response.data.message,
              type: 'error'
            });
          }
        } catch (err) {
          console.error('Lỗi đổi mật khẩu', err);
          ElMessage.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
        }
      } else {
        ElMessage.error('Vui lòng điền đầy dủ và chính xác các trường.');
        return false;
      }
    };

    const languageOptions = [
      { label: "Vietnamese", value: 'vn', flag: vnFlag },
      { label: "English", value: 'en', flag: enFlag },
      { label: "Japanese", value: 'jp', flag: jpFlag },
      { label: "France", value: 'fr', flag: frFlag },
      { label: "Russian", value: 'rs', flag: rsFlag },
      { label: "China", value: 'ch', flag: chFlag },
      { label: "Korea", value: 'kr', flag: koreFlag },
    ];

    const selectedLanguage = computed({
      get: () => langStore.getLanguage,
      set: (value) => langStore.setLanguage(value) 
    });

    const findLabelByRouteName = (routeName, items) => {
      for (const item of items) {
        if (item.routeName === routeName) {
          return langStore.t(item.labelKey);
        }
        if (item.isDropdown && item.children) {
          const foundLabel = findLabelByRouteName(routeName, item.children);
          if (foundLabel) {
            return foundLabel;
          }
        }
      }
      return null;
    };

    const currentTabName = computed(() => {
      if (route.meta.titleKey) {
        return langStore.t(route.meta.titleKey);
      }
      if (route.meta.title) {
        return route.meta.title;
      }
      const foundLabel = findLabelByRouteName(route.name, MENU_ITEMS);
      if (foundLabel) {
        return foundLabel;
      }
      return langStore.t(route.name || "dashboard");
    });

    const userAvatar = computed(() => {
      // Logic ưu tiên avatar từ store, nếu không có thì dùng defaultAvatar
      return authStore.user?.avatar || defaultAvatar;
    });

    return {
      route,
      authStore,
      langStore,
      showChangePasswordDialog,
      passwordForm,
      passwordFormRef,
      handleCommand,
      validateConfirmPassword,
      handleChangePassword,
      passwordRules,
      languageOptions,
      selectedLanguage,
      currentTabName,
      userAvatar,
      defaultAvatar, // Cần trả về defaultAvatar để sử dụng trong fallback của ElAvatar
      currentUserDepartment,
      currentUserRole,
      currentUserRoleTag,
      currentUserDepartmentTag,
    };
  },
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.header-left .current-tab-name {
  font-size: 1.5em;
  font-weight: 600;
  color: var(--estec-unique-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-greeting {
  font-size: 1em;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.flag-icon {
  width: 20px; /* Kích thước cờ */
  height: 15px; /* Tỷ lệ khung hình của cờ */
  margin-right: 8px; /* Khoảng cách giữa cờ và text */
  vertical-align: middle; /* Căn chỉnh với text */
  border: 1px solid #eee; /* Viền nhẹ cho cờ (tùy chọn) */
  box-shadow: 0 0 2px rgba(0,0,0,0.1); /* Bóng nhẹ (tùy chọn) */
}

/* Điều chỉnh lại style cho .el-select nếu cần để phù hợp với icon */
.el-select .el-input__inner {
  display: flex !important;
  align-items: center !important;
}


.user-avatar-el {
  border: 2px solid var(--estec-unique-color);
  cursor: pointer;
}

.header-right > .el-tag {
  flex-shrink: 0;
}

/* --- Media Queries --- */

/* For Tablets (e.g., width less than 768px or between 481px and 768px) */
@media (max-width: 768px) {
  .app-header {
    padding: 0 15px; /* Giảm padding ngang */
    height: 55px; /* Giảm chiều cao header */
  }

  .header-left .current-tab-name {
    font-size: 1.3em; /* Giảm kích thước font */
  }

  .user-greeting {
    font-size: 0.9em; /* Giảm kích thước font */
    gap: 8px; /* Giảm khoảng cách */
  }

  /* Đảm bảo ElAvatar vẫn giữ kích thước 45px, hoặc bạn có thể giảm xuống */
  /* .user-avatar-el {
    --el-avatar-size: 40px; /* Override Element Plus variable for size */
  /* } */
}

/* For Mobile Phones (e.g., width less than 480px) */
@media (max-width: 480px) {
  .app-header {
    padding: 0 10px; /* Giảm padding ngang nhiều hơn */
    height: 50px; /* Chiều cao tối thiểu cho mobile */
  }

  .header-left .current-tab-name {
    font-size: 1.1em; /* Giảm kích thước font đáng kể */
    /* Có thể ẩn hoàn toàn nếu tên quá dài và không gian quá hẹp */
    /* overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px; */
  }

  .header-right {
    gap: 5px; /* Giảm khoảng cách giữa các phần tử */
  }

  .user-greeting {
    display: none; /* ẨN HOÀN TOÀN TÊN NGƯỜI DÙNG TRÊN MOBILE */
  }

  /* Đảm bảo kích thước avatar nhỏ hơn trên mobile */
  .user-avatar-el {
    --el-avatar-size: 38px; /* Giảm kích thước avatar trên mobile */
  }

  .header-right > .el-tag {
    display: none; 
  }
}
</style>
