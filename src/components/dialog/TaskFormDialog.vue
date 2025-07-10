<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEditing ? langStore.t('editTaskTitle') : langStore.t('addTaskTitle')"
    width="50%"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form :model="task" label-width="120px">
      <el-form-item :label="langStore.t('formTaskTitle')" required>
        <el-input v-model="task.title"></el-input>
      </el-form-item>
      <el-form-item :label="langStore.t('formDescription')">
        <el-input type="textarea" v-model="task.description"></el-input>
      </el-form-item>
      <el-form-item :label="langStore.t('formAssignee')" required>
        <el-select v-model="task.assignee.id" :placeholder="langStore.t('filterByUserPlaceholder')">
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="langStore.t('formDueDate')" required>
        <el-date-picker
          v-model="task.dueDate"
          type="date"
          :placeholder="langStore.t('selectDatePlaceholder')"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        ></el-date-picker>
      </el-form-item>
      <el-form-item :label="langStore.t('formStatus')">
        <el-select v-model="task.status" :placeholder="langStore.t('filterByStatusPlaceholder')">
          <el-option
            v-for="status in statuses"
            :key="status.value"
            :label="langStore.t(status.labelKey)"
            :value="status.value"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ langStore.t('cancelButton') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ langStore.t('saveButton') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useLanguageStore } from '../../stores/language';
export default {
    name: "TaskFormDialog",
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        taskToEdit: {
            type: Object,
            default: null, // Khi null tức là đang thêm mới
        },
        users: {
            type: Array,
            required: true,
        },
        statuses: {
            type: Array,
            required: true,
        },
    },
    emits: ['update:modelValue', 'save', 'close'],
    setup(props,{ emit }) {
        const langStore = useLanguageStore();
        const isEditing = ref(false);
        const task = ref({
        id: null,
        title: '',
        description: '',
        assignee: { id: null, name: '' },
        dueDate: null,
        status: 'pending',
        });

        watch(() => props.taskToEdit, (newTask) => {
        if (newTask) {
            task.value = JSON.parse(JSON.stringify(newTask));
            isEditing.value = true;
        } else {
            // Khi thêm mới, khởi tạo assignee từ props.users an toàn hơn
            const defaultAssignee = props.users && props.users.length > 0 
            ? { id: props.users[0].id, name: props.users[0].name } 
            : { id: null, name: '' };

            task.value = {
            id: null,
            title: '',
            description: '',
            assignee: defaultAssignee,
            dueDate: null,
            status: 'pending',
            };
            isEditing.value = false;
        }
        }, { immediate: true });

        const handleSave = () => {
        if (!task.value.title || !task.value.assignee?.id || !task.value.dueDate) { // Sử dụng optional chaining cho task.value.assignee
            ElMessage.error(langStore.t('formValidationMessage'));
            return;
        }
        emit('save', task.value, isEditing.value);
        emit('update:modelValue', false);
        };

        const handleClose = () => {
            emit('close');
            emit('update:modelValue', false);
        };

        return {
            langStore,
            isEditing,
            task,
            handleSave,
            handleClose,
        }
    }
}
</script>