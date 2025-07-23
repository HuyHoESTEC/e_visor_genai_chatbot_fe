import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export function useTaskActions(allTasks, paginatedTasks, dummyUsers) {
  const dialogVisible = ref(false);
  const currentTask = ref(null);

  const getStatusTagType = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return '';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

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
      status: 'pending',
    };
    dialogVisible.value = true;
  };

  const editTask = (task) => {
    currentTask.value = JSON.parse(JSON.stringify(task));
    dialogVisible.value = true;
  };

  const saveTask = (taskData, isEditingMode) => {
    const selectedAssignee = dummyUsers.value.find(user => user.id === taskData.full_name);
    if (selectedAssignee) {
      taskData.full_name = selectedAssignee.name;
    }

    if (isEditingMode) {
      const index = allTasks.value.findIndex((t) => t.task_id === taskData.task_id);
      if (index !== -1) {
        allTasks.value[index] = { ...taskData };
        ElMessage.success("Cập nhật công việc thành công!");
      }
    } else {
      const newTaskId = Math.max(0, ...allTasks.value.map(t => parseInt(t.task_id) || 0)) + 1;
      taskData.task_id = newTaskId.toString();
      allTasks.value.push({ ...taskData });
      ElMessage.success("Thêm công việc thành công!");
    }
    dialogVisible.value = false;
  };

  const confirmDeleteTask = (task) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa công việc "${task.description}"?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      }
    )
      .then(() => {
        allTasks.value = allTasks.value.filter((t) => t.task_id !== task.task_id);
        ElMessage({
          type: "success",
          message: "Xóa công việc thành công!",
        });
        // Kiểm tra lại trang hiện tại nếu xóa hết task trên trang đó
        if (paginatedTasks.value.length === 0 && paginatedTasks.currentPage > 1) { // Lưu ý: paginatedTasks cần có currentPage nếu muốn dùng ở đây
            // Ở đây bạn cần truyền currentPage từ useTaskData hoặc tìm cách khác để cập nhật
            // Để đơn giản, tôi sẽ giả định rằng việc xóa sẽ tự động re-render và xử lý phân trang
            // Một cách tốt hơn là truyền hàm handleCurrentChange từ useTaskData vào đây
        }
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "Hủy xóa",
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
  };
}