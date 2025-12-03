import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from "element-plus";
import { uploadWorkManagementKHTCApi } from "../../services/auth.service";

export function useUploadWorkManagement() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const isUploading = ref(false);
    
    /**
     * @param {File} file - File was choosed from user
     * @param {boolean} isCommon - True if 'Chung' is selected, False if 'Cá Nhân' is selected
     */
    const uploadFile = async (file, isCommon) => {
        
        // XÁC ĐỊNH user_id DỰA TRÊN TRẠNG THÁI SWITCH
        let targetUserId;
        if (isCommon) {
            targetUserId = 'common'; // Chế độ Chung
        } else {
            targetUserId = loggedInUserId; // Chế độ Cá nhân
        }

        if (!targetUserId) {
            ElMessage.error('Không tìm thấy User ID. Vui lòng đăng nhập lại hoặc kiểm tra trạng thái.');
            return false;
        }

        isUploading.value = true;
        const payload = {
            file: file,
            // SỬ DỤNG targetUserId ĐÃ XÁC ĐỊNH
            user_id: targetUserId 
        };

        try {
            const response = await uploadWorkManagementKHTCApi(payload, new AbortController().signal);
            if (response.data.status === 'success') {
                ElMessage.success('Tải file lên thành công!');
                return true;
            } else {
                ElMessage.error(`Tải file lên thất bại: ${response.data.message || 'Lỗi không xác định'}`);
                return false;
            }
        } catch (error) {
            ElMessage.error(`Đã xảy ra lỗi khi tải file lên: ${error.message}`);
            return false;
        } finally {
            isUploading.value = false;
        }
    };

    return {
        isUploading,
        uploadFile,
    }
}