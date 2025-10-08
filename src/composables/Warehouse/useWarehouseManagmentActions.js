import { ref } from "vue"
import { useAuthStore } from "../../stores/auth";
import { ElMessage } from 'element-plus';
import { updateDataWarehouseApi } from "../../services/auth.service";

export function useWarehouseManagementActions(langStore, fetchDataAndInitialize) {
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
            'dml_action': "update",
            form: {
                "id": itemData.id || '',
                "product_name": itemData.product_name || '',
                "description": itemData.description || '',
                "time": itemData.time || '',
                "part_no": itemData.part_no || '',
                "origin": itemData.origin || '',
                "unit": itemData.unit || '',
                "quantity": itemData.quantity || '',
                "seri_number": itemData.seri_number || '',
                "location": itemData.location || '',
                "entered_by": itemData.entered_by || '',
                "status": itemData.status || '0',
            }
        };

        try {
            await updateDataWarehouseApi(payload);
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