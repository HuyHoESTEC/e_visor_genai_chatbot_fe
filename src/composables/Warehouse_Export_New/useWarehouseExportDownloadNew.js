import { ElMessage } from "element-plus";
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { exportToFileForExportApi } from "../../services/auth.service";

export function useWarehouseExportDownloadNew() {
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
                "option": "export",
                "ticket_id": filterPayload.ticket_id || null,
                "project_code": filterPayload.project_code || null,
            };
    
            downloadFileName.value = '';
            downloadFileUrl.value = '';
            downloadDialogVisible.value = true;
            try {
                const response = await exportToFileForExportApi(payload);
                if (response && response.data.status === 'success' && response.data.url) {
                    downloadFileUrl.value = response.data.url;
                    const projectCode = filterPayload.project_code;
                    const ticket_id = filterPayload.ticket_id;
    
                    if (projectCode && ticket_id) {
                        downloadFileName.value = `PhieuXuatKho_${projectCode}-${ticket_id}`;
                    } else if (projectCode) {
                        downloadFileName.value = `PhieuXuatKho_${projectCode}`;
                    } else {
                        downloadFileName.value = `PhieuXuatKho_${new Date().toISOString().slice(0,10)}`;
                    }
    
                    if (!downloadFileUrl.value.startsWith('http')) {
                        throw new Error("URL tải file không hợp lệ");
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
        confirmDownloadFile,
        openDownloadDialog,
        downloadFileUrl,
        isDownloadPreparing,
    };
}