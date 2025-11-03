import { ref } from "vue"
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
        console.log("itemData:", itemData);
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
        console.log("payload:",payload );

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

    return {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
        loggedInUserId,
        originalItemData,
        deleteItemApi
    }
}