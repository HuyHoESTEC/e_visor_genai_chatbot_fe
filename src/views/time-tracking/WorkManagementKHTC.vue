<template>
  <div class="work-management-khtc-container">
    <div v-if="isLoading" class="loading-message">
      Đang tải dữ liệu...
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="add-task-button" :icon="UploadFilled">Tải File lên</el-button>
          <el-button type="primary" v-on:click="addTask" class="add-task-button" :icon="Plus">Thêm công việc</el-button>
          <el-button type="warning" v-on:click="exportTask" class="add-task-button" :icon="Printer">Xuất File</el-button>
        </div>
        
        <el-select
          v-model="selectedUser"
          placeholder="Lọc theo người thực hiện"
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
          v-model="selectedProjectCode"
          placeholder="Lọc theo mã dự án"
          clearable
          @change="applyFilters"
          class="project-code-select"
        >
          <el-option
            v-for="code in uniqueProjectCode"
            :key="code.id"
            :label="code.name"
            :value="code.id"
          ></el-option>
        </el-select>

        <el-select
          v-model="selectedStatus"
          placeholder="Lọc theo trạng thái"
          clearable
          @change="applyFilters"
          class="status-select"
        >
          <el-option
            v-for="status in taskStatuses"
            :key="status.value"
            :label="getTranslatedStatusLabel(status.value, taskStatuses)"
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
        v-loading="isLoading"
        element-loading-text="Đang tải công việc..."
      >
        <template #empty>
          <div v-if="emptyData" class="empty-data-message">
            <el-empty description="Không có dữ liệu" />
          </div>
        </template>
        <el-table-column prop="task_id" label="Mã công việc" width="140" sortable></el-table-column>
        <el-table-column prop="description" label="Mô tả"></el-table-column>
        <el-table-column prop="full_name" label="Người thực hiện" width="180" sortable></el-table-column>
        <el-table-column prop="project_code" label="Mã dự án" width="120" sortable></el-table-column>
        <el-table-column prop="start_date" label="Ngày bắt đầu" width="150" sortable>
          <template #default="{ row }">
            {{ formatDate(row.start_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_date" label="Ngày kết thúc" width="150" sortable>
          <template #default="{ row }">
            {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="QTY" label="Số lượng" width="120" sortable></el-table-column>
        <el-table-column prop="status" label="Trạng thái" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getTranslatedStatusLabel(row.status, taskStatuses) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Hành động" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="editTask(row)" :icon="EditPen">Sửa</el-button>
            <el-button size="small" type="danger" @click="confirmDeleteTask(row)" :icon="Delete">Xóa</el-button>
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
        :users="dummyTasks"
        :statuses="taskStatuses"
        @save="saveTask"
        @close="closeDialog"
      />
    </div>
  </div>
</template>

<script>
import { Plus, UploadFilled, Search, EditPen, Delete, Printer } from "@element-plus/icons-vue";
import TaskFormDialog from "../../components/dialog/TaskFormDialog.vue";
import { useTaskData } from "../../composables/KHTC/useTaskData"; 
import { useTaskActions } from "../../composables/KHTC/useTaskActions";

export default {
  name: "WorkManagmentKHTC",
  components: {
    TaskFormDialog,
  },
  setup() {
    const {
      allTasks,
      isLoading,
      error,
      fetchDataAndInitialize,
      selectedUser,
      selectedProjectCode,
      selectedStatus,
      currentPage,
      pageSize,
      taskStatuses,
      dummyTasks,
      uniqueUsers,
      uniqueProjectCode,
      filteredTasks,
      paginatedTasks,
      applyFilters,
      emptyData
    } = useTaskData();

    const {
      dialogVisible,
      currentTask,
      getStatusTagType,
      getTranslatedStatusLabel,
      formatDate,
      addTask,
      editTask,
      saveTask,
      confirmDeleteTask,
      closeDialog,
    } = useTaskActions(allTasks, paginatedTasks, dummyTasks);

    // Xử lý sự kiện phân trang (có thể giữ lại ở đây hoặc đưa vào composable riêng nếu phức tạp hơn)
    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };

    const handleUploadFile = () => {
      alert("Chức năng tải file lên sẽ được phát triển!");
    };

    const exportTask = () => {
      alert("Chức năng xuất file sẽ được phát triển sau!");
    }

    return {
      isLoading,
      error,
      fetchDataAndInitialize,
      selectedUser,
      selectedProjectCode,
      selectedStatus,
      currentPage,
      pageSize,
      taskStatuses,
      dummyTasks,
      uniqueUsers,
      uniqueProjectCode,
      filteredTasks,
      paginatedTasks,
      applyFilters,
      emptyData,
      dialogVisible,
      currentTask,
      getStatusTagType,
      getTranslatedStatusLabel,
      formatDate,
      addTask,
      editTask,
      saveTask,
      confirmDeleteTask,
      closeDialog,
      handleSizeChange,
      handleCurrentChange,
      Plus,
      UploadFilled,
      SearchIcon: Search,
      handleUploadFile,
      EditPen,
      Delete,
      Printer,
      exportTask
    };
  },
};
</script>

<style scoped>
.work-management-khtc-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  background-color: #f9f9f9;
  flex-direction: column;
  overflow: scroll;
  overflow-x: hidden;
}

.loading-message, .error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #666;
}

.error-message {
  color: #f56c6c;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-direction: row;
}

.action-area {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.search-input {
  max-width: 350px;
}

.user-select, .status-select {
  min-width: 200px;
}

.tasks-table {
  flex-grow: 1; /* Bảng sẽ chiếm hết không gian còn lại */
  margin-bottom: 20px;
}

.pagination-controls {
  margin-top: auto; /* Đẩy phân trang xuống cuối */
  display: flex;
  justify-content: center;
  padding-top: 15px;
  padding-bottom: 15px;
}

.add-task-button {
  align-self: flex-end;
}

.table-data {
  display: contents;
}
</style>