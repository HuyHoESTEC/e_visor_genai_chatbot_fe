import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from "element-plus";
import { constructorDesignUploadFileApi } from "../../services/auth.service";

export function useUploadConstructionDesign() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const isUploading = ref(false);

    /**
     * @param {File}
     * @returns {Promise<string|false>}
     */
    const uploadFile = async (file) => {
        if (!loggedInUserId) {
            ElMessage.error('Không tìm thấy thông tin người dùng hiện tại. Vui lòng đăng nhập lại.');
            return false;
        }
        isUploading.value = true;
        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            file: file
        };

        try {
            const response = await constructorDesignUploadFileApi(payload, new AbortController().signal);
            if (response.data.status === 'success' && response.data.url) {
                ElMessage.success('Tải file thiết kế thi công lên thành công!');
                return response.data.url;
            } else {
                ElMessage.error(`Tải file lên thất bại: ${response.data.message || 'Server không trả về URL hoặc lỗi không xác định'}`);
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
    };
};