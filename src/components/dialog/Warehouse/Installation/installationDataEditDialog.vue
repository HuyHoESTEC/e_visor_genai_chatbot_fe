<template>
  <el-dialog
    v-model="internalDialogVisible"
    :title="langStore.t('dialogTitleEditExportedItem')"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="taskForm" label-width="150px">
      <el-form-item :label="langStore.t([detailIdLabel])" prop="export_id">
        <el-input v-model="formData.id" :disabled="true" :readonly="true" />
        <span style="color: red; font-size: 12px; margin-top: 0.1px; display: block">
          {{ langStore.t("idCannotBeEditedMessage") }}
        </span>
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderPartNo')" prop="part_no">
        <el-input v-model="formData.part_no" :disabled="true" :readonly="true" />
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderManufacturer')" prop="manufacturer">
        <el-input v-model="formData.manufacturer" :disabled="true" :readonly="true" />
      </el-form-item>

      <el-form-item :label="langStore.t('detailDescriptionLabel')" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" />
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderQuantity')" prop="quantity">
        <el-input v-model="formData.quantity" type="number" min="1" />
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderSeriNumber')" prop="seri_number">
        <el-input v-model="formData.seri_number" :disabled="false" :readonly="false" />
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderLocation')" prop="location">
        <el-input v-model="formData.location" :disabled="false" :readonly="false" />
      </el-form-item>

      <el-form-item :label="langStore.t('tableHeaderStatus')" prop="status">
        <el-select
          v-model="formData.status"
          :placeholder="langStore.t('selectStatusPlaceholder') || 'Chọn trạng thái'"
        >
          <el-option :value="1" label="Chưa lắp đặt" />
          <el-option :value="0" label="Đã lắp đặt" />
        </el-select>
      </el-form-item>

      <el-form-item label="Mã tủ" prop="cabinet_no" v-show="hideFields">
        <el-input v-model="formData.cabinet_no" :disabled="true" :readonly="true" />
      </el-form-item>

      <el-form-item label="dt" prop="dt" v-show="hideFields">
        <el-input v-model="formData.dt" :disabled="true" :readonly="true" />
      </el-form-item>

      <el-form-item
        label="higher_level_function"
        prop="higher_level_function"
        v-show="hideFields"
      >
        <el-input
          v-model="formData.higher_level_function"
          :disabled="true"
          :readonly="true"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ langStore.t("cancelButton") }}</el-button>
        <el-button type="primary" @click="handleSubmit">{{
          langStore.t("saveButton")
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useLanguageStore } from "../../../../stores/language";
import { ElMessage } from "element-plus";

export default {
  name: "InstallatioDataEditDialog",
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
  emits: ["update:modelValue", "save", "close"],
  setup(props, { emit }) {
    const langStore = useLanguageStore();
    const initializeFormData = (task) => {
      if (!task) {
        return {
          project_code: "",
          part_no: "",
          manufacturer: "",
          description: "",
          quantity: "",
          seri_number: "",
          location: "",
          status: 0,
          higher_level_function: "",
          cabinet_no: "",
          dt: "",
        };
      }

      return {
        ...task,
        status:
          task.status !== undefined && task.status !== null ? Number(task.status) : 0,
      };
    };

    const internalDialogVisible = ref(props.modelValue);
    const formData = ref(initializeFormData(props.itemToEdit));
    const taskForm = ref(null);
    const hideFields = ref(false);

    const isEditing = computed(() => !!props.itemToEdit && props.itemToEdit.id !== "");
    const rules = {
      quantity: [
        {
          required: true,
          message: langStore.t("quantityRequiredMessage"),
          trigger: "change",
        },
        {
          validator: (rule, value, callback) => {
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
              callback(new Error(langStore.t("quantityMustBeNumberMessage")));
            } else if (numericValue < 0) {
              callback(new Error(langStore.t("quantityCannotBeNegativeMessage")));
            } else {
              callback();
            }
          },
          trigger: "blur",
        },
      ],
      id: [
        { required: true, message: langStore.t("idRequiredMessage"), trigger: "change" },
      ],
    };

    watch(
      () => props.modelValue,
      (isOpen) => {
        internalDialogVisible.value = isOpen;
        if (isOpen) {
          // Khi mở popup, lấy dữ liệu từ itemToEdit và chạy qua hàm ép kiểu
          formData.value = initializeFormData(props.itemToEdit);

          // Xóa các lỗi validate cũ nếu có
          if (taskForm.value) {
            taskForm.value.clearValidate();
          }
        }
      },
      { immediate: true }
    );

    // watch(
    //   () => props.itemToEdit,
    //   (newVal) => {
    //     formData.value = initializeFormData(newVal);
    //     if (taskForm.value) {
    //       taskForm.value.clearValidate();
    //     }
    //   }
    // );

    const handleSubmit = () => {
      taskForm.value.validate((valid) => {
        if (valid) {
          emit("save", formData.value, isEditing.value);
        } else {
          ElMessage.error(langStore.t("formValidationMessage"));
          return false;
        }
      });
    };

    const handleClose = () => {
      internalDialogVisible.value = false;
      emit("update:modelValue", false);
      emit("close");
      formData.value = initializeFormData(null);
      if (taskForm.value) {
        taskForm.value.resetFields();
      }
    };

    return {
      langStore,
      internalDialogVisible,
      formData,
      taskForm,
      hideFields,
      isEditing,
      rules,
      handleSubmit,
      handleClose,
    };
  },
};
</script>

<style lang="css" scoped>
.dialog-footer {
  text-align: right;
  display: block;
}
.option-input {
  width: 100%;
  margin-bottom: 8px;
}
</style>
