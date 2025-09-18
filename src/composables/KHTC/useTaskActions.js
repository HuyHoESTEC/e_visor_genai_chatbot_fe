import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import { actionFormWorkManagementKHTCApi } from '../../services/auth.service';

export function useTaskActions(allTasks, paginatedTasks, dummyTasks, langStore, fetchDataAndInitialize) {
  const dialogVisible = ref(false);
  const currentTask = ref(null);
  const authStore = useAuthStore();
  const loggedInUserId = authStore.user?.id;
  const originalTaskData = ref(null); // Variable to save the original data

  const getStatusTagType = (status) => {
    switch (status) {
      case 0:
        return 'info';
      case 1:
        return 'primary';
      case 2:
        return 'warning';
      case 3:
        return 'success';
      case 4:
        return 'danger';
      default:
        return 'info';
    }
  };

  const getSiteTagType = (site => {
    switch (site) {
      case 'S':
        return 'success';
      case 'V':
        return 'danger';
      default:
        return 'info';
    }
  });

  const getTranslatedStatusLabel = (statusValue, taskStatuses) => {
    const status = taskStatuses.find(s => s.value === statusValue);
    return status ? status.label : statusValue;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const addTask = () => {
    currentTask.value = {
      task_id: '',
      full_name: '',
      project_code: '',
      description: '',
      start_date: '',
      end_date: '',
      QTY: 0,
      status: 'Chờ xử lý',
    };
    dialogVisible.value = true;
  };

  const editTask = (task) => {
    currentTask.value = JSON.parse(JSON.stringify(task));
    originalTaskData.value = JSON.parse(JSON.stringify(task)); // Save the original copy
    dialogVisible.value = true;
  };

  const saveTask = async (taskData, isEditingMode) => {
    const selectedAssignee = dummyTasks.value.find(user => user.id === taskData.full_name);
    if (selectedAssignee) {
      taskData.full_name = selectedAssignee.name;
    }
    const dmlAction = isEditingMode ? "update" : "insert";
    // Compare data to create payload
    const payload = {
      "request_id": `evisor-${Date.now()}`,
      'owner': loggedInUserId,
      'dml_action': dmlAction,
      form: {
        "id": isEditingMode ? taskData.task_id : null,
        "owner": loggedInUserId,
        "full_name": taskData.full_name || '',
        "project_code": taskData.project_code || '',
        "description": taskData.description || '',
        "start_date": taskData.start_date || '',
        "end_date": taskData.end_date || '',
        "QTY": taskData.QTY || 0,
        "site": taskData.site || '',
        "status": taskData.status || 0
      }
    };

    try {
      await actionFormWorkManagementKHTCApi(payload);
      const successMessage = isEditingMode
        ? langStore.t('UpdateWorkloadSuccess')
        : langStore.t('AddWorkloadSuccess');
      ElMessage.success(successMessage);

      if (fetchDataAndInitialize) {
        fetchDataAndInitialize();
      }
    } catch (err) {
      const errorMessage = isEditingMode
        ? langStore.t('ErrorOccurredWhenUpdated') + ` ${err.message}`
        : langStore.t('ErrorOccurredWhenInserted') + ` ${err.message}`
      ElMessage.error(errorMessage)
    } finally {
      dialogVisible.value = false;
    }

    // if (isEditingMode) {
    //   const index = allTasks.value.findIndex((t) => t.task_id === taskData.task_id);
    //   if (index !== -1) {
    //     allTasks.value[index] = { ...taskData };
    //     ElMessage.success("Cập nhật công việc thành công!");
    //   }
    // } else {
    //   const newTaskId = Math.max(0, ...allTasks.value.map(t => parseInt(t.task_id) || 0)) + 1;
    //   taskData.task_id = newTaskId.toString();
    //   allTasks.value.push({ ...taskData });
    //   ElMessage.success(langStore.t('AddWorkloadSuccess'));
    // }
    // dialogVisible.value = false;
  };

  const confirmDeleteTask = (task) => {
    ElMessageBox.confirm(
      langStore.t('ConfirmDeleteWorkload') + ` ${task.task_id}` + ' ?',
      langStore.t('ConfirmDelete'),
      {
        confirmButtonText: langStore.t('DeleteAct'),
        cancelButtonText: langStore.t('DestroyAct'),
        type: "warning",
      }
    )
      .then(async () => {
        const payload = {
          "request_id": `evisor-${Date.now()}`,
          'owner': loggedInUserId,
          'dml_action': "delete",
          form: {
            "id": task.task_id,
            "owner": task.owner || '',
            "full_name": task.full_name || '',
            "project_code": task.project_code || '',
            "description": task.description || '',
            "start_date": task.start_date || '',
            "end_date": task.end_date || '',
            "QTY": task.QTY || 0,
            "site": task.site || '',
            "status": task.status || 0
          }
        };

        try {
          await actionFormWorkManagementKHTCApi(payload);
          allTasks.value = allTasks.value.filter((t) => t.task_id !== task.task_id);
          ElMessage({
            type: "success",
            message: langStore.t('DeleteWorkloadSuccess'),
          });
          if (fetchDataAndInitialize) {
            fetchDataAndInitialize();
          }
          // Kiểm tra lại trang hiện tại nếu xóa hết task trên trang đó
          if (paginatedTasks.value.length === 0 && paginatedTasks.currentPage > 1) { // Lưu ý: paginatedTasks cần có currentPage nếu muốn dùng ở đây
              // Ở đây bạn cần truyền currentPage từ useTaskData hoặc tìm cách khác để cập nhật
              // Để đơn giản, tôi sẽ giả định rằng việc xóa sẽ tự động re-render và xử lý phân trang
              // Một cách tốt hơn là truyền hàm handleCurrentChange từ useTaskData vào đây
          }
        } catch (error) {
          ElMessage.error(langStore.t('ErrorOccurredWhenDeleted') + ` ${error.message}`);
        }
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: langStore.t('CancelDelete'),
        });
      });
  };

  const closeDialog = () => {
    currentTask.value = null;
    dialogVisible.value = false;
  };

  return {
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
    loggedInUserId,
    originalTaskData,
    getSiteTagType,
  };
}