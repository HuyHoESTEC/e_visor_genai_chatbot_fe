<template>
  <div class="file-preview-container">
    <h2>File Review</h2>
    <div v-if="currentFileContent" class="file-preview-content">
      <iframe v-if="isPdf" :src="currentFileContent" width="100%" height="500px"></iframe>
      <div v-else-if="isTextFile">
        <pre>{{ currentFileContent }}</pre>
      </div>
      <p v-else>Không thể xem trước loại file này một cách trực tiếp.</p>
    </div>
    <p v-else class="no-file-message">Chưa có file nào được chọn để xem trước.</p>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";

export default {
  name: "FileReview",
  props: {
    file: {
      type: File,
      default: null,
    },
  },
  setup(props) {
    const currentFileContent = ref(null);
    const isPdf = ref(false);
    const isTextFile = ref(false);
    let objectUrl = null; // Bien de luu URL doi tuong cho PDF

    // Ham de xoa xem truoc va giai phong URL doi tuong
    const clearPreview = () => {
      currentFileContent.value = null;
      isPdf.value = false;
      isTextFile.value = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl); // Giải phóng URL đối tượng để tránh rò rỉ bộ nhớ
        objectUrl = null;
      }
    };

    // Watch for changes in the 'file' prop
    watch(
      () => props.file,
      (newFile) => {
        // Clear previous preview state and URL
        clearPreview();

        if (newFile) {
          if (newFile.type === "application/pdf") {
            isPdf.value = true;
            objectUrl = URL.createObjectURL(newFile); // Tao URL doi tuong
            currentFileContent.value = objectUrl;
          } else if (newFile.type.startsWith("text/")) {
            isTextFile.value = true;
            const reader = new FileReader();
            reader.onload = (e) => {
              currentFileContent.value = e.target.result;
            };
            reader.readAsText(newFile);
          }
        }
      },
      { immediate: true }
    ); // Chay ngay khi component duoc mount

    // Giai phong URL doi tuong khi component bi huy
    onMounted(() => {
      clearPreview();
    });

    return {
      currentFileContent,
      isPdf,
      isTextFile,
      clearPreview,
    };
  },
};
</script>

<style lang="css">
.file-preview-container {
  background-color: var(--siements_web_functional_gray);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
}

h2 {
  color: #409eff;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  font-weight: 500;
}

.file-preview-content {
  border: 1px dashed #dcdfe6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 15px;
  border-radius: 4px;
  overflow: hidden;
  height: calc(100% - 120px);
}

.file-preview-content iframe {
  border: none;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.file-preview-content pre {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 480px;
  overflow-y: auto;
  width: 100%;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  border: 1px solid #eee;
  color: #333;
}

.no-file-message {
  text-align: center;
  color: #909399;
  margin-top: 20px;
  font-style: italic;
}
</style>
