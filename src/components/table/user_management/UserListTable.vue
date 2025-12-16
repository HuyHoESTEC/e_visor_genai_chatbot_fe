<template>
  <div class="user-list-table">
    <div style="margin-bottom: 15px; display: flex; justify-content: flex-end">
      <el-input
        v-model="searchQuery"
        placeholder="Tìm kiếm tên, email..."
        style="width: 300px"
        clearable
        :prefix-icon="Search"
      />
    </div>

    <el-table :data="filteredData" border stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="user_id" label="Mã NV" width="100" sortable />
      <el-table-column label="Họ tên" min-width="180">
        <template #default="{ row }">
          <div style="display: flex; align-items: center">
            <el-avatar
              :size="30"
              :src="
                row.avatar ||
                'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
              "
            />
            <div style="margin-left: 10px; display: flex; flex-direction: column">
              <span style="font-weight: bold">{{ row.full_name }}</span>
              <span style="font-size: 12px; color: #888">@{{ row.username }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Liên hệ" min-width="200">
        <template #default="{ row }">
          <div>
            <el-icon><Message /></el-icon> {{ row.email }}
          </div>
          <div>
            <el-icon><Phone /></el-icon> {{ row.phone_number }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="role_id" label="Vai trò" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role_id === 1 ? 'danger' : 'info'">
            {{ getRoleName(row.role_id) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Trạng thái" width="150" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.is_active"
            active-text="Active"
            inactive-text="Deactive"
            inline-prompt
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Hành động" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-tooltip content="Xem chi tiết" placement="top">
            <el-button
              type="info"
              :icon="View"
              circle
              size="small"
              @click="$emit('view', row)"
            />
          </el-tooltip>

          <el-tooltip content="Chỉnh sửa" placement="top">
            <el-button
              type="primary"
              :icon="Edit"
              circle
              size="small"
              @click="$emit('edit', row)"
            />
          </el-tooltip>

          <el-tooltip content="Xóa nhân sự" placement="top">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              size="small"
              @click="confirmDelete(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px; display: flex; justify-content: flex-end">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredData.length"
        :page-size="10"
      />
    </div>
  </div>
</template>

<script>
import { Delete, Edit, Message, Phone, Search, View } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, ref } from "vue";

export default {
  name: "UserListTable",
  components: {
    Search,
    Message,
    Phone,
    View,
    Edit,
    Delete,
  },
  props: {
    users: {
      type: Array,
      required: true,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["view", "edit", "delete", "toggle-status"],
  setup(props, { emit }) {
    const searchQuery = ref("");
    // Filter search local
    const filteredData = computed(() => {
      if (!searchQuery.value) return props.users;
      const lowerQuery = searchQuery.value.toLowerCase();
      return props.users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      );
    });

    // Helper to change role_id to text
    const getRoleName = (roleId) => {
      const roles = { 255: "Admin", 127: "Managger" };
      return roles[roleId] || "Unknown";
    };

    const handleStatusChange = (row) => {
      emit("toggle-status", row);
      ElMessage.success(`Đã cập nhập trạng thái của ${row.full_name}`);
    };

    const confirmDelete = (row) => {
      ElMessageBox.confirm(
        `Bạn có chắc chắc muốn xóa nhân sự ${row.full_name} ?`,
        "Cảnh báo",
        {
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          type: "warning",
        }
      )
        .then(() => {
          emit("delete", row);
        })
        .catch(() => {});
    };

    return {
      Search,
      Message,
      Phone,
      View,
      Edit,
      Delete,
      searchQuery,
      filteredData,
      getRoleName,
      handleStatusChange,
      confirmDelete,
    };
  },
};
</script>

<style scoped></style>
