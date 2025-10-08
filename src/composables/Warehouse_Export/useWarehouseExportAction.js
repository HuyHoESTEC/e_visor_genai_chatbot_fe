import { ref } from "vue"
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from 'element-plus';
import { updateExportDataWarehouseApi } from "../../services/auth.service";

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
            'option': "export",
            'dml_action': "update",
            form: {
                "id": itemData.id || '',
                "export_id": itemData.export_id || '',
                "time": itemData.time || '',
                "export_time": itemData.export_time || '',
                "project_code": itemData.project_code || '',
                "product_name": itemData.product_name || '',
                "part_no": itemData.part_no || '',
                "origin": itemData.origin || '',
                "quantity": itemData.quantity || '',
                "seri_number": itemData.seri_number || ''
            }
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

    return {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
        loggedInUserId,
        originalItemData,
    }
}