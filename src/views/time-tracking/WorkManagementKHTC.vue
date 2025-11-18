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
          <el-button type="danger" v-on:click="handleDownloadClick" class="add-task-button" :icon="Download"></el-button>
          <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh"></el-button>
        </div>
        <div class="filter-area">
          <el-select
          v-model="selectedUser"
          :placeholder="langStore.t('FilterBasedOnAssign')"
          clearable
          @change="applyFilters"
          class="user-select"
          style="width: 60%;"
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
            style="width: 50%;"
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
            style="width: 60%;"
          >
            <el-option
              v-for="status in taskStatuses"
              :key="status.value"
              :label="getTranslatedStatusLabel(status.value, taskStatuses)"
              :value="status.value"
            ></el-option>
          </el-select>

          <el-select
            v-model="selectedVersion"
            placeholder="Lọc theo version"
            clearable
            @change="applyFilters"
            class="status-select"
            style="width: 50%;"
          >
            <el-option
              v-for="version in uniqueVersion"
              :key="version.id"
              :label="version.name"
              :value="version.id"
            ></el-option>
          </el-select>

          <el-date-picker
            v-model="startAndEndDateVal"
            type="daterange"
            :start-placeholder="langStore.t('StartDate')"
            :end-placeholder="langStore.t('EndDate')"
            value-format="YYYY-MM-DD HH:mm:ss"
            placement="bottom-start"
            style="width: 100%;"
          />
          <el-button type="primary" v-on:click="filterByDate" class="add-task-button" :icon="Filter"></el-button>
        </div>
      </div>

      <div v-if="advanceDeleteVisible" class="advance-option-delete">
        <el-button 
          type="danger"
          class="add-task-button"
          :icon="Delete"
          v-on:click="handleDeleteAction"
          :loading="isDeleting"
          :disabled="isDeleting"
        >
          {{ deleteButtonLabel }}
        </el-button>
      </div>

      <el-table
        :data="paginatedTasks"
        style="width: 100%"
        border
        stripe
        class="tasks-table"
        v-loading="isLoading"
        :element-loading-text="langStore.t('WorkUploading')"
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
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
        :page-sizes="[5, 10, 20, 50, 100]"
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
    <DownloadFilterDialogKHTC
      v-model="downloadDialogVisible"
      :download-url="downloadFileUrl"
      :file-name="downloadFileName"
      :is-preparing="isDownloadPreparing"
      @create-download-link="handleCreateDownloadLink"
      @confirm-download="confirmDownloadFile"
    />
  </div>
</template>

<script>
import { Plus, UploadFilled, Search, EditPen, Delete, Printer, Refresh, Filter, Download } from "@element-plus/icons-vue";
import TaskFormDialog from "../../components/dialog/TaskFormDialog.vue";
import { useTaskData } from "../../composables/KHTC/useTaskData"; 
import { useTaskActions } from "../../composables/KHTC/useTaskActions";
import FileUploadDialog from "../../components/upload/FileUploadDialog.vue";
import { computed, ref } from "vue";
import { useLanguageStore } from "../../stores/language";
import { useAdvanceDelete } from "../../composables/KHTC/useAdvanceDelete";
import { useDownloadWorkManagement } from "../../composables/KHTC/useDownloadWorkManagement";
import DownloadFilterDialogKHTC from "../../components/dialog/DownloadFilterDialogKHTC.vue";

export default {
  name: "WorkManagmentKHTC",
  components: {
    TaskFormDialog,
    FileUploadDialog,
    DownloadFilterDialogKHTC,
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
      taskSites,
      startAndEndDateVal,
      loadTasksWithFilters,
      selectedVersion,
      uniqueVersion
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

    const {
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      openDownloadDialog,
      downloadFile: createDownloadLinkApi,
      confirmDownloadFile
    } = useDownloadWorkManagement();
  

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

    const handleDownloadClick = () => {
      openDownloadDialog();
    };

    const handleCreateDownloadLink = (filterPayload) => {
      createDownloadLinkApi(filterPayload);
    };

    const refreshData = () => {
      fetchDataAndInitialize();
    };

    const filterByDate = () => {
      filterByDateAction();
    };

    const selectedRows = ref([]);
    const advanceDeleteVisible = computed(() => currentDeleteMode.value !== 'none');
    
    const {
      isDeleting,
      currentDeleteMode,
      deleteButtonLabel,
      handleDeleteAction,
      filterByDateAction
    } = useAdvanceDelete(selectedRows, selectedUser, selectedProjectCode, langStore, fetchDataAndInitialize, startAndEndDateVal, loadTasksWithFilters);

    const handleSelectionChange = (val) => {
      selectedRows.value = val;
    };

    const tableRowClassName = ({ row, rowIndex }) => {
      const status = Number(row.status);

      if (status === 5) {
        return 'highlight-status-5-row';
      } else if (status === 6) {
        return 'highlight-status-6-row';
      }

      return '';
    };

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
      handleUploadSuccess,
      uploadDialogVisible,
      langStore,
      taskSites,
      getSiteTagType,
      Refresh,
      refreshData,
      Filter,
      advanceDeleteVisible,
      startAndEndDateVal,
      filterByDate,
      selectedRows,
      handleSelectionChange,
      isDeleting,
      handleDeleteAction,
      currentDeleteMode,
      deleteButtonLabel,
      loadTasksWithFilters,
      selectedVersion,
      uniqueVersion,
      tableRowClassName,
      handleDownloadClick,
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      openDownloadDialog,
      downloadFile: createDownloadLinkApi,
      confirmDownloadFile,
      handleCreateDownloadLink,
      Download,
      DownloadFilterDialogKHTC,
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
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.action-area {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.search-input {
  max-width: 350px;
}

.user-select, .status-select, .project-code-select {
  min-width: 100px;
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

.advance-option-delete {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  flex-direction: row;
}

.filter-area {
  display: flex;
  flex-direction: row;
  gap: 5px;
  width: 100%;
}

/* 1. Áp dụng màu highlight lên thẻ TR (cho cả dòng thường và dòng stripe) */
.tasks-table :deep(.highlight-status-5-row),
.tasks-table :deep(.el-table__row--striped.highlight-status-5-row) {
    background-color: #f28874 !important; 
}

/* 2. Ghi đè màu nền trên TỪNG Ô TD */
/* Đây là bước quan trọng để đảm bảo màu highlight không bị ghi đè bởi màu TD mặc định */
.tasks-table :deep(.highlight-status-5-row > td) {
    background-color: #f28874 !important; /* Lặp lại màu TR */
    color: #464646 !important;
}

/* --- Status 6 --- */

/* 1. Áp dụng màu highlight lên thẻ TR (cho cả dòng thường và dòng stripe) */
.tasks-table :deep(.highlight-status-6-row),
.tasks-table :deep(.el-table__row--striped.highlight-status-6-row) {
    background-color: #A9E8B9 !important;
}

/* 2. Ghi đè màu nền trên TỪNG Ô TD */
.tasks-table :deep(.highlight-status-6-row > td) {
    background-color: #A9E8B9 !important; /* Lặp lại màu TR */
    color: #464646 !important;
}

.tasks-table :deep(.el-table__row:not(.highlight-status-5-row):not(.highlight-status-6-row) > td) {
    /* Bỏ hoàn toàn quy tắc này hoặc dùng cách sau (rất cụ thể): */
    /* Để Element Plus tự quản lý màu nền, đặc biệt là màu stripe */
    background-color: var(--el-table-tr-bg-color) !important; /* Dành cho dòng chẵn */
}

.tasks-table :deep(.el-table__row--striped:not(.highlight-status-5-row):not(.highlight-status-6-row) > td) {
    background-color: var(--el-table-fill-base) !important; /* Dành cho dòng lẻ (stripe) */
}

.tasks-table :deep(.el-table__cell) {
    /* Cho phép văn bản bị cắt và xuống dòng */
    white-space: normal; 
    word-break: break-word; /* Đảm bảo từ dài cũng được ngắt */
    /* Quan trọng: Tăng chiều cao dòng mặc định của bảng để chứa được nhiều dòng */
    padding: 8px 0; /* Tăng padding trên/dưới nếu cần */
}

/* Áp dụng cho el-tag bên trong cột "Job Area" */
.tasks-table :deep(.el-tag) {
    /* el-tag là inline-block, cần cho phép nội dung bên trong nó xuống dòng nếu cần */
    white-space: normal !important;
    height: auto; /* Cho phép chiều cao tự động giãn ra */
    line-height: normal; /* Đảm bảo line-height không bị cứng */
    display: inline-flex; /* Tùy chọn: giúp căn chỉnh nội dung tốt hơn */
}
</style>