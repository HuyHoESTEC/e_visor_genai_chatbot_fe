import { computed, ref } from "vue"
import { useAuthStore } from "../../stores/auth";
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteExportDataWarehouseApi, updateExportDataWarehouseApi } from "../../services/auth.service";

export function useWarehouseExportAction(langStore, fetchDataAndInitialize) {
    const dialogVisible = ref(false);
    const currentItem = ref(null);
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const originalItemData = ref(null);

    const isDeleting = ref(false);
    const selectedItems = ref([]);
    const itemSelectionChange = (selection) => {
        selectedItems.value = selection;
    }
    const selectionEmpty = computed(() => selectedItems.value.length === 0);

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

    const deleteAllSelectedItems = async () => {
        if (selectedItems.value.length === 0) {
            ElMessage.warning('Vui lòng chọn ít nhất một mục để xóa.'); 
            return;
        }

        try {
            await ElMessageBox.confirm(
                `Bạn có chắc chắn muốn xóa ${selectedItems.value.length} mục đã chọn không? Hành động này không thể hoàn tác.`, 
                'Cảnh báo',
                {
                    confirmButtonText: 'Xóa',
                    cancelButtonText: 'Hủy',
                    type: 'warning',
                }
            );

            const deletePromises = selectedItems.value.map(item => deleteItemApi(item));
            await Promise.all(deletePromises);

            ElMessage.success(`Đã xóa thành công ${selectedItems.value.length} mục.`); 

            selectedItems.value = []; 
            if (fetchDataAndInitialize) {
                fetchDataAndInitialize(); 
            }

        } catch (err) {
            if (err === 'cancel') {
                ElMessage.info('Đã hủy thao tác xóa.');
            } else {
                const errorMessage = 'Đã xảy ra lỗi trong quá trình xóa: ' + ` ${err.message}`; 
                ElMessage.error(errorMessage);
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
        selectedItems,
        itemSelectionChange,
        selectionEmpty,
        deleteAllSelectedItems,
        isDeleting
    }
}