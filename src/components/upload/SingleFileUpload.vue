<template>
  <div class="single-file-upload-container">
    <div class="header-section">
      <h3 class="component-title">{{ langStore.t('UploadSummaryFile') }}</h3>
    </div>
    <el-upload
      class="upload-demo"
      drag
      :auto-upload="false"
      :show-file-list="true"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :file-list="fileList"
      :limit="1"
      :on-exceed="handleExceed"
      accept=".xls,.xlsx, .mpp"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        {{ langStore.t("DragAndDropTheFileHereOr") }}
        <em>{{ langStore.t("ClickToChoose") }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ langStore.t("OnlyAcceptFile") }}.
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script>
import { ElMessage, ElUpload, ElIcon } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useLanguageStore } from "../../stores/language";
export default {
  name: "SingleFileUpload",
  components: { 
    ElUpload,
    ElIcon,
    UploadFilled,
  },
  emits: ["file-selected", "file-cleared"],
  setup(_, { emit }) {
    const fileList = ref([]);
    const langStore = useLanguageStore();

    const handleChange = (file, newFileList) => {
      // Khi 1 file duoc chon (hoac thay doi)
      if (file.raw.size > 500 * 1024 * 1024) {
        ElMessage.error("Kích thước file không được vượt quá 500MB.");
        // Giu lai file cu hoac xoa file moi them vao neu qua lon
        fileList.value = newFileList.filter((f) => f.uid !== file.uid);
        emit("file-cleared"); // Thong bao file da bi xoa
        return;
      }
      fileList.value = [file]; // Dam bao chi co mot file trong danh sach
      emit("file-selected", file.name); // Gui file raw ra ben ngoai
    };

    const handleRemove = (file) => {
      // Khi file bi xoa khoi danh sach
      fileList.value = [];
      emit("file-cleared"); // Thong bao file da bi xoa
      ElMessage.info(`File ${file.name} đã được gỡ bỏ.`);
    };

    const handleExceed = () => {
      ElMessage.warning(
        "Chỉ có thể chọn 1 file. Vui lòng xóa file hiện tại trước khi chọn file."
      );
    };

    // Ham public de truy cap file da chon tu ben ngoai
    const getFiles = () => {
      return fileList.value.length > 0 ? fileList.value[0].raw : null;
    };

    const clearFiles = () => {
      fileList.value = [];
      emit("file-cleared"); // Phát sự kiện để component cha biết đã xóa file
    };

    return {
      fileList,
      langStore,
      handleChange,
      handleRemove,
      handleExceed,
      getFiles,
      clearFiles,
    };
  },
};
</script>

<style>
.single-file-upload-container {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex: 1; /* Cho phép component co giãn trong flex container */
  display: flex;
  flex-direction: column;
}

.header-section {
  text-align: center;
  margin-bottom: 20px;
}

.component-title {
  color: var(--estec-unique-color);
  font-size: 1.5em;
  margin-top: 0;
  margin-bottom: 10px;
}

.upload-demo {
  flex-grow: 1; /* Cho phép el-upload chiếm hết không gian còn lại */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Căn giữa nội dung upload */
  align-items: center;
}

/* Đảm bảo khung kéo thả chiếm đủ không gian */
:deep(.el-upload-dragger) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /* Quan trọng để dragger chiếm hết không gian */
  width: 100%;
  padding: 20px; /* Thêm padding nếu cần */
}

:deep(.el-upload-dragger .el-icon--upload) {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 15px;
}

:deep(.el-upload-dragger .el-upload__text) {
  color: #999;
  font-size: 14px;
  text-align: center;
}

:deep(.el-upload__tip) {
  margin-top: 7px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

/* Điều chỉnh lại danh sách file đã chọn để hiển thị gọn hơn */
:deep(.el-upload-list) {
  margin-top: 15px;
  max-height: 100px; /* Giới hạn chiều cao */
  overflow-y: auto; /* Thêm scroll nếu nhiều file */
}
</style>
