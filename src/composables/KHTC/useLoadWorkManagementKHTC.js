import { onMounted, ref, watch } from "vue";
import { loadWorkManagementKHTCApi } from "../../services/auth.service";
import { useAuthStore } from "../../stores/auth";

export function useLoadWorkManagementKHTC( viewModeSwitch ) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const loggedInUserRole = authStore.user?.role;

    const tableData = ref([]); // Table data, use ref to reactive
    const isLoading = ref(true); // Data loading status
    const error = ref(null); // Store data if needed
    
    // Function to get the first day of current year
    const getFirstDayOfYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        
        return new Date(year, 0, 1); // Tháng 0 là tháng Giêng
    };

    // Function to get the last day of current year
    const getLastDayOfYear = () => {
        const now = new Date();
        const year = now.getFullYear();

        return new Date(year, 11, 31); // Tháng 11 là tháng Mười Hai
    }

    const fetchTableData = async () => {
        isLoading.value = true;
        error.value = null;
        // Calculator the first day and the last day of year
        const startDate = getFirstDayOfYear();
        const endDate = getLastDayOfYear();

        let ownerValue;
        if (viewModeSwitch.value === true) {
            ownerValue = 'common'
        } else {
            ownerValue = loggedInUserId;
        }

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: ownerValue,
            filter: {
                full_name: [],
                project_code: [],
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                version: null,
            },
            pagination: 1,
            page_size: 999
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

    // watch(viewModeSwitch, () => {
    //     fetchTableData();
    // })

    return {
        tableData,
        isLoading,
        error,
        fetchTableData,
        getFirstDayOfYear,
        getLastDayOfYear,
        viewModeSwitch,
        loggedInUserRole,
    }
}