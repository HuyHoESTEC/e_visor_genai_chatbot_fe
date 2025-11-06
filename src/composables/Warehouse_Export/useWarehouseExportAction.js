import { computed, ref } from "vue"
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from 'element-plus';
import { deleteExportDataWarehouseApi, updateExportDataWarehouseApi } from "../../services/auth.service";

export function useWarehouseExportAction(langStore, fetchDataAndInitialize) {
    const dialogVisible = ref(false);
    const currentItem = ref(null);
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const originalItemData = ref(null);

    const editItem = (item) => {
        currentItem.value = JSON.parse(JSON.stringify(item));
        originalItemData.value = JSON.parse(JSON.stringify(item));
        dialogVisible.value = true;
    };

    const saveItem = async (itemData) => {
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            'owner': loggedInUserId,
            'dml_action': 'update',
            form: {
                "id": itemData.id || '',
                "location": itemData.location || '',
                "dt": itemData.dt || '',
                "quantity": itemData.quantity || '',
                "description": itemData.description || '',
                "part_no": itemData.part_no || '',
                "seri_number": itemData.seri_number || '',
                "manufacturer": itemData.manufacturer || '',
                "project_code": itemData.project_code || '',
                "cabinet_no": itemData.cabinet_no || '',
                "status": itemData.status || 0,
                "higher_lever_function": itemData.higher_lever_function || '',
            },
        };  

        try {
            await updateExportDataWarehouseApi(payload);
            const successMessage = langStore.t('UpdateInfoSuccess');
            ElMessage.success(successMessage);
            if (fetchDataAndInitialize) {
                fetchDataAndInitialize();
            }
        } catch (err) {
            const errorMessage = langStore.t('ErrorOccurredWhenUpdated') + ` ${err.message}`;
            ElMessage.error(errorMessage)
        } finally {
            dialogVisible.value = false;
        }
    };

    const closeDialog = () => {
        currentItem.value = null;
        dialogVisible.value = false;
    };


    const deleteItemApi = async (itemData) => {
        const deletePayload = {
            "request_id": `evisor-${Date.now()}`,
            'owner': loggedInUserId,
            'dml_action': 'delete',
            form: {
                "id": itemData.id || '',
                "location": itemData.location || '',
                "dt": itemData.dt || '',
                "quantity": itemData.quantity || '',
                "description": itemData.description || '',
                "part_no": itemData.part_no || '',
                "seri_number": itemData.seri_number || '',
                "manufacturer": itemData.manufacturer || '',
                "project_code": itemData.project_code || '',
                "cabinet_no": itemData.cabinet_no || '',
                "status": itemData.status || 0,
                "higher_lever_function": itemData.higher_lever_function || '',
            },
        };
        await deleteExportDataWarehouseApi(deletePayload);
    };

    const selectedItems = ref([]);
    const isDeleting = ref(false);
    const advanceDeleteVisible = ref(true);

    const deleteButtonLabel = computed(() =>{
        const count = selectedItems.value.length;
        if (count === 0) {
            return "Xóa dữ liệu";
        }
        return `Xóa dữ liệu (${count})`;
    });

    const handleDeleteAction = async () => {
        if (selectedItems.value.length === 0) {
            ElMessage.warning("Vui lòng chọn ít nhất một mục để xóa."); 
            return;
        }

        const count = selectedItems.value.length;

        try {
            await ElMessageBox.confirm(
                `Bạn có chắc chắn muốn xóa ${count} mục đã chọn? Hành động này không thể hoàn tác.`,
                "Cảnh báo",
                {
                    confirmButtonText: "Đồng ý Xóa",
                    cancelButtonText: "Hủy bỏ",
                    type: 'warning',
                }
            );

            isDeleting.value = true;
            
            // Xóa từng mục
            const deletePromises = selectedItems.value.map(item => deleteItemApi(item));
            await Promise.all(deletePromises); 
            
            ElMessage.success(`Đã xóa thành công ${count} mục.`);

            // Xóa danh sách đã chọn và tải lại dữ liệu
            selectedItems.value = [];
            if (fetchDataAndInitialize) {
                fetchDataAndInitialize();
            }
        } catch (error) {
             // Bắt lỗi khi người dùng hủy hoặc lỗi API
            if (error !== 'cancel') {
                ElMessage.error(`Đã xảy ra lỗi trong quá trình xóa dữ liệu: ${error.message || 'Lỗi không xác định'}`);
            }
        } finally {
            isDeleting.value = false;
        }
    };

    return {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
        loggedInUserId,
        originalItemData,
        deleteItemApi,
        selectedItems,
        isDeleting,
        deleteButtonLabel,
        handleDeleteAction,
        advanceDeleteVisible,
    }
}