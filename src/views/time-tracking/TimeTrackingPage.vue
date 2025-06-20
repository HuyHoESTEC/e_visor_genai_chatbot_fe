<template>
  <div class="time-tracking-container">
    <div class="content-wrapper">
      <UploadFile
        @file-selected="handleFileSelected"
        @file-cleared="handleFileCleared"
        @file-uploaded="handleFileUploaded"
      />
      <FileReview :file="fileToPreview" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import UploadFile from "../../components/upload/UploadFile.vue";
import FileReview from "../../components/review/FileReview.vue";
import { ElMessage } from "element-plus";

export default {
  name: "TimeTrackingPage",
  components: {
    UploadFile,
    FileReview,
  },
  setup() {
    const fileToPreview = ref(null);

    // Ham xu ly khi mot file duoc chon tu UploadFile
    const handleFileSelected = (file) => {
      fileToPreview.value = file;
      ElMessage.info(`File ${file.name} đã được chọn.`);
    };

    // Ham xu ly khi file bi xoa tu UploadFile
    const handleFileCleared = () => {
      fileToPreview.value = null;
      ElMessage.info(`File đã được xóa.`);
    };

    // Ham xu ly khi file duoc tai len thanh cong tu UploadFile
    const handleFileUploaded = (file) => {
      ElMessage.success(`File ${file.name} đã được tải lên hệ thống.`);
      fileToPreview.value = null; // Xoa file sau khi tai len
    };

    return {
      fileToPreview,
      handleFileSelected,
      handleFileCleared,
      handleFileUploaded,
    };
  },
};
</script>

<style scoped>
.time-tracking-container {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  padding: 20px;
  margin: 0 auto;
  background-color: #f0f2f5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: calc(100% - 60px);
  height: calc(100vh - 60px);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

.content-wrapper {
  height: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 30px;
}
</style>
