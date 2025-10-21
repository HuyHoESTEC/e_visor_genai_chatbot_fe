import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { getWarehouseManagementApi } from "../../services/auth.service";


export function useLoadWarehouseItem() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    // Table data, use ref to reactive
    const tableData = ref([]);
    const isLoading = ref(true); // Data loading status
    const error = ref(null);
    const itemInfo = ref({});

    // Get dashboard data
    const fetchTableData = async () => {
        isLoading.value = true;
        error.value = null;
        
        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            filter: {
                part_no: null,
                origin: null,
                seri_number: null,
            },
            pagination: 1,
            page_size: 1000
        };
        try {
            const response = await getWarehouseManagementApi(payload);
            if (Array.isArray(response.data)) {
                tableData.value = response.data;
            } else {
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

    onMounted(() => {
        fetchTableData();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchTableData,
    }
}