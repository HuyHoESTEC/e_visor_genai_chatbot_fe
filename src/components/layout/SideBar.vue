<template>
  <aside :class="['sidebar', { 'is-collapsed': isCollaped }]">
    <div class="sidebar-header">
      <div class="logo-wrapper" @click="isCollaped ? toggleSidebar() : null">
        <img
          v-if="isCollaped"
          src="../../assets/img/estec-icon.png"
          alt="Company Logo"
          class="sidebar-logo"
        />
        <img
          v-if="!isCollaped"
          src="../../assets/img/estec-sidebar-logo.png"
          alt="Company Logo"
          class="sidebar-logo-no-collapsed"
        />
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
      <el-menu
        :default-active="route.name"
        :collapse="isCollaped"
        class="el-menu-vertical-demo"
        background-color="transparent"
        text-color="#555"
        active-text-color="var(--estec-unique-color)"
        :collapse-transition="false"
        :router="true"
        :default-opened="openMenus"
      >
        <template v-for="item in menuItems" :key="item.name">
          <el-sub-menu
            v-if="item.children && item.isDropdown"
            :index="item.name"
            :class="{ active: item.isActive }"
          >
            <template #title>
              <el-icon><component :is="item.iconComponent" /> </el-icon>
              <span v-if="!isCollaped">{{ item.label }}</span>
            </template>
            <template v-for="child in item.children" :key="child.name">
              <el-sub-menu
                v-if="child.children && child.isDropdown"
                :index="child.name"
                :class="{ active: child.isActive }"
              >
                <template #title>
                  <el-icon><component :is="child.iconComponent" /> </el-icon>
                  <span v-if="!isCollaped">{{ child.label }}</span>
                </template>
                <el-menu-item
                  v-for="grandchild in child.children"
                  :key="grandchild.name"
                  :index="grandchild.routeName"
                  :route="{ name: grandchild.routeName }"
                  :class="{ active: grandchild.isActive }"
                >
                  <el-icon><component :is="grandchild.iconComponent" /> </el-icon>
                  <span v-if="!isCollaped">{{ grandchild.label }}</span>
                </el-menu-item>
              </el-sub-menu>

              <el-menu-item
                v-else
                :index="child.routeName"
                :route="{ name: child.routeName }"
                :class="{ active: child.isActive }"
              >
                <el-icon><component :is="child.iconComponent" /> </el-icon>
                <span v-if="!isCollaped">{{ child.label }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>

          <el-menu-item
            v-else
            :index="item.routeName"
            :route="{ name: item.routeName }"
            :class="{ active: item.isActive }"
          >
            <el-icon><component :is="item.iconComponent" /> </el-icon>
            <span v-if="!isCollaped">{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </nav>
    <div class="sidebar-footer">
      <ul>
        <li>
          <router-link :to="{ name: 'Settings' }">
            <el-icon><Tools /></el-icon>
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
import { computed, ref, watch } from "vue";
import { Expand, SwitchButton, Tools } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { MENU_ITEMS } from "../../constants/menuItems";

export default {
  name: "SideBar",
  emits: ["toggleSidebar"],
  components: {
    Expand,
    Tools,
    SwitchButton,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const isCollaped = ref(false); // Add a state of reduction/zoom
    const openMenus = ref([]);

    const userDepartment = computed(() => authStore.user?.department || 0);
    const canAccess = (item) => {
      const requiredIds = item.requiredDepartments;
      if (!requiredIds || requiredIds.length === 0) {
        return true;
      }
      return requiredIds.includes(userDepartment.value);
    };

    const filterMenuItems = (items) => {
      if (!items) return [];

      return items
        .filter(item => canAccess(item))
        .map(item => {
          const newItem = { ...item };
          if (newItem.children) {
            newItem.children = filterMenuItems(newItem.children);
            if (newItem.isDropdown && newItem.children.length === 0) {
              return null;
            }
          }
          return newItem;
        })
        .filter(item => item !== null);
    };

    const filteredMenuItems = computed(() => {
      const deepCopyMenuItems = JSON.parse(JSON.stringify(MENU_ITEMS));
      return filterMenuItems(deepCopyMenuItems);
    });
    
    // Sử dụng JSON.parse(JSON.stringify) để tạo bản sao sâu, tránh sửa đổi dữ liệu gốc
    const menuItems = ref(JSON.parse(JSON.stringify(MENU_ITEMS)));

    // Hàm đệ quy để tìm và cập nhật trạng thái active
    const updateActiveStatus = (items, currentRouteName) => {
      let foundActiveChild = false;
      items.forEach((item) => {
        if (item.children) {
          const childActive = updateActiveStatus(item.children, currentRouteName);
          item.isActive = childActive;
          if (childActive) {
            if (!openMenus.value.includes(item.name)) {
              openMenus.value.push(item.name);
            }
            foundActiveChild = true;
          }
        } else {
          item.isActive = item.routeName === currentRouteName;
          if (item.isActive) {
            foundActiveChild = true;
          }
        }
      });
      return foundActiveChild;
    };

    watch(
      () => route.name, // Monitoring route name to update Active status
      (newRouteName) => {
        menuItems.value = filteredMenuItems.value;
        openMenus.value = [];
        updateActiveStatus(menuItems.value, newRouteName);
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
          const user_id = authStore.user ? authStore.user.id : null;
          const logoutPayload = user_id ? { username: user_id } : {};
          await authStore.logout(logoutPayload);
          ElMessage.success("Đã đăng xuất thành công!");
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
      openMenus,
      menuItems,
      updateActiveStatus,
      confirmLogout,
      toggleSidebar,
      Expand,
      Tools,
      SwitchButton,
    };
  },
};
</script>

<style>
.sidebar {
  width: 270px;
  background-color: #ffffff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column; /* Đặt các phần tử con theo chiều dọc */
  padding: 20px 0;
  flex-shrink: 0;
  transition: width 0.3s ease;
  height: 100vh; /* Quan trọng: Đảm bảo sidebar chiếm toàn bộ chiều cao viewport */
  box-sizing: border-box; /* Bao gồm padding vào chiều cao */
}

.sidebar.is-collapsed {
  width: 70px;
}

/* Base style for icons in sidebar (should be overridden by more specific rules for el-menu) */
.sidebar-nav a .el-icon,
.sidebar-footer a .el-icon {
  margin-right: 15px;
  font-size: 1.2em; /* This will be overridden later for menu icons */
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  height: 60px; /* Cố định chiều cao header */
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0; /* Ngăn header bị co lại */
}

.logo-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  overflow: hidden;
}

.sidebar-logo-no-collapsed {
  height: 60px;
  width: auto;
  object-fit: cover;
  max-width: 100%;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.sidebar-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  max-width: 100%;
  transition: opacity 0.3s ease;
  flex-shrink: 0;
}

.sidebar.is-collapsed .sidebar-logo {
  width: 40px;
  height: 40px;
  margin-right: 0;
  cursor: pointer;
}

.sidebar.is-collapsed .company-name {
  opacity: 0;
  width: 0;
  visibility: hidden;
}

.company-name {
  font-size: 1.4em;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  max-width: 100%;
}

.sidebar-logo-icon {
  height: 40px;
  width: 40px;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.sidebar.is-collapsed .sidebar-logo-icon {
  opacity: 1;
  display: block;
}

.sidebar:not(.is-collapsed) .sidebar-logo-icon {
  opacity: 0;
  width: 0;
  display: none;
}

.sidebar-nav {
  flex-grow: 1; /* Quan trọng: sidebar-nav sẽ chiếm hết không gian còn lại */
  overflow-y: auto; /* Thêm thanh cuộn cho sidebar-nav */
  overflow-x: hidden;
  /* Tùy chỉnh thanh cuộn cho sidebar-nav */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #c0c0c0 transparent; /* Firefox */
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background-color: transparent;
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
  border-left: 3px solid transparent;
}

.sidebar-nav a i,
.sidebar-footer a i {
  margin-right: 15px;
  font-size: 1.2em; /* This will be overridden later for footer icons */
  color: #777;
}

.sidebar-nav a:hover,
.sidebar-footer a:hover {
  background-color: #f0f0f0;
  color: #333;
}

.sidebar-nav li.active a {
  background-color: #e6f0ff;
  color: var(--estec-unique-color);
  border-left-color: #007bff;
  font-weight: bold;
}

.sidebar-nav li.active a i .el-icon {
  color: var(--estec-unique-color);
}

.sidebar-footer {
  margin-top: auto; /* Đẩy footer xuống dưới cùng */
  padding-top: 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0; /* Ngăn footer bị co lại */
}

.sidebar-nav a.router-link-exact-active .el-icon,
.sidebar-footer a.router-link-exact-active .el-icon {
  color: #007bff;
}

.toggle-button-wrapper {
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
}

.toggle-sidebar-button {
  background-color: #f0f2f5;
  border: none;
  color: #606266;
  font-size: 18px;
  width: 32px;
  height: 32px;
  transition: background-color 0.2s ease, color 0.2s ease;
  padding: 0;
  outline: none;
}

.toggle-sidebar-button:hover {
  background-color: #e6e6e6;
  color: #409eff;
}

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

/* Element Plus Menu Overrides */
.el-menu {
  border-right: none;
  width: 100%;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 270px;
}

.el-menu-item,
.el-sub-menu__title {
  height: 52px;
  line-height: 52px;
  color: #555 !important;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: background-color 0.2s, color 0.2s, border-left-color 0.2s;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-align: start;
  font-size: 15px;
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #f0f0f0 !important;
  color: #333 !important;
}

.el-menu-item.is-active,
.el-menu-item.active {
  background-color: #e6f0ff !important;
  color: var(--estec-unique-color) !important;
  border-left-color: #007bff !important;
  font-weight: bold;
}

.el-sub-menu.is-active > .el-sub-menu__title,
.el-sub-menu.active > .el-sub-menu__title {
  background-color: #e6f0ff !important;
  color: var(--estec-unique-color) !important;
  border-left-color: #007bff !important;
  font-weight: bold;
}

.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  margin-right: 15px;
  font-size: 18px;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.el-menu-item.is-active .el-icon,
.el-menu-item.active .el-icon,
.el-sub-menu.is-active > .el-sub-menu__title .el-icon,
.el-sub-menu.active > .el-sub-menu__title .el-icon {
  color: var(--estec-unique-color) !important;
}

/* Padding for nested levels */
.el-menu-item,
.el-sub-menu__title {
  padding-left: 20px !important;
}

.el-menu--inline .el-menu-item,
.el-menu--inline .el-sub-menu__title {
  padding-left: 40px !important;
}

.el-menu--inline .el-menu--inline .el-menu-item,
.el-menu--inline .el-menu--inline .el-sub-menu__title {
  padding-left: 60px !important;
}

.el-menu--inline .el-menu--inline .el-menu--inline .el-menu-item,
.el-menu--inline .el-menu--inline .el-menu--inline .el-sub-menu__title {
  padding-left: 80px !important;
}

/* Text overflow for long labels */
.el-menu-item span:not(.el-icon),
.el-sub-menu__title span:not(.el-icon) {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: start;
}

/* Collapsed sidebar adjustments */
.sidebar.is-collapsed .el-menu-item span:not(.el-icon),
.sidebar.is-collapsed .el-sub-menu__title span:not(.el-icon) {
  opacity: 0;
  width: 0;
  visibility: hidden;
  display: none;
}

.sidebar.is-collapsed .el-sub-menu__icon-arrow {
  display: none !important;
}

.sidebar.is-collapsed .el-menu-item {
  justify-content: center;
  padding: 0 !important;
}

.sidebar.is-collapsed .el-menu-item .el-icon,
.sidebar.is-collapsed .el-sub-menu__title .el-icon {
  margin-right: 0;
}

.sidebar.is-collapsed .el-sub-menu__title {
  justify-content: center;
  padding: 0 !important;
}

/* === Quan trọng: Loại bỏ max-height và overflow-y khỏi .el-menu--inline === */
/* Thay vào đó, áp dụng cho .sidebar-nav */
.el-menu--inline {
  background-color: #ffffff !important;
  /* Giữ nguyên các padding-left, width, v.v. đã được thiết lập cho các cấp độ con */
}

/* Footer styles */
.sidebar-footer a {
  font-size: 15px;
}

.sidebar-footer a .el-icon {
  font-size: 18px;
}

.el-sub-menu__title .el-sub-menu__icon-arrow {
  position: absolute;
  right: 20px;
  margin-top: -7px;
}
</style>
