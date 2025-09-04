<template>
  <div class="multi-file-upload-container">
    <div class="header-section">
      <h3 class="component-title">{{ langeStore.t("UploadComponentsFiles") }}</h3>
    </div>
    <el-upload
      class="upload-demo"
      drag
      multiple
      :auto-upload="false"
      :show-file-list="true"
      :on-change="handleChange"
      :on-remove="handleRemove"
      :limit="10"
      :file-list="fileList"
      accept=".xls, .xlsx, .mpp"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        {{ langeStore.t("DragAndDropTheFileHereOr") }}
        <em>{{ langeStore.t("ClickToChoose") }}</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">{{ langeStore.t("OnlyAcceptFile") }}.</div>
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
  name: "MultiFileUpload",
  components: {
    ElUpload,
    ElIcon,
    UploadFilled,
  },
  emits: ["files-selected", "file-cleared"], // files-selected cho nhiều file, file-cleared cho 1 file cụ thể
  setup(_, { emit }) {
    const fileList = ref([]); // List current file in ElUpload
    const langeStore = useLanguageStore();

    const handleChange = (file, newFileList) => {
      // Check file size
      if (file.raw.size > 500 * 1024 * 1024) {
        // 500MB
        ElMessage.error(
          `File {file.name} có kích thước vượt quá 500MB và sẽ không được tải lên`
        );
        // Lọc bỏ file quá lớn khỏi danh sách
        fileList.value = newFileList.filter(
          (f) => f.uid !== file.uid && f.raw.size <= 500 * 1024 * 1024
        );
      } else {
        fileList.value = newFileList; // Cap nhat danh sach file
      }
      emit(
        "files-selected",
        fileList.value.map((f) => f.raw)
      ); // Gui tat ca file raw ra ngoai
    };

    const handleRemove = (file, newFileList) => {
      // Khi file bi xoa khoi danh sach
      fileList.value = newFileList;
      emit("file-cleared", file.raw); // Thong bao file da bi xoa
      ElMessage.info(`File ${file.name} đã được gỡ bỏ.`);
      // Phat lai su kien files-selected de cap nhat danh sach file con lai
      emit(
        "files-selected",
        fileList.value.map((f) => f.raw)
      );
    };

    // Ham public de truy cap tat ca file da chon tu ben ngoai (TimeTrackingPage)
    const getFiles = () => {
      return fileList.value.map((f) => f.raw);
    };

    const clearFiles = () => {
      fileList.value = [];
      // Phát sự kiện files-selected với mảng rỗng để cập nhật danh sách file trong component cha
      emit("files-selected", []);
      ElMessage.info("Tất cả file đã được gỡ bỏ.");
    };

    return {
      fileList,
      langeStore,
      handleChange,
      handleRemove,
      getFiles,
      clearFiles,
    };
  },
};
</script>

<style>
.multi-file-upload-container {
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
  max-height: 150px; /* Giới hạn chiều cao */
  overflow-y: auto; /* Thêm scroll nếu nhiều file */
}
</style>
