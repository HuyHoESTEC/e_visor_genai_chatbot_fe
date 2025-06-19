<template>
  <aside :class="['sidebar', { 'is-collapsed': isCollaped }]">
    <div class="sidebar-header">
      <div class="logo-wrapper" @click="isCollaped ? toggleSidebar() : null">
        <img
          src="../../assets/img/estec-icon.png"
          alt="Company Logo"
          class="sidebar-logo"
        />
        <span v-if="!isCollaped" class="company-name">ESTEC</span>
      </div>
      <div v-if="!isCollaped" class="toggle-button-outside-wrapper">
        <el-button
          class="toggle-sidebar-button"
          :icon="Expand"
          circle
          v-on:click="toggleSidebar"
        />
      </div>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.name" :class="{ active: item.isActive }">
          <router-link :to="{ name: item.routeName }">
            <el-icon><component :is="item.iconComponent" /></el-icon>
            <span v-if="!isCollaped">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer">
      <ul>
        <li>
          <router-link :to="{ name: 'Settings' }">
            <el-icon><Setting /></el-icon>
            <span v-if="!isCollaped">Cài đặt</span>
          </router-link>
        </li>
        <li>
          <a href="#" v-on:click.prevent="confirmLogout">
            <el-icon><SwitchButton /></el-icon> <span v-if="!isCollaped">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { ref, watch } from "vue";
import { Expand, Setting, SwitchButton } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "SideBar",
  emits: ["toggleSidebar"],
  components: {
    Expand,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const isCollaped = ref(false); // Add a state of reduction/zoom

    const menuItems = ref([
      {
        name: "chat",
        label: "Chat",
        iconComponent: "ChatDotRound",
        routeName: "Chat",
        isActive: false,
      },
      {
        name: "profile",
        label: "Time Tracking",
        iconComponent: "Timer",
        routeName: "Profile",
        isActive: false,
      },
      {
        name: "dashboard",
        label: "Dashboard",
        iconComponent: "TrendCharts",
        routeName: "Dashboard",
        isActive: false,
      },
      {
        name: "MESX",
        label: "MESX",
        iconComponent: "OfficeBuilding",
        routeName: "MESX",
        isActive: false,
      },
      {
        name: "WMSX",
        label: "WMSX",
        iconComponent: "Box",
        routeName: "WMSX",
        isActive: false,
      },
      {
        name: "QMSX",
        label: "QMSX",
        iconComponent: "DataAnalysis",
        routeName: "QMSX",
        isActive: false,
      },
      {
        name: "MMSX",
        label: "MMSX",
        iconComponent: "Cpu",
        routeName: "MMSX",
        isActive: false,
      },
      {
        name: "PMSX",
        label: "PMSX",
        iconComponent: "ShoppingTrolley",
        routeName: "PMSX",
        isActive: false,
      },
    ]);

    watch(
      () => route.name, // Monitoring route name to update Active status
      (newRouteName) => {
        menuItems.value.forEach((item) => {
          item.isActive = item.routeName === newRouteName;
        });
      },
      { immediate: true }
    );

    const confirmLogout = () => {
      ElMessageBox.confirm("Bạn có chắc chắn muốn đăng xuất ?", "Xác nhận đăng xuất", {
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        type: "warning",
      })
        .then(async () => {
          await authStore.logout();
          ElMessage.success("Đã đăng xuất thành công!");
          router.push({ name: "Login" }); // Redirect to login page
        })
        .catch(() => {
          ElMessage.info("Đã hủy đăng xuất.");
        });
    };

    const toggleSidebar = () => {
      isCollaped.value = !isCollaped.value;
      // Emit status sidebar to parent component (App.vue)
      emit("toggleSidebar", isCollaped.value);
    };

    return {
      route,
      router,
      authStore,
      isCollaped,
      menuItems,
      confirmLogout,
      toggleSidebar,
      Expand,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-shrink: 0; /* Ngăn sidebar bị co lại */
  transition: width 0.3s ease; /* Motion effect */
}

.sidebar.is-collapsed {
  width: 70px; /* Width when miniature (just enough icon and padding) */
}

.sidebar-nav a .el-icon,
.sidebar-footer a .el-icon {
  margin-right: 15px;
  font-size: 1.2em;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent icon is shrinking */
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  height: 60px;
  box-sizing: border-box; /* Make sure the padding does not increase the height */
  overflow: hidden;
}

/* Wrapper cho logo để căn chỉnh dễ hơn */
.logo-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1; /* Cho phép logo chiếm không gian còn lại */
  overflow: hidden; /* Đảm bảo nội dung không tràn ra ngoài khi thu nhỏ */
}

.sidebar-logo {
  height: 40px; /* Kích thước logo */
  width: auto;
  object-fit: contain;
  max-width: 100%;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.sidebar.is-collapsed .sidebar-logo {
  width: 40px; /* Kích thước logo khi thu gọn */
  height: 40px;
  margin-right: 0; /* Bỏ margin khi thu gọn */
  cursor: pointer;
}

.sidebar.is-collapsed .company-name {
  opacity: 0;
  width: 0;
  visibility: hidden; /* Ẩn hoàn toàn text khi thu gọn */
}

.company-name {
  font-size: 1.4em; /* Kích thước text company */
  font-weight: bold;
  color: #333;
  white-space: nowrap; /* Ngăn text xuống dòng */
  overflow: hidden; /* Ẩn text nếu tràn */
  transition: opacity 0.3s ease, width 0.3s ease;
  max-width: 100%; /* Giới hạn chiều rộng của text */
}

.sidebar-logo-icon {
  height: 40px;
  width: 40px;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.sidebar.is-collapsed .sidebar-logo-icon {
  /* Hiển thị icon khi thu gọn */
  opacity: 1;
  display: block;
}

/* Ẩn icon khi không thu gọn (để chỉ hiển thị logo đầy đủ) */
.sidebar:not(.is-collapsed) .sidebar-logo-icon {
  opacity: 0;
  width: 0;
  display: none;
}

.sidebar-nav ul,
.sidebar-footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li,
.sidebar-footer li {
  margin-bottom: 5px;
}

.sidebar-nav a,
.sidebar-footer a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, padding 0.3s ease;
  border-left: 3px solid transparent; /* Cho hiệu ứng active */
}

.sidebar-nav a i,
.sidebar-footer a i {
  margin-right: 15px;
  font-size: 1.2em;
  color: #777;
}

.sidebar-nav a:hover,
.sidebar-footer a:hover {
  background-color: #f0f0f0;
  color: #333;
}

.sidebar-nav li.active a {
  background-color: #e6f0ff; /* Màu nền active */
  color: var(--estec-unique-color); /* Màu chữ active */
  border-left-color: #007bff; /* Màu border active */
  font-weight: bold;
}

.sidebar-nav li.active a i .el-icon {
  color: var(--estec-unique-color); /* Màu icon active */
}

.sidebar-footer {
  margin-top: auto; /* Đẩy footer xuống dưới cùng */
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.sidebar-nav a.router-link-exact-active .el-icon,
.sidebar-footer a.router-link-exact-active .el-icon {
  color: #007bff;
}

/* Nút toggle */
.toggle-button-wrapper {
  flex-shrink: 0; /* Ngăn nút bị co lại */
  margin-left: 10px; /* Khoảng cách giữa logo và nút */
  display: flex;
  align-items: center;
}

.toggle-sidebar-button {
  background-color: #f0f2f5;
  border: none;
  color: #606266;
  font-size: 18px;
  width: 32px; /* Kích thước nút nhỏ hơn */
  height: 32px; /* Kích thước nút nhỏ hơn */
  transition: background-color 0.2s ease, color 0.2s ease;
  padding: 0; /* Loại bỏ padding mặc định của el-button */
  outline: none;
}

.toggle-sidebar-button:hover {
  background-color: #e6e6e6;
  color: #409eff;
}

/* Ẩn nút toggle khi sidebar thu gọn (tùy chọn, nếu bạn muốn chỉ hiển thị nút khi phóng to) */
/* .sidebar.is-collapsed .toggle-button-wrapper {
  display: none;
} */

/* Ẩn text khi sidebar thu gọn */
.sidebar.is-collapsed .sidebar-nav a span,
.sidebar.is-collapsed .sidebar-footer a span {
  opacity: 0;
  width: 0;
  visibility: hidden;
  display: none;
}

.sidebar.is-collapsed .sidebar-footer a {
  justify-content: center;
  padding: 12px 0px;
}

.sidebar.is-collapsed .sidebar-footer a .el-icon {
  margin-right: 0;
}
</style>
