import { computed, ref } from "vue"
import { useAuthStore } from "../../stores/auth";
import { ElMessage, ElMessageBox } from 'element-plus';
import { createImportDataWarehouseApi, deleteImportDataWarehouseApi, exportToFileForImportApi, updateImportDataWarehouseApi } from "../../services/auth.service";

export function useWarehouseImportAction(langStore, fetchDataAndInitialize) {
    const dialogVisible = ref(false);
    const currentItem = ref(null);
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;
    const originalItemData = ref(null);

    const newItem = ref(null);
    const newItemDialogVisible = ref(false);
    const isEditing = ref(false);


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
            'option': "import",
            'dml_action': "update",
            form: {
                "id": itemData.id || '',
                "ticket_id": itemData.import_id || '',
                "time": itemData.time || '',
                "ticket_time": itemData.import_time || '',
                "project_code": itemData.project_code || '',
                "product_name": itemData.product_name || '',
                "part_no": itemData.part_no || '',
                "origin": itemData.origin || '',
                "quantity": itemData.quantity || '',
                "seri_number": itemData.seri_number || ''
            }
        };

        try {
            await updateImportDataWarehouseApi(payload);
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
            'option': "import",
            'dml_action': "delete",
            form: {
                "id": itemData.id || '',
                "ticket_id": itemData.ticket_id || '',
                "time": itemData.time || '',
                "ticket_time": itemData.import_time || '',
                "project_code": itemData.project_code || '',
                "product_name": itemData.product_name || '',
                "part_no": itemData.part_no || '',
                "origin": itemData.origin || '',
                "quantity": itemData.quantity || '',
                "seri_number": itemData.seri_number || ''
            }
        };
        await deleteImportDataWarehouseApi(deletePayload);
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

    const getInitialItemData = () => ({
        id: '',
        ticket_id: '',
        time: '',
        quantity: 1,
        ticket_time: '',
        part_no: '',
        seri_number: '',
        origin: '',
        project_code: '',
        product_name: '',
    });
    
    const addNewItem = () => {
        newItem.value = getInitialItemData(); 
        originalItemData.value = null; 
        isEditing.value = false;
        newItemDialogVisible.value = true;
    };
    
    const createItem = async (itemData) => {
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            'owner': loggedInUserId,
            'option': 'import',
            'dml_action': 'insert',
            form: {
                "ticket_id": itemData.ticket_id || null,
                "time": itemData.time || null,
                "quantity": itemData.quantity || 1,
                "ticket_time": itemData.import_time || null,
                "part_no": itemData.part_no || null,
                "seri_number": itemData.seri_number || null,   
                "origin": itemData.origin || null, 
                "project_code": itemData.project_code || null,
                "product_name": itemData.product_name || null,
            },          
        };
        console.log("payload:", payload);
        try {
            await createImportDataWarehouseApi(payload);
            const successMessage = langStore.t('InsertInfoSuccess') || 'Thêm mới sản phẩm thành công!';
            ElMessage.success(successMessage);
            if (fetchDataAndInitialize) {
                fetchDataAndInitialize();
            }
        } catch (err) {
            const errorMessage = (langStore.t('ErrorOccurredWhenInserted') || 'Đã xảy ra lỗi khi thêm mới') + `: ${err.message}`;
            ElMessage.error(errorMessage)
        } finally {
            newItemDialogVisible.value = false;
            newItem.value = null;
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
        itemSelectionChange,
        selectionEmpty,
        deleteAllSelectedItems,
        isDeleting,
        newItemDialogVisible,
        isEditing,
        getInitialItemData,
        addNewItem,
        createItem,
    }
}