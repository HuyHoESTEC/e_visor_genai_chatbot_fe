import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { downloadInstallationFile } from "../../services/auth.service";

export function useWarehouseExportDownload() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    // 1. Define download status
    const downloadDialogVisible = ref(false);
    const downloadFileName = ref('');
    const downloadFileUrl = ref('');
    const isDownloadPreparing = ref(false);

    const openDownloadDialog = () => {
        downloadDialogVisible.value = true;
        // Reset state before open dialog
        downloadFileName.value = '';
        downloadFileUrl.value = '';
    };
    // 2. Function resolve while click button print/download file
    const downloadFile = async (filterPayload) => {
        isDownloadPreparing.value = true; // Start loading
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            "owner": loggedInUserId,
            "project_code": filterPayload.project_code || null,
            "cabinet_no": filterPayload.cabinet_no || null,
        };

        downloadFileName.value = '';
        downloadFileUrl.value = '';
        downloadDialogVisible.value = true;
        try {
            const response = await downloadInstallationFile(payload);
            if (response && response.data.status === 'success' && response.data.url) {
                downloadFileUrl.value = response.data.url;
                const projectCode = filterPayload.project_code;
                const cabinetNo = filterPayload.cabinet_no;

                if (projectCode) {
                    downloadFileName.value = `Export_${projectCode}`;
                } else if (cabinetNo) {
                    downloadFileName.value = `Export_${cabinetNo}`;
                } else {
                    downloadFileName.value = `PhieuLapDat_${new Date().toISOString().slice(0,10)}`;
                }

                if (!downloadFileUrl.value.startsWith('http')) {
                    throw new Error("URL tải file không hợp lệ");
                }
            } else {
                throw new Error("Không nhận dạng được đường dẫn file hợp lệ từ server.");
            }
            isDownloadPreparing.value = false; // Turn off loading while success
        } catch (err) {
            console.error("Download preparation error:", err);
            isDownloadPreparing.value = false; // Turn off loading while error
            downloadFileUrl.value = ''; // Make sure that link should be reset
            ElMessage({
                type: 'error',
                message: `Lỗi: ${err.message || 'Không thể tạo file in. Vui lòng thử lại.'}`,
            });
        }
    };
    // 3. Function to download actual file (after clicking in popup)
    const confirmDownloadFile = () => {
        if (downloadFileUrl.value) {
            const a = document.createElement('a');
            a.href = downloadFileUrl.value;
            a.download = downloadFileName.value || 'PhieuLapDat.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            downloadDialogVisible.value = false;
            downloadFileName.value = '';
            downloadFileUrl.value = '';

            ElMessage({
                type: 'success',
                message: 'Đang tải file...',
            });
        } else {
            ElMessage({
                type: 'warning',
                message: 'Không có đường dẫn file để tải.',
            });
        }
    };

    return {
        downloadDialogVisible,
        downloadFileName,
        downloadFile,
        confirmDownloadFile,
        openDownloadDialog,
        downloadFileUrl,
        isDownloadPreparing,
    };
}