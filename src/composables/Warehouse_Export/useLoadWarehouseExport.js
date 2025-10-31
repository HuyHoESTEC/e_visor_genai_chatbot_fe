import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { loadingWarehouseInstallationApi } from "../../services/auth.service";

export function useLoadWarehouseExport() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    
    const fetchExportDataTable = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            filter: {
                cabinet_no: null,
                project_code: null,
                seri_number: null,
                part_no: null,
                installed: null,
            }
        };
        try {
            const response = await loadingWarehouseInstallationApi(payload);
            const dataVal = response.data.data;
            
            if (response.data.status === "success" && Array.isArray(dataVal)) {
                tableData.value = dataVal;
            } else {
                console.warn('API did not return an array for tableData:', dataVal);
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
        fetchExportDataTable();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchExportDataTable,
    }
}