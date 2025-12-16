import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { loadingWarehouseInstallationApi } from "../../services/auth.service";

export function useLoadWarehouseInstallation() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]);
    const installedData = ref([]); // Installed data
    const notInstalledData = ref([]); // Not installed data
    const isLoading = ref(false);
    const error = ref(null);
    
    const fetchTableDataInstallation = async () => {
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
            
            if (response.data.status === "success") {
                const rawInstalledData = Array.isArray(response.data.data)
                    ? response.data.data
                    : [];
                
                const rawNotInstalledData = Array.isArray(response.data.notinstalled_data)
                    ? response.data.notinstalled_data
                    : [];
                
                installedData.value = rawInstalledData.map(item => ({
                    ...item,
                    status: 0
                }));
                notInstalledData.value = rawNotInstalledData.map(item => ({
                    ...item,
                    status: 1
                }));
            } else {
                installedData.value = [];
                notInstalledData.value = [];
            }
        } catch (e) {
            error.value = 'Lỗi khi tải dữ liệu:' + e.message;
            console.error("Lỗi khi tải dữ liệu:", e);
            installedData.value = [];
                notInstalledData.value = [];
        } finally {
            isLoading.value = false;
        }
    };
        
    onMounted(() => {
        fetchTableDataInstallation();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchTableDataInstallation,
        installedData,
        notInstalledData,
    }
}