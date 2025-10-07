import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { loadingExportDataWarehouse } from "../../services/auth.service";

export function useLoadWarehouseExport() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    
    const fetchImportDataTable = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            option: "export"
        };
        try {
            const response = await loadingExportDataWarehouse(payload);
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
        fetchImportDataTable();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchImportDataTable,
    }
}