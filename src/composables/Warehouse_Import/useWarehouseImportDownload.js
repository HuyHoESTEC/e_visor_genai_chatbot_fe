import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { exportToFileForImportApi } from "../../services/auth.service";

export function useWarehouseImportDownload(selectedImportId) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    // 1. Define download status
    const downloadDialogVisible = ref(false);
    const downloadFileName = ref('');
    const downloadFileUrl = ref('');
    // 2. Function resolve while click button print/download file
    const downloadFile = async () => {
        if (!selectedImportId.value) {
            ElMessage({
                type: 'warning',
                message: 'Vui lòng chọn Mã phiếu để tải file'
            });
            return;
        }

        const payload = {
            "request_id": `evisor-${Date.now()}`,
            "owner": loggedInUserId,
            "option": "import",
            "ticket_id": selectedImportId.value,
        };

        downloadFileName.value = '';
        downloadFileUrl.value = '';
        downloadDialogVisible.value = true;

        try {
            const response = await exportToFileForImportApi(payload);
            if (response && response.data.status === 'success' && response.data.url) {
                downloadFileUrl.value = response.data.url;
                downloadFileName.value = `Import_${selectedImportId.value}`;
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
            a.download = downloadFileName.value || 'PhieuNhapKho.csv';
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