<template>
  <el-dialog
    v-model="dialogVisible"
    :title="langStore.t('UploadFileToServer')"
    width="500"
    :before-close="handleClose"
    :v-loading="isUploading"
    :element-loading-text="langStore.t('FileUploading')"
  >
    <el-upload
      class="file-upload-wrapper"
      drag
      action="#"
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="true"
      :limit="1"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      accept=".xls, .xlsx"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        {{ langStore.t("DragAndDropTheFileHereOr") }}
      </div>
      <template #tip>
        <div class="el-upload__tip">{{ langStore.t("OnlyAcceptFile") }}.</div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-on:click="handleClose" :disabled="isUploading">{{ langStore.t('DestroyAct') }}</el-button>
        <el-button type="success" @click="submitUpload" :disabled="isUploading"
          >{{ langStore.t('UploadAct') }}</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {
  ElButton,
  ElDialog,
  ElIcon,
  ElMessage,
  ElMessageBox,
  
  ElUpload,
} from "element-plus";
import { useLanguageStore } from "../../stores/language";
import { ref, watch } from "vue";
import { useUploadWarehouseImport } from "../../composables/Warehouse_Import/useUploadWarehouseImport";

export default {
  name: "WarehouseImportUpload",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "uploadSuccess"],
  components: {
    ElUpload,
    ElDialog,
    ElIcon,
    ElButton,
    ElMessage,
    ElMessageBox,
  },
  setup(props, { emit }) {
    const langStore = useLanguageStore();
    const dialogVisible = ref(props.modelValue);
    const uploadRef = ref(null);
    const fileToUpload = ref(null);
    const { isUploading, uploadFile } = useUploadWarehouseImport();

    watch(
      () => props.modelValue,
      (val) => {
        dialogVisible.value = val;
        if (!val && uploadRef.value) {
          uploadRef.value.clearFiles();
          fileToUpload.value = null; // Reset file
        }
      }
    );

    const handleExceed = () => {
      ElMessage.warning(langStore.t('YouCanOnlySelectOnefileAtATime'));
    };

    const handleChange = (uploadFile) => {
        fileToUpload.value = uploadFile.raw;
    }

    const submitUpload = async () => {
      if (!fileToUpload.value) {
        ElMessage.error(langStore.t('PleaseSelectOneFileToUpload'));
        return;
      }
      const file = fileToUpload.value;

      if (file.size / 1024 / 1024 > 5) {
        ElMessage.error(langStore.t('NotiLimitFileDisk'));
        return;
      }
      isUploading.value = true;
      try {
        // Call service and transfer userId receive from props
        const result = await uploadFile(file);

        if (result) {
          emit("uploadSuccess");
          ElMessage.success(langStore.t('FileUploadedSuccessfully'));
          closeDialog();
        }
      } catch (e) {
        ElMessage.error(`Lỗi khi tải lên tệp: ${e.message}`);
      } finally {
        isUploading.value = false;
      }
    };

    const closeDialog = () => {
      emit("update:modelValue", false);
    };

    const handleClose = () => {
      if (isUploading.value) {
        ElMessage.warning(langStore.t('PleaseWaitUntilTheFileIsFinishedUploading'));

        return;
      }
      ElMessageBox.confirm(langStore.t('ConfirmTheFileUpload'))
        .then(() => {
          closeDialog();
        })
        .catch(() => {
          // do nothing
        });
    };

    return {
      langStore,
      dialogVisible,
      uploadRef,
      fileToUpload,
      handleExceed,
      handleChange,
      submitUpload,
      handleClose,
      isUploading,
      closeDialog,
    };
  },
};
</script>

<style>
</style>
