<template>
  <div class="work-management-container">
    <h1 class="page-title">{{ langStore.t("workManagementTitle") }}</h1>

    <div class="filter-section">
      <el-input
        v-model="searchQuery"
        :placeholder="langStore.t('searchPlaceholder')"
        clearable
        @clear="applyFilters"
        @keyup.enter="applyFilters"
        class="search-input"
      >
        <template #append>
          <el-button :icon="SearchIcon" @click="applyFilters">{{
            langStore.t("searchButton")
          }}</el-button>
        </template>
      </el-input>

      <el-select
        v-model="selectedUser"
        :placeholder="langStore.t('filterByUserPlaceholder')"
        clearable
        @change="applyFilters"
        class="user-select"
      >
        <el-option
          v-for="user in uniqueUsers"
          :key="user.id"
          :label="user.name"
          :value="user.id"
        ></el-option>
      </el-select>

      <el-select
        v-model="selectedStatus"
        :placeholder="langStore.t('filterByStatusPlaceholder')"
        clearable
        @change="applyFilters"
        class="status-select"
      >
        <el-option
          v-for="status in taskStatuses"
          :key="status.value"
          :label="langStore.t(status.labelKey)"
          :value="status.value"
        ></el-option>
      </el-select>
    </div>

    <el-table
      :data="paginatedTasks"
      style="width: 100%"
      border
      stripe
      class="tasks-table"
      v-loading="loading"
      element-loading-text="Loading tasks..."
    >
      <el-table-column
        type="index"
        :label="langStore.t('tableNo')"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="title"
        :label="langStore.t('tableTaskTitle')"
        sortable
      ></el-table-column>
      <el-table-column
        prop="description"
        :label="langStore.t('tableDescription')"
      ></el-table-column>
      <el-table-column
        prop="assignee.name"
        :label="langStore.t('tableAssignee')"
        sortable
      ></el-table-column>
      <el-table-column prop="dueDate" :label="langStore.t('tableDueDate')" sortable>
        <template #default="{ row }">
          {{ formatDate(row.dueDate, langStore.getLanguage === 'vn' ? 'vi-VN' : 'en-US') }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="langStore.t('tableStatus')" sortable>
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ langStore.t(getTranslatedStatusKey(row.status)) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="langStore.t('tableActions')" width="150">
        <template #default="{ row }">
          <el-button size="small" @click="editTask(row)">{{
            langStore.t("editButton")
          }}</el-button>
          <el-button size="small" type="danger" @click="confirmDeleteTask(row)">{{
            langStore.t("deleteButton")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="filteredTasks.length"
      :page-sizes="[5, 10, 20, 50]"
      v-model:page-size="pageSize"
      v-model:current-page="currentPage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-controls"
    ></el-pagination>

    <TaskFormDialog
      v-model="dialogVisible"
      :taskToEdit="currentTask"
      :users="dummyUsers"
      :statuses="taskStatuses"
      @save="saveTask"
      @close="closeDialog"
    />

    <el-button type="primary" @click="addTask" class="add-task-button">{{
      langStore.t("addTaskButton")
    }}</el-button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus"; // Import ElMessage và ElMessageBox
import { Search } from "@element-plus/icons-vue"; // Import icon Search
import { useLanguageStore } from "../../stores/language";
import TaskFormDialog from "../../components/dialog/TaskFormDialog.vue";
import { 
    dummyUsers as dummyUsersService,
    taskStatuses as taskStatusesService,
    generateDummyTasks,
    getStatusTagType as getStatusTagTypeService,
    getTranslatedStatusKey as getTranslatedStatusKeyService,
    formatDate as formatDateService, 
} from "../../services/taskService";

export default {
  name: "RndWorkManagement",
  components: {
    TaskFormDialog,
  },
  setup() {
    const langStore = useLanguageStore();

    const allTasks = ref([]);
    const loading = ref(true);
    const SearchIcon = Search; // Để expose icon cho template
    const formatDate = formatDateService; // <-- Thêm dòng này!
    const getStatusTagType = getStatusTagTypeService; // <-- Thêm dòng này!
    const getTranslatedStatusKey = getTranslatedStatusKeyService;
    const taskStatuses = taskStatusesService;
    const dummyUsers = dummyUsersService;

    // State cho bộ lọc
    const searchQuery = ref("");
    const selectedUser = ref(null);
    const selectedStatus = ref(null);

    // State cho phân trang
    const currentPage = ref(1);
    const pageSize = ref(10);

    // State cho dialog chỉnh sửa/thêm
    const dialogVisible = ref(false);
    const currentTask = ref(null); // Sẽ là null khi thêm mới, là task object khi chỉnh sửa

    // Computed properties
    const uniqueUsers = computed(() => {
        // Trả về dummyUsers ngay lập tức nếu allTasks.value rỗng (chưa tải xong)
        // hoặc nếu không có task nào để trích xuất người dùng duy nhất
        if (!allTasks.value || allTasks.value.length === 0) {
            return dummyUsers;
        }

        const users = new Map();
        allTasks.value.forEach((task) => {
            // Kiểm tra task.assignee trước khi truy cập id
            if (task.assignee && task.assignee.id !== null && !users.has(task.assignee.id)) {
            users.set(task.assignee.id, task.assignee);
            }
        });
        return Array.from(users.values());
    });


    const filteredTasks = computed(() => {
        let filtered = allTasks.value;

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            filtered = filtered.filter(
            (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.assignee.name.toLowerCase().includes(query)
            );
        }

        if (selectedUser.value) {
            filtered = filtered.filter((task) => task.assignee.id === selectedUser.value);
        }

        if (selectedStatus.value) {
            filtered = filtered.filter((task) => task.status === selectedStatus.value);
        }

        return filtered;
    });

    const paginatedTasks = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return filteredTasks.value.slice(start, end);
    });

    // Methods
    const applyFilters = () => {
        currentPage.value = 1; // Reset về trang 1 khi lọc
    };

    const addTask = () => {
        currentTask.value = null; // Đặt về null để TaskFormDialog biết là thêm mới
        dialogVisible.value = true;
    };

    const editTask = (task) => {
        currentTask.value = task; // Gán task cần chỉnh sửa
        dialogVisible.value = true;
    };

    const saveTask = (taskData, isEditingMode) => {
        // Cập nhật assignee name dựa trên id
        const selectedAssignee = dummyUsers.find(
            (user) => user.id === taskData.assignee.id
        );
        if (selectedAssignee) {
            taskData.assignee.name = selectedAssignee.name;
        }

        if (isEditingMode) {
            const index = allTasks.value.findIndex((t) => t.id === taskData.id);
            if (index !== -1) {
            allTasks.value[index] = { ...taskData }; // Cập nhật task
            ElMessage.success(langStore.t("taskUpdatedMessage"));
            }
        } else {
            // Thêm task mới với ID duy nhất (sử dụng timestamp hoặc max ID + 1)
            const newId = Math.max(0, ...allTasks.value.map((t) => t.id)) + 1; // Đảm bảo min id là 0 nếu mảng rỗng
            taskData.id = newId;
            allTasks.value.push({ ...taskData });
            ElMessage.success(langStore.t("taskAddedMessage"));
        }
    };

    const confirmDeleteTask = (task) => {
        ElMessageBox.confirm(
            langStore.t("deleteConfirmMessage", { taskTitle: task.title }),
            langStore.t("deleteConfirmTitle"),
            {
            confirmButtonText: langStore.t("confirmButton"),
            cancelButtonText: langStore.t("cancelButton"),
            type: "warning",
            }
        )
            .then(() => {
            allTasks.value = allTasks.value.filter((t) => t.id !== task.id);
            ElMessage({
                type: "success",
                message: langStore.t("taskDeletedMessage"),
            });
            // Kiểm tra lại trang hiện tại nếu xóa hết task trên trang đó
            if (paginatedTasks.value.length === 0 && currentPage.value > 1) {
                currentPage.value--;
            }
            })
            .catch(() => {
            ElMessage({
                type: "info",
                message: langStore.t("deleteCanceledMessage"),
            });
            });
    };

    const closeDialog = () => {
        // Logic xử lý khi dialog đóng (ví dụ: reset currentTask)
        currentTask.value = null; // Đặt lại về null để chuẩn bị cho lần thêm mới tiếp theo
    };

    const handleSizeChange = (val) => {
        pageSize.value = val;
        currentPage.value = 1; // Reset về trang 1 khi thay đổi số lượng mục trên mỗi trang
    };

    const handleCurrentChange = (val) => {
        currentPage.value = val;
    };

    // Lifecycle hook
    onMounted(() => {
        // Giả lập thời gian tải dữ liệu
        setTimeout(() => {
            allTasks.value = generateDummyTasks();
            loading.value = false;
        }, 1000);
    });

    return {
        langStore,
        allTasks,
        loading,
        SearchIcon,
        formatDate,
        getStatusTagType,
        getTranslatedStatusKey,
        taskStatuses,
        dummyUsers,
        searchQuery,
        selectedUser,
        selectedStatus,
        currentPage,
        pageSize,
        dialogVisible,
        currentTask,
        uniqueUsers,
        filteredTasks,
        paginatedTasks,
        applyFilters,
        addTask,
        editTask,
        saveTask,
        confirmDeleteTask,
        closeDialog,
        handleSizeChange,
        handleCurrentChange,
    }
  },
};
</script>

<style scoped>
.work-management-container {
  padding: 20px;
  background-color: #f9f9f9;
  height: 100%;
  overflow: scroll;
}

.page-title {
  color: var(--estec-unique-color);
  font-size: 2em;
  margin-bottom: 20px;
  text-align: center;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.search-input {
  width: 300px;
  max-width: 100%;
}

.user-select,
.status-select {
  width: 200px;
  max-width: 100%;
}

.tasks-table {
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.pagination-controls {
  justify-content: center;
  margin-top: 20px;
}

.add-task-button {
  margin-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
}

/* Custom styles for El-Tag */
.el-tag {
  font-weight: bold;
}

.el-tag--info {
  background-color: #e0e0e0;
  color: #606060;
}

.el-tag--success {
  background-color: #e6f7d0;
  color: #52c41a;
}

.el-tag--danger {
  background-color: #ffe0e0;
  color: #ff4d4f;
}

.el-tag:not(.el-tag--info):not(.el-tag--success):not(.el-tag--danger) {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input,
  .user-select,
  .status-select {
    width: 100%;
  }
}
</style>
