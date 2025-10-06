import { ElMessage, ElMessageBox } from "element-plus";
import { computed, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { actionFormWorkManagementKHTCApi, filterWorkManagementKHTCByDateApi } from "../../services/auth.service";

export function useAdvanceDelete(selectedRows, selectedUser, selectedProjectCode, langStore, fetchDataAndInitialize, startAndEndDateVal, loadTasksWithFilters) {
    const isDeleting = ref(false);
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    // 1. Calculate the current deletion mode (Type of Delete)
    const currentDeleteMode = computed(() => {
        if (selectedRows.value.length === 0) {
            return 'none'; // Don't display button
        }
        
        if (selectedUser.value) {
            return 'byUser';
        } else if (selectedProjectCode.value) {
            return 'byProject';
        } else if (startAndEndDateVal.value && startAndEndDateVal.value.length === 2) {
            return 'all_selected';
        }

        return 'all_selected'; // Default: Delete record was choosed
    });

    // 2. Display name for delete action
    const deleteButtonLabel = computed(() => {
        const count = selectedRows.value.length;
        switch (currentDeleteMode.value) {
            case 'byUser':
                return `${langStore.t('DeleteByAssignee')} (${selectedUser.value})`;
            case 'byProject':
                return `${langStore.t('DeleteByProjectCode')} (${selectedProjectCode.value})`;
            case 'all_selected':
                return `${langStore.t('DeleteAllAct')} (${count})`;
            default:
                return langStore.t('DeleteAct');
        }
    });

    // 3. Function create payload
    const createDeletePayload = () => {
        if (currentDeleteMode.value === 'none') return null;

        let payload = {};
        const baseTemplate = {
            'request_id': `evisor-${Date.now()}`,
            'owner': loggedInUserId,
            dml_action: 'delete',
            form: {
                "id": [''],
                "owner": loggedInUserId,
                "full_name": '',
                "project_code": '',
                "description": '',
                "start_date": '',
                "end_date": '',
                "QTY": '',
                "site": '',
                "status": '',
            }
        };

        switch (currentDeleteMode.value) {
            case 'all_selected':
                // THAM SỐ PHẠM VI (SCOPE PARAMETERS) - Cho mục đích hiển thị/debug
                payload = {
                    ...baseTemplate,
                    form: {
                        "id": [selectedRows.value.map((row) => row.task_id)],
                        ...baseTemplate.form,
                    }
                }
                break;
            case 'byUser':
                // THAM SỐ PHẠM VI (SCOPE PARAMETERS)
                payload = {
                    ...baseTemplate,
                    form: {
                        ...baseTemplate.form,
                        "full_name": selectedUser.value,
                    }
                };
                break;
            case 'byProject':
                // THAM SỐ PHẠM VI (SCOPE PARAMETERS)
                payload = {
                    ...baseTemplate,
                    form: {
                        ...baseTemplate.form,
                        "project_code": selectedProjectCode.value,
                    }
                };
                break;
        }

        return payload;
    };

    // 4. Function handle main delete
    const handleDeleteAction = async () => {
        const mode = currentDeleteMode.value;

        if (mode === 'none' || selectedRows.value.length === 0) {
            ElMessage.warning(langStore.t('PleaseSelectAtLeastOneRecord'));
            return;
        }

        const confirmMsg = `${deleteButtonLabel.value}`;
        
        try {
            await ElMessageBox.confirm(
                confirmMsg,
                langStore.t('Warning'),
                {
                    confirmButtonText: langStore.t('DeleteAct'),
                    cancelButtonText: langStore.t('DestroyAct'),
                    type: 'warning',
                }
            );
            isDeleting.value = true;
            let successfulDeletions = 0;
            // Start delete progress loop throught record
            for (const task of selectedRows.value) {
                const basePayload = createDeletePayload();
                const finalPayload = {
                    ...basePayload,
                    form: {
                        ...basePayload.form,
                        "id": [task.task_id || task.id],
                        "full_name": task.full_name || basePayload.form.full_name,
                        "project_code": task.project_code || basePayload.form.project_code,
                        "start_date": task.start_date || '',
                        "end_date": task.end_date || '',
                        "QTY": task.QTY,
                        "site": task.site,
                        "status":task.status,
                    }
                };
                const result = await actionFormWorkManagementKHTCApi(finalPayload);
                
                if (result.data && result.data.status === 'success') {
                    successfulDeletions++;
                } else {
                    console.error(`Failed to delete task ID: ${task.task_id || task.id}`);
                }
            }

            if (successfulDeletions > 0) {
                ElMessage.success(`${langStore.t('delete_success')}: ${successfulDeletions} ${langStore.t('records')}`);
                selectedRows.value = [];
                if (mode === 'byUser' || mode === 'byProject') {
                    // Đảm bảo các ref này được reset để mode không quay lại 'all_selected'
                    selectedUser.value = null; 
                    selectedProjectCode.value = null;
                }
                fetchDataAndInitialize();
            } else {
                ElMessage.error(langStore.t('delete_failed'));
            }
        } catch (err) {
            if (err !== 'cancel') {
                console.error('Delete error:', err);
                ElMessage.error(langStore.t('server_error'));
            }
        } finally {
            isDeleting.value = false;
        }
    };
    // 5. Function handle Date Filter
    const filterByDateAction = async () => {
        if (startAndEndDateVal.value && startAndEndDateVal.value.length === 2) {
            const [startDate, endDate] = startAndEndDateVal.value;
            const filterPayload = {
                'request_id': `evisor-${Date.now()}`,
                'owner': loggedInUserId,
                filter: {
                    'full_name': selectedUser.value ? [selectedUser.value] : [],
                    'project_code': selectedProjectCode.value ? [selectedProjectCode.value] : [],
                    'start_date': startDate,
                    'end_date': endDate,
                },
                pagination: 1,
                page_size: 999 
            };
            loadTasksWithFilters(filterPayload);
            ElMessage.success(langStore.t('FilterApplied'));
        } else if (startAndEndDateVal.value === null || startAndEndDateVal.value === '') {
            loadTasksWithFilters(null);
            ElMessage.info(langStore.t('DateFilterRemoved'));
        } else {
            ElMessage.warning(langStore.t('PleaseSelectAValidDateRange.'));
        }
    }

    return {
        isDeleting,
        handleDeleteAction,
        currentDeleteMode,
        deleteButtonLabel,
        filterByDateAction,
    }
}