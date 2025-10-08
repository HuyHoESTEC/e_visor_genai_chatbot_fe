import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from "element-plus";
import { uploadDataWarehouseApi } from "../../services/auth.service";

export function useUploadWarehouseItem() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const isUploading = ref(false);
    /**
     * @param {File} file
     */
    const uploadFile = async (file) => {
        if (!loggedInUserId) {
            ElMessage.error('Không tìm thấy User ID. Vui lòng đăng nhập lại.');
            return false;
        }
        isUploading.value = true;
        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            file: file
        };

        try {
            const response = await uploadDataWarehouseApi(payload, new AbortController().signal);
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
    }

    return {
        isUploading,
        uploadFile,
    }
}