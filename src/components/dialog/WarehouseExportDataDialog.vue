<template>
  <el-dialog
    v-model="internalDialogVisible"
    :title="langStore.t('dialogTitleEditExportedItem')"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="taskForm" label-width="150px">
      <el-form-item :label="langStore.t('detailIdLabel')" prop="export_id">
        <el-input 
          v-model="formData.id"
          :disabled="true" 
          :readonly="true"
        ></el-input>
        <span style="color: red; font-size: 12px; margin-top: 0.1px; display: block;">
          {{ langStore.t('idCannotBeEditedMessage') }}
        </span>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderProjectCode')" prop="project_code">
        <el-input v-model="formData.project_code"></el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderPartNo')" prop="part_no">
        <el-input 
          v-model="formData.part_no" 
          :disabled="true" 
          :readonly="true">
        </el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderManufacturer')" prop="manufacturer">
        <el-input 
          v-model="formData.manufacturer"      
          :disabled="true" 
          :readonly="true">
        </el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('detailDescriptionLabel')" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3"></el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderQuantity')" prop="quantity">
        <el-input v-model="formData.quantity" type="number" min="1"></el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderSeriNumber')" prop="seri_number">
        <el-input 
          v-model="formData.seri_number"
        >
        </el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderLocation')" prop="location">
        <el-input v-model="formData.location"></el-input>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderStatus')" prop="status">
        <el-select 
          v-model="formData.status" 
          :placeholder="langStore.t('selectStatusPlaceholder') || 'Chọn trạng thái'"
        >
          <el-option :value="0" label= "Chưa lắp đặt"></el-option>
          <el-option :value="1" label= "Đã Lắp Đặt "></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="cabinet_no" prop="cabinet_no" v-show="hideFields">
        <el-input v-model="formData.cabinet_no" :disabled="true" :readonly="true"></el-input>
      </el-form-item>
      <el-form-item label="dt" prop="dt" v-show="hideFields">
        <el-input v-model="formData.dt" :disabled="true" :readonly="true"></el-input>
      </el-form-item>
      <el-form-item label="higher_lever_function" prop="higher_lever_function" v-show="hideFields">
        <el-input v-model="formData.higher_lever_function" :disabled="true" :readonly="true"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ langStore.t('cancelButton') }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{ langStore.t('saveButton') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useLanguageStore } from '../../stores/language';

export default {
  name: 'WarehouseExportDataDialog',
  props: {
    modelValue: { 
      type: Boolean,
      default: false,
    },
    itemToEdit: {
      type: Object,
      default: null, 
    },
  },
  emits: ['update:modelValue', 'save', 'close'],

  setup(props, { emit }) {
    // Khai báo Store (Đã được return để sử dụng trong template)
    const langStore = useLanguageStore(); 

    // Các biến reactive
    const internalDialogVisible = ref(props.modelValue);
    const formData = ref(initializeFormData(props.itemToEdit));
    const taskForm = ref(null); 
    const hideFields = ref(false);

    // Computed property
    const isEditing = computed(() => !!props.itemToEdit && props.itemToEdit.id !== '');

    const rules = {
      quantity: [
        { required: true, message: langStore.t('quantityRequiredMessage'), trigger: "change" },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
              callback(new Error(langStore.t('quantityMustBeNumberMessage')));
            } else if (numericValue < 0) {
              callback(new Error(langStore.t('quantityCannotBeNegativeMessage')));
            } else {
              callback(); 
            }
          },
          trigger: "blur", 
        },
      ],
      id: [
        { required: true, message: langStore.t('idRequiredMessage'), trigger: "change" },
      ],
    };

    watch(() => props.modelValue, (newVal) => {
      internalDialogVisible.value = newVal;
      if (newVal && props.itemToEdit) {
        formData.value = JSON.parse(JSON.stringify(props.itemToEdit));
      } else if (newVal && !props.itemToEdit) {
        formData.value = initializeFormData(null);
        if (taskForm.value) {
          taskForm.value.resetFields();
        }
      }
    });

    watch(() => props.itemToEdit, (newVal) => {
      formData.value = initializeFormData(newVal);
      if (taskForm.value) {
        taskForm.value.clearValidate();
      }
    });

    function initializeFormData(task) {
      return task ? { ...task } : {
        project_code: '',
        part_no: '',
        manufacturer: '',
        description: '',
        quantity: '',
        seri_number: '',
        location: '',
        status: 0,
        higher_lever_function: '',
        cabinet_no: '',
        dt: '',
      };
    }

    const handleSubmit = () => {
      taskForm.value.validate((valid) => {
        if (valid) {
          emit('save', formData.value, isEditing.value);
        } else {
          ElMessage.error(langStore.t('formValidationMessage'));
          return false;
        }
      });
    };

    const handleClose = () => {
      internalDialogVisible.value = false;
      emit('update:modelValue', false);
      emit('close');
      formData.value = initializeFormData(null);
      if (taskForm.value) {
        taskForm.value.resetFields();
      }
    };

    return {
      internalDialogVisible,
      formData,
      rules,
      taskForm,
      isEditing,
      handleSubmit,
      handleClose,
      hideFields,
      langStore 
    };
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
  display: block;
}
.option-input {
  width: 100%;
  margin-bottom: 8px;
}
</style>