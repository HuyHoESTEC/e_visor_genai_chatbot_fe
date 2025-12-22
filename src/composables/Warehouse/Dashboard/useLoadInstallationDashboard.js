import { onMounted, ref } from "vue";
import { useAuthStore } from "../../../stores/auth";
import { loadingWarehouseInstallationApi } from "../../../services/auth.service";

export function useLoadInstallationDashboard() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const tableData = ref([]);
    const installedData = ref([]);
    const notInstalledData = ref([]);
    const isLoading = ref(false);
    const errorVal = ref(null);

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
            if (response.data.status === 'success') {
                const rawData = Array.isArray(response.data.data) ? response.data.data : [];
                const rawNotInstalled = Array.isArray(response.data.notinstalled_data) ? response.data.notinstalled_data : [];

                const processedData = rawData.map(item => ({
                    ...item,
                    status: (item.status === 1) ? 1 : 0
                }));

                const processedNotInstalled = rawNotInstalled.map(item => ({
                    ...item,
                    status: 0
                }));

                installedData.value = processedData.filter(item => item.status === 1);
                notInstalledData.value = [
                    ...processedData.filter(item => item.status === 0),
                    ...processedNotInstalled
                ];

                tableData.value = [...processedData, ...processedNotInstalled];
            } else {
                tableData.value = [];
                installedData.value = [];
                notInstalledData.value = [];
            }
        } catch (e) {
            errorVal.value = 'Lỗi khi tải dữ liệu:' + e.message;
            console.error("Lỗi khi tải dữ liệu:", e);
            tableData.value = [];
            installedData.value = [];
            notInstalledData.value = [];
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
        installedData,
        notInstalledData,
    }
}