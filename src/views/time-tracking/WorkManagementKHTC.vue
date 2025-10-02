<template>
  <div class="work-management-khtc-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t('DataUploading') }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="add-task-button" :icon="UploadFilled">{{ langStore.t('FileUpload') }}</el-button>
          <el-button type="primary" v-on:click="addTask" class="add-task-button" :icon="Plus">{{ langStore.t('AddWork') }}</el-button>
          <el-button type="warning" v-on:click="exportTask" class="add-task-button" :icon="Printer">{{ langStore.t('FileExport') }}</el-button>
        </div>
        
        <el-select
          v-model="selectedUser"
          :placeholder="langStore.t('FilterBasedOnAssign')"
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
          :placeholder="langStore.t('FilterBasedOnProjectCode')"
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
          :placeholder="langStore.t('FilterBasedOnStatus')"
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
        :element-loading-text="langStore.t('WorkUploading')"
      >
        <template #empty>
          <div v-if="emptyData" class="empty-data-message">
            <el-empty :description="langStore.t('NoData')" />
          </div>
        </template>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="task_id" :label="langStore.t('JobCode')" sortable width="100"></el-table-column>
        <el-table-column prop="description" :label="langStore.t('JobDescription')"></el-table-column>
        <el-table-column prop="full_name" :label="langStore.t('HandlePerson')" width="180" sortable></el-table-column>
        <el-table-column prop="project_code" :label="langStore.t('ProjectCode')" sortable></el-table-column>
        <el-table-column prop="start_date" :label="langStore.t('StartDate')" width="150" sortable>
          <template #default="{ row }">
            {{ formatDate(row.start_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="end_date" :label="langStore.t('EndDate')" width="150" sortable>
          <template #default="{ row }">
            {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="QTY" :label="langStore.t('JobHours')" width="100" sortable></el-table-column>
        <el-table-column prop="status" :label="langStore.t('JobStatus')" width="150" sortable>
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" style="font-weight: bolder;">
              {{ getTranslatedStatusLabel(row.status, taskStatuses) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="site" :label="langStore.t('JobArea')" sortable>
          <template #default="{ row }">
            <el-tag :type="getSiteTagType(row.site)" style="font-weight: bolder;">
              {{ getTranslatedStatusLabel(row.site, taskSites) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="langStore.t('JobAction')" width="auto">
          <template #default="{ row }">
            <el-button size="small" @click="editTask(row)" :icon="EditPen">{{ langStore.t('EditAct') }}</el-button>
            <el-button size="small" type="danger" @click="confirmDeleteTask(row)" :icon="Delete">{{ langStore.t('DeleteAct') }}</el-button>
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
        :sites="taskSites"
        @save="saveTask"
        @close="closeDialog"
      />
    </div>
    <FileUploadDialog 
      v-model="uploadDialogVisible"
      @uploadSuccess="handleUploadSuccess"
    />
  </div>
</template>

<script>
import { Plus, UploadFilled, Search, EditPen, Delete, Printer } from "@element-plus/icons-vue";
import TaskFormDialog from "../../components/dialog/TaskFormDialog.vue";
import { useTaskData } from "../../composables/KHTC/useTaskData"; 
import { useTaskActions } from "../../composables/KHTC/useTaskActions";
import FileUploadDialog from "../../components/upload/FileUploadDialog.vue";
import { ref } from "vue";
import { useLanguageStore } from "../../stores/language";

export default {
  name: "WorkManagmentKHTC",
  components: {
    TaskFormDialog,
    FileUploadDialog,
  },
  setup() {
    const langStore = useLanguageStore();

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
      emptyData,
      taskSites
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
      getSiteTagType,
    } = useTaskActions(allTasks, paginatedTasks, dummyTasks, langStore, fetchDataAndInitialize);

    // Reactive variable to control display dialog upload
    const uploadDialogVisible = ref(false);
    // Function to open dialog upload file
    const handleUploadFile = () => {
      uploadDialogVisible.value = true;
    }
    // Function resolve after upload success
    const handleUploadSuccess = () => {
      // Callback fetch data function to update new data table
      fetchDataAndInitialize();
    }

    // Xử lý sự kiện phân trang (có thể giữ lại ở đây hoặc đưa vào composable riêng nếu phức tạp hơn)
    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
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
      exportTask,
      handleUploadSuccess,
      uploadDialogVisible,
      langStore,
      taskSites,
      getSiteTagType
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