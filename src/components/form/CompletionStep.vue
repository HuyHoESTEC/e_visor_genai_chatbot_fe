<template>
  <div class="completion-step-content">
    <h2 class="section-title">Quá trình hoàn tất!</h2>
    <div class="completion-details">
      <p class="completion-message">
        File XLSX kết quả của bạn đã sẵn sàng để tải xuống.
      </p>
      <div v-if="finalFile" class="file-download-info">
        <el-icon><DocumentChecked /></el-icon> 
        <span class="file-name">Tên file: <strong>{{ finalFile.name }}</strong></span>
        <el-button
          type="success"
          icon="el-icon-download"
          class="download-button"
          @click="downloadFinalFile"
          :loading="isDownloading"
        >
          <span v-if="!isDownloading">Tải xuống File</span>
          <span v-else>Đang tải...</span>
        </el-button>
      </div>
      <div v-else class="no-file-info">
        <p>Không tìm thấy thông tin file kết quả.</p>
      </div>
      <el-button type="info" @click="emitResetWorkflow" class="reset-button">
        Bắt đầu lại quy trình
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onUnmounted } from 'vue'; // Import ref và onUnmounted
import { ElMessage, ElButton } from 'element-plus';
import { DocumentChecked } from '@element-plus/icons-vue'; 
import axios from 'axios'; // Import axios để tạo AbortController
import { getDownloadUrlApi } from '../../services/apiServices';

export default defineComponent({
  name: 'CompletionStep',
  components: {
    ElButton,
    DocumentChecked,
  },
  props: {
    finalFile: {
      type: Object,
      default: null,
    },
  },
  emits: ['reset-workflow'],

  setup(props, { emit }) {
    const isDownloading = ref(false); // Trạng thái loading cho nút tải xuống
    let abortController = null; // Để quản lý việc hủy request API

    const downloadFinalFile = async () => {
      if (!props.finalFile || !props.finalFile.minioObjectName) {
        ElMessage.error("Không có file nào để tải xuống!");
        return;
      }

      isDownloading.value = true; // Bắt đầu trạng thái tải xuống
      abortController = new AbortController(); // Tạo một AbortController mới

      try {
        // Payload bạn cần gửi tới API để lấy URL tải xuống
        // Dựa trên hàm getDownloadUrlApi của bạn, có vẻ như payload cần một object
        // với 'file_path' là minioObjectName.
        const payload = {
          request_id: "evisor-1234567890",
          user_id: "hoanvlh",
          file_path: props.finalFile.minioObjectName
        };

        // Gọi API để lấy URL tải xuống
        const downloadUrl = await getDownloadUrlApi(payload, abortController.signal);

        if (downloadUrl) {
          // Tạo một thẻ 'a' ẩn để kích hoạt tải xuống
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', props.finalFile.name); // Đặt tên file khi tải về
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          ElMessage.success(`Đang tải xuống file "${props.finalFile.name}"...`);
        } else {
          ElMessage.error("Không nhận được URL tải xuống hợp lệ từ server.");
        }
      } catch (error) {
        console.error("Lỗi khi tải xuống file:", error);
        // Kiểm tra nếu lỗi là do request bị hủy bởi AbortController
        if (axios.isCancel(error)) {
          ElMessage.info("Yêu cầu tải xuống đã bị hủy.");
        } else {
          ElMessage.error(`Có lỗi xảy ra khi tải xuống file: ${error.message || 'Lỗi không xác định.'}`);
        }
      } finally {
        isDownloading.value = false; // Kết thúc trạng thái tải xuống
        abortController = null; // Xóa controller sau khi hoàn thành hoặc lỗi
      }
    };

    const emitResetWorkflow = () => {
      emit('reset-workflow');
    };

    // Hủy bỏ request API nếu component bị unmount trong quá trình tải
    onUnmounted(() => {
      if (abortController) {
        abortController.abort();
      }
    });

    return {
      downloadFinalFile,
      emitResetWorkflow,
      isDownloading, // Trả về trạng thái loading
    };
  },
});
</script>

<style scoped>
/* CSS giữ nguyên như bạn đã cung cấp */
.completion-step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 40px 20px;
  text-align: center;
  background-color: #f9fbfd;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.section-title {
  text-align: center;
  color: #409eff;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
  width: 100%;
}

.completion-details {
  margin-top: 20px;
  padding: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.completion-message {
  font-size: 1.1em;
  color: #606266;
  margin-bottom: 15px;
}

.file-download-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  padding: 15px 20px;
  border-radius: 8px;
  width: fit-content;
  max-width: 90%;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.file-download-info .el-icon {
  font-size: 2em;
  color: #67c23a;
}

.file-download-info .file-name {
  font-size: 1.1em;
  color: #303133;
  word-break: break-word;
}

.download-button {
  margin-left: 20px;
  font-size: 1.05em;
  padding: 10px 20px;
}

.no-file-info {
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 20px;
}

.reset-button {
  margin-top: 20px;
  padding: 12px 25px;
  font-size: 1.1em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .completion-details {
    padding: 20px;
  }
  .file-download-info {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  .download-button {
    margin-left: 0;
    width: 100%;
  }
}
</style>