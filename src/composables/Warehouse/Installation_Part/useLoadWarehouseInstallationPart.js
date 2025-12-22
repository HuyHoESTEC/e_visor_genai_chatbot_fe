import { onMounted, ref } from "vue";
import { useAuthStore } from "../../../stores/auth";
import { loadingWarehouseInstallationApi } from "../../../services/auth.service";

export function useLoadWarehouseInstallationPart() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]);
    const isLoading = ref(false);
    const errorVal  = ref(null);

    const fetchTableDataInstallation = async () => {
        isLoading.value = true;
        errorVal.value = null;

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
            const installationList = response.data.data;
            if (response.data.status === "success" && Array.isArray(installationList)) {
                tableData.value = installationList;
            } else {
                console.warn('API did not return an array for tableData:', installationList);
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
        fetchTableDataInstallation();
    });

    return {
        tableData,
        isLoading,
        errorVal,
        fetchTableDataInstallation,
    }
}