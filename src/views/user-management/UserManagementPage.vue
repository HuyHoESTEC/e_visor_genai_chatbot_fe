<template>
    <div class="user-management-screen" style="padding: 20px;">
        <h2>Quản lý Nhân sự</h2>

        <div style="margin-bottom: 20px;">
            <el-button type="primary" :icon="Plus" @click="handleCreateUser">Thêm nhân sự mới</el-button>
            <el-button :icon="Refresh" @click="fetchUsers">Làm mới dữ liệu</el-button>
        </div>

        <el-tabs v-model="activeTab" type="border-card" class="demo-tabs">
            <el-tab-pane label="Tất cả nhân sự" name="all">
                <UserListTable 
                    :users="allUsers"
                    :loading="isLoading"
                    @view="handleViewUser"
                    @edit="handleEditUser"
                    @delete="handleDeleteUser"
                    @toggle-status="handleToggleStatus"
                />
            </el-tab-pane>

            <el-tab-pane
                v-for="dept in departments"
                :key="dept.id"
                :label="dept.name"
                :name="String(dept.id)"
            >
                <UserListTable 
                    :users="getUserByDepartment(dept.id)"
                    :loading="isLoading"
                    @view="handleViewUser"
                    @edit="handleEditUser"
                    @delete="handleDeleteUser"
                    @toggle-status="handleToggleStatus"
                />
            </el-tab-pane>
        </el-tabs>

        <el-dialog v-model="dialogVisible" :title="dialogType === 'view' ? 'Thông tin chi tiết nhân sự' : 'Chỉnh sửa thông tin nhân sự'">
            <div v-if="selectedUser">
                <p><strong>Họ tên:</strong>{{ selectedUser.full_name }}</p>
                <p><strong>Email:</strong>{{ selectedUser.email }}</p>
                <p><strong>Phòng ban:</strong>{{ getDepartmentName(selectedUser.department_id) }}</p>
            </div>
            <template #footer>
                <el-button @click="dialogVisible = false">Đóng</el-button>
                <el-button type="primary" v-if="dialogType === 'edit'" @click="dialogVisible = false">Lưu thay đổi</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted, ref } from "vue";
import UserListTable from "../../components/table/user_management/UserListTable.vue";

export default {
  name: "UserManagementPage",
  components: {
    Plus,
    Refresh,
    UserListTable,
  },
  setup() {
    const activeTab = ref("all");
    const isLoading = ref(false);
    const allUsers = ref([]);
    const dialogVisible = ref(false);
    const selectedUser = ref(null);
    const dialogType = ref("view");

    // Department list
    const departments = [
      { id: "0001", name: "Ban Giám Đốc" },
      { id: "0002", name: "Phòng Kỹ Thuật" },
      { id: "0003", name: "Phòng Nhân Sự" },
      { id: "0004", name: "Phòng Kinh Doanh" },
    ];
    const fetchUsers = async () => {
      isLoading.value = true;
      setTimeout(() => {
        allUsers.value = [
          {
            user_id: "00003",
            full_name: "John Doe",
            username: "Jdoe",
            phone_number: "01234556",
            email: "john.doe@test.com",
            avatar: null,
            role_id: 1,
            department_id: "0003", // Phòng Nhân sự
            is_active: false,
          },
          {
            user_id: "00004",
            full_name: "Alice Smith",
            username: "Asmith",
            phone_number: "09876543",
            email: "alice@test.com",
            avatar: null,
            role_id: 2,
            department_id: "0002", // Phòng Kỹ thuật
            is_active: true,
          },
          {
            user_id: "00005",
            full_name: "Tran Van B",
            username: "Btran",
            phone_number: "09123123",
            email: "btran@test.com",
            avatar: null,
            role_id: 3,
            department_id: "0002", // Phòng Kỹ thuật
            is_active: true,
          },
        ];
        isLoading.value = false;
      }, 500);
    };

    const getUserByDepartment = (deptId) => {
      return allUsers.value.filter((user) => user.department_id === deptId);
    };

    const getDepartmentName = (deptId) => {
      const dept = departments.find((d) => d.id === deptId);
      return dept ? dept.name : deptId;
    };

    const handleCreateUser = () => {
      ElMessage.info("Mở formtheem mới nhân sự.");
    };

    const handleViewUser = (user) => {
      selectedUser.value = user;
      dialogType.value = "view";
      dialogVisible.value = true;
    };

    const handleEditUser = (user) => {
      selectedUser.value = { ...user }; // Clone object to avoid editing directly into the table without saving
      dialogType.value = "edit";
      dialogVisible.value = true;
    };

    const handleDeleteUser = (user) => {
      // Gọi API xóa user ở đây
      allUsers.value = allUsers.value.filter((u) => u.user_id !== user.user_id);
      ElMessage.success(`Đã xóa nhân sự ${user.full_name}`);
    };

    const handleToggleStatus = (user) => {
      // Gọi API active/deactive user
      // user.is_active đã được v-model cập nhật ở con, ở đây ta chỉ cần gọi API sync lại DB
      console.log(`Calling API update status for ${user.username} to ${user.is_active}`);
    };

    onMounted(() =>{
        fetchUsers();
    });

    return {
      Plus,
      Refresh,
      activeTab,
      isLoading,
      allUsers,
      dialogVisible,
      selectedUser,
      dialogType,
      departments,
      fetchUsers,
      getUserByDepartment,
      getDepartmentName,
      handleCreateUser,
      handleViewUser,
      handleEditUser,
      handleDeleteUser,
      handleToggleStatus,
    };
  },
};
</script>

<style>
.user-management-screen {
    background-color: white;
    height: 100%;
}
</style>
