<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="500"
    :before-close="handleClose"
    @close="handleDialogClose"
    >
    <div 
      v-loading="isUploading"
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
        :accept="accept"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          {{ langStore.t("DragAndDropTheFileHereOr") }}
        </div>
        <template #tip>
          <div class="el-upload__tip">
            {{ tipText || langStore.t("OnlyAcceptFile") }}.
            <span v-if="maxFileSizeMB > 0" style="color: #f56c6c">
              (Tối đa {{ maxFileSizeMB }}MB)
            </span>
          </div>
        </template>
      </el-upload>

      <div
        v-if="downloadUrl"
        style="
          margin-top: 20px;
          padding: 10px;
          border: 1px dashed #409eff;
          border-radius: 4px;
        "
      >
        <p style="margin-top: 0; font-weight: bold">Tệp đã tải lên thành công:</p>
        <el-link type="primary" :href="downloadUrl" target="_blank" :icon="Download">
          {{ downloadUrlText || "Tải xuống tệp" }}
        </el-link>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="isUploading">{{
          langStore.t("DestroyAct")
        }}</el-button>
        <el-button
          type="success"
          @click="submitUpload"
          :disabled="isUploading || !fileToUpload"
        >
          {{ langStore.t("UploadAct") }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { Download, UploadFilled } from "@element-plus/icons-vue";
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useLanguageStore } from "../../stores/language";

export default {
  name: "FileUrlUploadingDialog",
  components: {
    UploadFilled,
    Download,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Tải file lên máy chủ",
    },
    accept: {
      type: String,
      default: ".xls, .xlsx",
    },
    maxFileSizeMB: {
      type: Number,
      default: 5,
    },
    tipText: {
      type: String,
      default: "",
    },
    uploadFunction: {
      type: Function,
      required: true,
    },
    downloadUrlText: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "uploadSuccess"],
  setup(props, { emit }) {
    const langStore = useLanguageStore();
    const uploadRef = ref(null);
    const fileToUpload = ref(null);
    const isUploading = ref(false);
    const downloadUrl = ref(null);

    watch(
      () => props.modelValue,
      (newVal) => {
        if (!newVal) {
          fileToUpload.value = null;
          downloadUrl.value = null;
          if (uploadRef.value) {
            uploadRef.value.clearFiles();
          }
        }
      }
    );

    const handleExceed = () => {
      ElMessage.warning("Chỉ được phép tải lên một tệp tại một thời điểm.");
    };

    const handleChange = (file, fileList) => {
      // Keep a latest file
      fileToUpload.value = fileList.length > 0 ? fileList[fileList.length - 1].raw : null;
      // Reset URL when user choose new file
      downloadUrl.value = null;
    };

    const submitUpload = async () => {
      if (!fileToUpload.value) {
        ElMessage.error(langStore.t("PleaseSelectOneFileToUpload"));
        return;
      }
      const file = fileToUpload.value;

      if (props.maxFileSizeMB > 0 && file.size / 1024 / 1024 > props.maxFileSizeMB) {
        ElMessage.error(`Kích thước file vượt quá giời hạn ${props.maxFileSizeMB}.`);
        return;
      }

      isUploading.value = true;
      downloadUrl.value = null;

      try {
        const resultUrl = await props.uploadFunction(file);
        if (resultUrl && typeof resultUrl === "string") {
          downloadUrl.value = resultUrl;
          emit("uploadSuccess", resultUrl);
        } else if (resultUrl !== false) {
          ElMessage.error("Tải lên thất bại: Máy chủ không trả về URL hợp lệ.");
        }
      } catch (e) {
        ElMessage.error(`Lỗi khi tải lên tệp: ${e.message}`);
      } finally {
        isUploading.value = false;
      }
    };

    const handleClose = () => {
      if (isUploading.value) {
        ElMessage.warning(langStore.t("PleaseWaitUntilTheFileIsFinishedUploading"));
        return;
      }

      let message = downloadUrl.value
        ? "Tệp đã tải lên thành công. Bạn có muốn đóng cửa sổ này không ?"
        : langStore.t("ConfirmTheFileUpload");

      ElMessageBox.confirm(message, "Xác nhận", {
        confirmButtonText: "Đóng",
        cancelButtonText: "Hủy",
        type: "warning",
      })
        .then(() => {
          emit("update:modelValue", false);
        })
        .catch(() => {
          // do nothing
        });
    };

    const handleCancel = () => {
      handleClose();
    };

    const handleDialogClose = () => {
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
      fileToUpload.value = null;
      downloadUrl.value = null;
    };

    return {
      langStore,
      uploadRef,
      fileToUpload,
      isUploading,
      downloadUrl,
      UploadFilled,
      Download,
      // Functions
      handleExceed,
      handleChange,
      submitUpload,
      handleCancel,
      handleClose,
      handleDialogClose,
    };
  },
};
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
}
</style>
