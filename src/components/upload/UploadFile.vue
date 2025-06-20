<template>
  <div class="upload-file-container">
    <h2>File Upload</h2>
    <el-upload
      class="upload-dragger"
      drag
      :accept="acceptedFileTypes"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleElFileUploadChange"
      :on-remove="handleElFileRemove"
      :on-exceed="handleElExceed"
      ref="uploadRef"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">Kéo file vào đây hoặc <em>nhấp để chọn</em></div>
      <template #tip>
        <div class="el-upload__tip">
          Hỗ trợ: docx, xlsx, xls, pdf (Kích thước tối đa {{ MAX_FILE_SIZE_MB }}MB)
        </div>
      </template>
    </el-upload>

    <div v-if="selectedFile" class="selected-file-info">
      <p>
        File đã chọn: <strong>{{ selectedFile.name }}</strong>
      </p>
      <el-button type="danger" size="small" @click="clearSelectedFile">
        Xóa File
      </el-button>
    </div>

    <div v-if="showProgressBar" class="progress-bar-section">
      <h3>Tiến độ xử lý dữ liệu</h3>
      <div class="progress-wrapper">
        <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ uploadProgress }}% - {{ uploadStatusText }}</p>
      <el-button
        v-if="isUploading"
        type="warning"
        size="small"
        @click="cancelUploadProcess"
        >Hủy</el-button
      >
    </div>

    <el-button
      type="primary"
      :disabled="!selectedFile || isUploading"
      @click="triggerUpload"
      class="upload-button"
    >
      Xử lý dữ liệu
    </el-button>

    <div class="folder-path-section">
      <h3>Thư mục lưu trữ</h3>
      <el-input
        v-model="savedFolderPath"
        placeholder="Đường dẫn thư mục sẽ hiển thị ở đây"
        readonly
        :disabled="true"
      ></el-input>
      <el-button
        v-if="savedFolderPath"
        type="info"
        size="small"
        class="copy-button"
        @click="copyFolderPath"
      >
        Copy
      </el-button>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElButton, ElIcon, ElUpload, ElInput } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { computed, ref, watch } from "vue";

export default {
  name: "UploadFile",
  components: {
    ElButton,
    ElIcon,
    ElUpload,
    ElInput, // Thêm ElInput
    UploadFilled,
  },
  emits: ["file-selected", "file-cleared", "file-uploaded"], // Bỏ các emits liên quan đến progress bar

  setup(_, { emit }) {
    const uploadRef = ref(null);
    const selectedFile = ref(null);

    // Các biến trạng thái cho Progress Bar
    const uploadProgress = ref(0);
    const uploadStatusText = ref("");
    const showProgressBar = ref(false);
    const isUploading = ref(false);
    let uploadInterval = null;

    // Biến cho thư mục lưu trữ
    const savedFolderPath = ref("");

    const acceptedFileTypes =
      ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
      ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
      ".xls,application/vnd.ms-excel," +
      ".pdf,application/pdf";
    const MAX_FILE_SIZE_MB = 15;

    // Computed property để lấy class trạng thái (không còn cần thiết lắm nếu dùng statusText)
    // const uploadStatusClass = computed(() => {
    //   if (uploadStatusText.value.includes('thành công')) {
    //     return 'success-message';
    //   } else if (uploadStatusText.value.includes('Lỗi')) {
    //     return 'error-message';
    //   }
    //   return '';
    // });

    const handleElFileUploadChange = (file, fileList) => {
      selectedFile.value = null;
      uploadProgress.value = 0;
      showProgressBar.value = false;
      uploadStatusText.value = "";
      isUploading.value = false; // Đảm bảo reset trạng thái upload
      savedFolderPath.value = ""; // Reset đường dẫn khi chọn file mới
      clearInterval(uploadInterval); // Xóa interval cũ

      if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
        ElMessage.error(`Kích thước file không được vượt quá ${MAX_FILE_SIZE_MB}MB!`);
        uploadRef.value.clearFiles();
        return false;
      }

      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileMimeType = file.raw.type;

      const allowedTypes = {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
          "docx",
        ],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
        "application/vnd.ms-excel": ["xls"],
        "application/pdf": ["pdf"],
      };

      let isFileAllowed = false;

      if (allowedTypes[fileMimeType]) {
        if (allowedTypes[fileMimeType].includes(fileExtension)) {
          isFileAllowed = true;
        }
      } else if (
        fileMimeType === "" &&
        (fileExtension === "xls" ||
          fileExtension === "xlsx" ||
          fileExtension === "doc" ||
          fileExtension === "docx")
      ) {
        isFileAllowed = true;
      }

      if (!isFileAllowed) {
        ElMessage.error(
          `Chỉ cho phép tải lên các file có định dạng: docx, xlsx, xls, pdf.`
        );
        uploadRef.value.clearFiles();
        return false;
      }

      selectedFile.value = file.raw;
      emit("file-selected", selectedFile.value);
    };

    const handleElFileRemove = (file, fileList) => {
      clearSelectedFile();
    };

    const handleElExceed = (files, uploadFiles) => {
      ElMessage.warning(`Bạn chỉ có thể chọn một file tại một thời điểm.`);
    };

    const clearSelectedFile = () => {
      selectedFile.value = null;
      uploadProgress.value = 0;
      uploadStatusText.value = "";
      showProgressBar.value = false;
      isUploading.value = false;
      savedFolderPath.value = ""; // Reset đường dẫn
      clearInterval(uploadInterval); // Xóa interval
      emit("file-cleared");
    };

    const triggerUpload = async () => {
      if (!selectedFile.value) {
        ElMessage.warning("Vui lòng chọn một file để tải lên.");
        return;
      }

      isUploading.value = true;
      showProgressBar.value = true;
      uploadProgress.value = 0;
      uploadStatusText.value = "Đang xử lý...";
      savedFolderPath.value = ""; // Xóa đường dẫn cũ

      let progress = 0;
      uploadInterval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          uploadProgress.value = progress;
        } else {
          clearInterval(uploadInterval);
        }
      }, 200);

      try {
        await new Promise((resolve) => setTimeout(resolve, 2500)); // Tổng thời gian mô phỏng upload

        clearInterval(uploadInterval);
        uploadProgress.value = 100;
        uploadStatusText.value = "Xử lý thành công!";
        ElMessage.success("Xử lý thành công!");

        // *** MÔ PHỎNG ĐƯỜNG DẪN THƯ MỤC LƯU TRỮ ***
        // Trong thực tế, đường dẫn này sẽ được trả về từ API backend sau khi upload thành công.
        savedFolderPath.value = `/uploads/${
          selectedFile.value.name.split(".")[0]
        }_${Date.now()}`;

        emit("file-uploaded", selectedFile.value);
        isUploading.value = false;

        // Có thể ẩn progress bar sau một thời gian ngắn
        setTimeout(() => {
          showProgressBar.value = false;
          uploadProgress.value = 0;
          uploadStatusText.value = "";
        }, 3000); // Ẩn sau 3 giây
      } catch (error) {
        clearInterval(uploadInterval);
        console.error("Lỗi khi tải file:", error);
        uploadProgress.value = 0;
        uploadStatusText.value = `Lỗi: ${error.message}`;
        ElMessage.error(`Lỗi khi tải file: ${error.message}`);
        isUploading.value = false;
        // Hiển thị lại nút hủy hoặc thông báo lỗi rõ ràng hơn
      }
    };

    const cancelUploadProcess = () => {
      clearInterval(uploadInterval);
      isUploading.value = false;
      uploadProgress.value = 0;
      uploadStatusText.value = "Xử lý đã bị hủy.";
      showProgressBar.value = false; // Ẩn progress bar khi hủy
      ElMessage.warning("Xử lý đã bị hủy.");
    };

    const copyFolderPath = async () => {
      if (savedFolderPath.value) {
        try {
          await navigator.clipboard.writeText(savedFolderPath.value);
          ElMessage.success("Đã sao chép đường dẫn vào clipboard!");
        } catch (err) {
          ElMessage.error("Không thể sao chép đường dẫn.");
          console.error("Failed to copy: ", err);
        }
      }
    };

    return {
      uploadRef,
      selectedFile,
      acceptedFileTypes,
      MAX_FILE_SIZE_MB,
      isUploading,
      uploadProgress,
      uploadStatusText,
      showProgressBar,
      savedFolderPath,
      handleElFileUploadChange,
      handleElFileRemove,
      handleElExceed,
      clearSelectedFile,
      triggerUpload,
      cancelUploadProcess,
      copyFolderPath,
    };
  },
};
</script>

<style scoped>
.upload-file-container {
  background-color: var(--siements_web_functional_gray);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-basis: 40%; /* Chiếm khoảng 40% chiều rộng của content-wrapper */
  display: flex;
  flex-direction: column;
  gap: 20px; /* Khoảng cách giữa các phần tử chính */
  height: calc(100% - 120px);
}

h2 {
  color: #409eff;
  margin-bottom: 0; /* Bỏ margin-bottom ở đây để gap hoạt động tốt hơn */
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  font-weight: 500;
}

.upload-dragger .el-upload-dragger {
  width: 100%;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  background-color: #fdfdfd;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.upload-dragger .el-upload-dragger:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.el-icon--upload {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 10px;
}

.el-upload__text {
  color: #909399;
  font-size: 14px;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.selected-file-info {
  padding: 10px 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f4f4f5;
  color: #606266;
}

.selected-file-info p {
  margin: 0;
  font-size: 14px;
}

.upload-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
}

/* Styles cho Progress Bar Section */
.progress-bar-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.progress-bar-section h3 {
  color: #409eff;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 500;
}

.progress-wrapper {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 18px;
  background-color: var(--estec-unique-color);
  width: 0%;
  transition: width 0.3s ease-in-out;
  border-radius: 5px;
}

.progress-text {
  font-size: 13px;
  color: #555;
  margin-bottom: 10px;
}

/* Styles cho Folder Path Section */
.folder-path-section {
  margin-top: auto; /* Đẩy phần này xuống cuối container flex */
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.folder-path-section h3 {
  color: #409eff;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: 500;
}

.folder-path-section .el-input {
  margin-bottom: 10px;
}

.folder-path-section .copy-button {
  width: 100%;
}

/* --- Responsive styles for mobile --- */
@media (max-width: 768px) {
  .upload-file-container {
    /* Đảm bảo chiếm toàn bộ chiều rộng có sẵn */
    width: 100%;
    flex-basis: auto; /* Bỏ flex-basis cố định cho màn hình lớn */
    padding: 15px; /* Giảm padding trên mobile */
    height: auto; /* Cho phép chiều cao tự động co giãn */
    margin-bottom: 20px; /* Thêm khoảng cách nếu nó nằm trên FileReview */
  }

  .upload-dragger .el-upload-dragger {
    height: 150px; /* Giảm chiều cao của vùng kéo thả */
  }

  .el-icon--upload {
    font-size: 50px; /* Giảm kích thước icon */
  }

  .el-upload__text {
    font-size: 13px; /* Giảm kích thước chữ */
  }

  .el-upload__tip {
    font-size: 11px; /* Giảm kích thước chữ tip */
  }

  .selected-file-info {
    flex-direction: column; /* Xếp thông tin file theo cột */
    align-items: flex-start; /* Căn trái các mục */
    padding: 10px;
  }

  .selected-file-info p {
    margin-bottom: 10px; /* Thêm khoảng cách giữa tên file và nút xóa */
  }

  .selected-file-info .el-button {
    width: 100%; /* Nút xóa chiếm toàn bộ chiều rộng */
  }

  .upload-button {
    padding: 10px 0; /* Giảm padding của nút upload */
    font-size: 15px; /* Giảm kích thước chữ nút upload */
  }

  .progress-bar-section,
  .folder-path-section {
    padding: 10px; /* Giảm padding */
  }

  .progress-bar-section h3,
  .folder-path-section h3 {
    font-size: 1em; /* Giảm kích thước tiêu đề */
  }

  .progress-text {
    font-size: 12px; /* Giảm kích thước chữ tiến độ */
  }

  .folder-path-section .el-input {
    font-size: 13px; /* Giảm kích thước chữ input */
  }
}

@media (max-width: 480px) {
  .upload-file-container {
    padding: 10px; /* Giảm padding nhỏ hơn nữa */
  }

  h2 {
    font-size: 1.3em; /* Giảm kích thước tiêu đề chính */
  }

  .upload-dragger .el-upload-dragger {
    height: 120px; /* Giảm chiều cao tối thiểu */
  }

  .el-icon--upload {
    font-size: 40px; /* Icon nhỏ hơn */
  }
}
</style>
