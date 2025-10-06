import { ref, computed, onMounted, watch } from 'vue'; // Thêm watch
import { useLoadWorkManagementKHTC } from './useLoadWorkManagementKHTC';
import { filterWorkManagementKHTCByDateApi } from '../../services/auth.service';

export function useTaskData() {
  const { tableData: allTasksFromComposable, isLoading, error, fetchTableData } = useLoadWorkManagementKHTC();

  // Khai báo một ref mới để chứa dữ liệu đã được fetch, dễ dàng thao tác hơn
  const allTasks = ref([]); 
  // Biến này sẽ chứa dữ liệu đã lọc, cần là một ref để có thể gán lại giá trị
  const filteredTasks = ref([]);

  // --- State cho bộ lọc ---
  const searchQuery = ref("");
  const selectedUser = ref(null);
  const selectedProjectCode = ref(null);
  const selectedStatus = ref(null);

  // --- State cho phân trang ---
  const currentPage = ref(1);
  const pageSize = ref(10);

  const startAndEndDateVal = ref(null);
  const loadTasksWithFilters = async (filterPayload = null) => {
    if (!filterPayload) {
      selectedUser.value = null;
      selectedProjectCode.value = null;
      startAndEndDateVal.value = null;

      await fetchDataAndInitialize();
      return;
    }

    isLoading.value = true;
    try {
      const result = await filterWorkManagementKHTCByDateApi(filterPayload);
      if (result && result.data && Array.isArray(result.data)) {
        allTasks.value = result.data;
        applyFilters();
      } else {
        allTasks.value = [];
        filteredTasks.value = [];
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      allTasks.value = [];
      filteredTasks.value = [];
    } finally {
      isLoading.value = false;
      currentPage.value = 1;
    }
  }

  // --- Dữ liệu tĩnh hoặc được tải động cho các bộ lọc ---
  /**
   * 0 => Pending / Plan status
   * 1 => Todo status
   * 2 => In Progress status
   * 3 => Complete / Done status
   * 4 => Cancel status
   */
  const taskStatuses = [
    { value: 0, label: 'Chờ xử lý' },
    { value: 1, label: 'Lên kế hoạch' },
    { value: 2, label: 'Đang tiến hành' },
    { value: 3, label: 'Hoàn thành' },
    { value: 4, label: 'Đã hủy' },
  ];

  /**
   * S => Inside
   * V => Outside
   */
  const taskSites = [
    { value: 'S', label: 'Văn phòng / Nhà máy' },
    { value: 'V', label: 'Ngoài văn phòng / nhà máy' }
  ];

  // Dummy users cho dialog, sẽ được cập nhật từ dữ liệu thực tế
  const dummyTasks = ref([]);

  // emptyData sẽ là một computed property để phản ánh trạng thái không có dữ liệu
  const emptyData = computed(() => {
    // Kiểm tra xem có đang tải dữ liệu không, có lỗi không, và sau đó kiểm tra mảng
    // Nếu đang tải hoặc có lỗi, chưa thể kết luận là "emptyData" cuối cùng
    if (isLoading.value || error.value) {
      return false; // Hoặc bạn có thể trả về một giá trị khác tùy theo UI/UX mong muốn
    }
    // Nếu không có lỗi và không đang tải, kiểm tra xem filteredTasks có rỗng không
    return filteredTasks.value.length === 0;
  });

  // --- Computed properties cho các bộ lọc dropdown ---
  const uniqueUsers = computed(() => {
    if (!allTasks.value || allTasks.value.length === 0) {
      return [];
    }
    const users = new Map();
    allTasks.value.forEach((task) => {
      // Giả sử task.user_id là duy nhất và task.full_name là tên hiển thị
      // Nếu user_id không tồn tại, có thể dùng full_name làm id thay thế
      const userId = task.user_id || task.full_name; 
      if (userId && !users.has(userId)) {
        users.set(userId, { id: userId, name: task.full_name });
      }
    });
    return Array.from(users.values());
  });

  const uniqueProjectCode = computed(() => {
    if (!allTasks.value || allTasks.value.length === 0) {
      return [];
    }
    const projCode = new Map();
    allTasks.value.forEach((task) => {
      const projId = task.project_code;
      if (projId && !projCode.has(projId)) {
        projCode.set(projId, { id: projId, name: task.project_code });
      }
    });
    return Array.from(projCode.values());
  });

  // --- Methods liên quan đến dữ liệu và lọc ---

  // Hàm áp dụng bộ lọc và cập nhật filteredTasks
  const applyFilters = () => {
    if (!Array.isArray(allTasks.value)) {
      console.error("AllTasks.value is not an array before applying filters.");
      filteredTasks.value = [];
      currentPage.value = 1;
      return;
    }

    let tempTasks = [...allTasks.value]; // Bắt đầu với tất cả dữ liệu gốc đã tải

    if (selectedUser.value) {
      // Lọc theo user_id nếu có, hoặc full_name nếu user_id không có
      tempTasks = tempTasks.filter(task => (task.user_id === selectedUser.value || task.full_name === selectedUser.value));
    }

    if (selectedProjectCode.value) {
        tempTasks = tempTasks.filter(task => task.project_code === selectedProjectCode.value);
    }

    if (selectedStatus.value) {
      tempTasks = tempTasks.filter(task => task.status === selectedStatus.value);
    }

    filteredTasks.value = tempTasks; // Cập nhật ref filteredTasks
    currentPage.value = 1; // Reset về trang 1 khi lọc
  };

  // paginatedTasks sẽ tính toán dựa trên filteredTasks
  const paginatedTasks = computed(() => {
    if (!Array.isArray(filteredTasks.value)) {
      console.warn('filteredTasks.value is not an array, returning empty array for pagination.');
      return []; 
    }
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredTasks.value.slice(start, end);
  });

  // Hàm để tải dữ liệu và khởi tạo các giá trị
  const fetchDataAndInitialize = async () => {
    await fetchTableData(); // Gọi hàm fetchTableData từ useLoadWorkManagementKHTC
    // Khi dữ liệu từ useLoadWorkManagementKHTC được cập nhật, watch sẽ kích hoạt
  };

  // Sử dụng watch để theo dõi allTasksFromComposable và cập nhật allTasks cục bộ
  // Điều này đảm bảo rằng khi useLoadWorkManagementKHTC tải xong dữ liệu,
  // composable này sẽ phản ứng và cập nhật filteredTasks.
  watch(allTasksFromComposable, (newValue) => {
    if (newValue) {
      allTasks.value = newValue; // Gán dữ liệu từ composable bên ngoài
      applyFilters(); // Áp dụng bộ lọc ban đầu với dữ liệu mới
      
      // Cập nhật dummyTasks (nếu cần cho dialog)
      const users = new Map();
      allTasks.value.forEach(task => {
        const userId = task.user_id || task.full_name; // Sử dụng user_id nếu có, không thì full_name
        if (userId && !users.has(userId)) {
          users.set(userId, { id: userId, name: task.full_name });
        }
      });
      dummyTasks.value = Array.from(users.values());
    } else {
      allTasks.value = [];
      filteredTasks.value = [];
      dummyTasks.value = [];
    }
  }, { immediate: true }); // `immediate: true` để chạy watcher ngay lập tức khi component được mount

  // Lifecycle hook
  onMounted(() => {
    fetchDataAndInitialize();
  });

  return {
    allTasks, // Trả về allTasks cục bộ
    isLoading,
    error,
    fetchDataAndInitialize,
    searchQuery,
    selectedUser,
    selectedProjectCode,
    selectedStatus,
    currentPage,
    pageSize,
    taskStatuses,
    dummyTasks,
    uniqueUsers,
    uniqueProjectCode,
    filteredTasks, // filteredTasks giờ là một ref
    paginatedTasks,
    applyFilters,
    emptyData, // emptyData giờ là một computed property
    taskSites,
    loadTasksWithFilters,
    startAndEndDateVal,
  };
}