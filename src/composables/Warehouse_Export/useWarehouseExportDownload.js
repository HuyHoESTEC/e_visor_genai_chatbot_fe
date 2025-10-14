import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { exportToFileForExportApi } from "../../services/auth.service";

export function useWarehouseExportDownload(selectedExportId, selectedProjectCode) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    // 1. Define download status
    const downloadDialogVisible = ref(false);
    const downloadFileName = ref('');
    const downloadFileUrl = ref('');
    // 2. Function resolve while click button print/download file
    const downloadFile = async () => {
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            "owner": loggedInUserId,
            "option": "export",
            "ticket_id": selectedExportId.value || null,
            "project_code": selectedProjectCode.value || null,
        };

        downloadFileName.value = '';
        downloadFileUrl.value = '';
        downloadDialogVisible.value = true;

        try {
            const response = await exportToFileForExportApi(payload);
            if (response && response.data.status === 'success' && response.data.url) {
                downloadFileUrl.value = response.data.url;
                if (selectedExportId.value) {
                    downloadFileName.value = `Export_${selectedExportId.value}`;
                } else if (selectedProjectCode.value) {
                    downloadFileName.value = `Export_${selectedProjectCode.value}`;
                }
                if (!downloadFileUrl.value.startsWith('http')) {
                    throw new Error("URL tải file không hợp lệ");
                }
            } else {
                throw new Error("Không nhận dạng được đường dẫn file hợp lệ từ server.");
            }
        } catch (err) {
            console.error("Download preparation error:", err);
            downloadDialogVisible.value = false;
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
            a.download = downloadFileName.value || 'PhieuXuatKho.csv';
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
        confirmDownloadFile
    };
}