<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="../../assets/vue.svg" alt="Logo" class="sidebar-logo" />
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li v-for="item in menuItems" :key="item.name" :class="{ active: item.isActive }">
          <router-link :to="{ name: item.routeName }">
            <el-icon><component :is="item.iconComponent" /></el-icon>
            <span>{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="sidebar-footer">
      <ul>
        <li>
          <router-link to="{ name: 'Setting' }">
            <el-icon><Setting /></el-icon>
          </router-link>
        </li>
        <li>
          <a href="#" @click.prevent="handleLogout">
            <el-icon><SwitchButton /></el-icon> <span>Logout</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { ref, watch } from "vue";

export default {
  name: "SideBar",
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();

    const menuItems = ref([
      {
        name: "chat",
        label: "Chat",
        iconComponent: "ChatDotSquare",
        routeName: "Chat",
        isActive: false,
      },
      {
        name: "dashboard",
        label: "Dashboard",
        iconComponent: "DataAnalysis",
        routeName: "Dashboard",
        isActive: false,
      },
      {
        name: "contract-review",
        label: "Contract Review",
        iconComponent: "Document",
        routeName: "ContractReview",
        isActive: false,
      },
      {
        name: "contract-elements",
        label: "Contract Elements",
        iconComponent: "Reading",
        routeName: "ContractElements",
        isActive: false,
      },
      {
        name: "contracts",
        label: "Contracts",
        iconComponent: "Folder",
        routeName: "Contracts",
        isActive: false,
      },
      {
        name: "contact-fields",
        label: "Contact Fields",
        iconComponent: "User",
        routeName: "ContactFields",
        isActive: false,
      },
      {
        name: "dataset",
        label: "Dataset",
        iconComponent: "Files",
        routeName: "Dataset",
        isActive: false,
      },
      {
        name: "relationship",
        label: "Relationship",
        iconComponent: "Connection",
        routeName: "Relationship",
        isActive: false,
      },
      {
        name: "connection",
        label: "Connection",
        iconComponent: "Link",
        routeName: "Connection",
        isActive: false,
      },
    ]);

    watch(
      route,
      (newRoute) => {
        menuItems.value.forEach((item) => {
          item.isActive = item.routeName === newRoute.name;
        });
      },
      { immediate: true }
    );

    const handleLogout = async () => {
      await authStore.logout();
    };

    return {
      route,
      authStore,
      menuItems,
      handleLogout,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  flex-shrink: 0; /* Ngăn sidebar bị co lại */
}

.sidebar-nav a .el-icon,
.sidebar-footer a .el-icon {
  margin-right: 15px;
  font-size: 1.2em;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.sidebar-logo {
  height: 40px; /* Kích thước logo */
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
  transition: background-color 0.2s, color 0.2s;
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
  color: #007bff; /* Màu chữ active */
  border-left-color: #007bff; /* Màu border active */
}

.sidebar-nav li.active a i {
  color: #007bff; /* Màu icon active */
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
</style>
