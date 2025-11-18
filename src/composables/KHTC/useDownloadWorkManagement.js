import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { downloadWorkManagementFile } from "../../services/auth.service";

export function useDownloadWorkManagement() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const downloadDialogVisible = ref(false);
    const downloadFileName = ref('');
    const downloadFileUrl = ref('');
    const isDownloadPreparing = ref(false);

    const openDownloadDialog = () => {
        downloadDialogVisible.value = true;
        downloadFileName.value = '';
        downloadFileUrl.value = '';
    };

    const downloadFile = async (filterPayload) => {
        isDownloadPreparing.value = true; 
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            "owner": loggedInUserId,
            "version": filterPayload.version || null,
        };

        downloadFileName.value = '';
        downloadFileUrl.value = '';
        downloadDialogVisible.value = true;
        try {
            const response = await downloadWorkManagementFile(payload);
            
            if (response && response.data.status === 'success') {
                downloadFileUrl.value = response.data.data;
                const versionVal = filterPayload.version;

                if (versionVal) {
                    downloadFileName.value = `PhieuLapDat_${filterPayload.version}`;
                }

            } else {
                throw new Error("Không nhận dạng được đường dẫn file hợp lệ từ server.");
            }
            isDownloadPreparing.value = false;
        } catch (err) {
            console.error("Download preparation error:", err);
            isDownloadPreparing.value = false; 
            downloadFileUrl.value = ''; 
            ElMessage({
                type: 'error',
                message: `Lỗi: ${err.message || 'Không thể tạo file in. Vui lòng thử lại.'}`,
            });
        }
    };

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