import { onMounted, ref } from "vue";
import { loadWorkManagementKHTCApi } from "../../services/auth.service";
import { useAuthStore } from "../../stores/auth";

export function useLoadWorkManagementKHTC() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]); // Table data, use ref to reactive
    const isLoading = ref(true); // Data loading status
    const error = ref(null); // Store data if needed 

    const fetchTableData = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            filter: {
                full_name: [],
                project_code: [],
                start_date: "2025-01-01T09:48:50.222Z",
                end_date: "2025-03-17T09:48:50.222Z"
            },
            pagination: 1,
            page_size: 20
        }
        try {
            const response = await loadWorkManagementKHTCApi(payload);
            if (Array.isArray(response.data)) {
                tableData.value = response.data;
            } else {
                // Nếu không phải mảng, gán mảng rỗng để tránh lỗi iterable
                console.warn('API did not return an array for tableData:', response.data);
                tableData.value = [];
            }
        } catch (e) {
            error.value = 'Lỗi khi tải dữ liệu:' + e.message;
            console.error("Lỗi khi tải dữ liệu:", e);
        } finally {
            isLoading.value = false;
        }
    };
    // Auto call fetchTableData when composable was mounted
    onMounted(() => {
        fetchTableData();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchTableData
    }
}