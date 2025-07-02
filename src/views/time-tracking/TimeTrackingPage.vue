<template>
  <div class="time-tracking-container">
    <div class="header-steps">
      <el-steps :active="activeWorkflowStep" finish-status="success" align-center>
        <el-step title="Tải lên File" description="Chọn các file cần xử lý"></el-step>
        <el-step
          title="Ghép nối & Phân tích"
          description="Ghép nối và xem xét cấu trúc file"
        ></el-step>
        <el-step title="Hoàn thành" description="File đầu ra đã sẵn sàng"></el-step>
      </el-steps>
    </div>
    <div class="main-content-area">
      <div v-if="activeWorkflowStep === 0" class="upload-step-content">
        <h2 class="section-title">Chọn File để tải lên</h2>
        <div class="upload-components-wrapper">
          <SingleFileUpload
            ref="singleUploadRef"
            @file-selected="handleSingleFileSelected"
            @file-cleared="handleSingleFileCleared"
          />
          <MultiFileUpload
            ref="multiUploadRef"
            @file-selected="handleMultiFileSelected"
            @file-cleared="handleMultiFileCleared"
          />
        </div>
        <div class="action-bar-upload">
          <el-button
            type="primary"
            :disabled="!canUploadFiles"
            v-on:click="uploadAllFiles"
            :loading="isUploading"
          >
            <span v-if="!isUploading">
              Tải lên tất cả file ({{ totalFilesSelected }} files)
            </span>
            <span v-else>Đang tải lên...</span>
          </el-button>
        </div>
      </div>
      <div
        v-if="activeWorkflowStep === 1"
        class="merge-steps-wrapper"
      >
        <CombineFile
          :initial-files="uploadedFilesForMerge"
          @merge-completed="handleMergeCompleted"
          @reset-workflow="resetWorkflow"
          @all-files-merged="handleAllFilesMerged"
        />
      </div>
      <div v-if="activeWorkflowStep === 2" class="completion-step-wrapper">
        <CompletionStep 
          :final-file="finalMergedFile"
          @reset-workflow="resetWorkflow"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { ElMessage, ElSteps, ElStep, ElButton } from "element-plus";
import SingleFileUpload from "../../components/upload/SingleFileUpload.vue";
import MultiFileUpload from "../../components/upload/MultiFileUpload.vue";
import CombineFile from "../../components/form/CombineFile.vue";
import axios from "axios";
import CompletionStep from "../../components/form/CompletionStep.vue";

export default {
  name: "TimeTrackingPage",
  components: {
    ElSteps,
    ElStep,
    ElButton,
    SingleFileUpload,
    MultiFileUpload,
    CombineFile,
    CompletionStep,
  },
  setup() {
    const activeWorkflowStep = ref(0); // 0: Upload, 1: Merge, 2: Complete
    // Refs cho cac component upload
    const singleUploadRef = ref(null);
    const multiUploadRef = ref(null);

    // Du lieu file duoc chon tu cac component upload
    const selectedSingleFile = ref(null);
    const selectedMultiFiles = ref([]);
    const uploadedFilesForMerge = ref(null); // Danh sach cac file se truyen cho MergeStepsPage

    const isUploading = ref(false); // Trang thai cho nut upload

    const finalMergedFile = ref(null);

    // Computed property de tinh tong so file da chon
    const totalFilesSelected = computed(() => {
      let count = 0;
      if (selectedSingleFile.value) {
        count++;
      }
      count += selectedMultiFiles.value.length;
      return count;
    });

    // Computed property de kiem tra co the upload khong
    const canUploadFiles = computed(() => {
      return totalFilesSelected.value > 0 && !isUploading.value;
    });

    const handleSingleFileSelected = (file) => {
      selectedSingleFile.value = file;
    };

    const handleSingleFileCleared = () => {
      selectedSingleFile.value = null;
    };

    const handleMultiFileSelected = (files) => {
      selectedMultiFiles.value = files;
    };

    const handleMultiFileCleared = (file) => {
      // selectedMultiFiles da tu dong cap nhat boi MultiFileUpload
    };

    // Ham upload toan bo file len server va chuyen san buoc Merge
    const uploadAllFiles = async () => {
      isUploading.value = true;
      ElMessage.info("Đang tải lên tất cả các file đã chọn...");

      const formData = new FormData();
      let filesCount = 0;

      // Lấy file từ SingleFileUpload
      if (singleUploadRef.value) {
        const file = singleUploadRef.value.getFiles();
        console.log("File từ SingleFileUpload (trước khi xử lý):", file);
        if (file) {
          formData.append('files', file); // 'files' là tên trường mà server mong đợi
          filesCount++;
        }
      }
      // Lấy file từ MultiFileUpload
      if (multiUploadRef.value) {
        const files = multiUploadRef.value.getFiles();
        console.log("File từ MultiFileUpload (trước khi xử lý):", files);
        files.forEach(file => {
          formData.append('files', file); // 'files' là tên trường mà server mong đợi
          filesCount++;
        });
      }

      if (filesCount === 0) {
        ElMessage.warning("Không có file nào để tải lên!");
        isUploading.value = false;
        return;
      }

      console.log("formData:", formData);

      try {
        console.log(`Đang gửi ${filesCount} file lên http://192.168.54.39:8000/POD_Upload...`);
        const response = await axios.post('http://192.168.54.39:8000/POD_Upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // Quan trọng cho việc gửi file
          }
        });

        // const response = await axios.get('http://192.168.54.39:8000/');
        // console.log('testsadasa', response);
        

        console.log("Phản hồi từ server:", response.data);

        if (response.data.status === "success" && Array.isArray(response.data.path_files)) {
          // Chuyển đổi path_files thành định dạng mà CombineFile mong đợi
          // CombineFile mong đợi các đối tượng có { name, id, minioObjectName }
          const processedFiles = response.data.path_files.map((filePath, index) => {
            const fileName = filePath.split('/').pop(); // Lấy tên file từ đường dẫn
            return {
              name: fileName,
              id: `uploaded_${index}_${Date.now()}`, // Tạo ID duy nhất
              minioObjectName: filePath, // Dùng path_file làm minioObjectName để truyền cho CombineFile
            };
          });

          uploadedFilesForMerge.value = processedFiles;
          ElMessage.success(`Đã tải lên thành công ${filesCount} file.`);
          activeWorkflowStep.value = 1; // Chuyển sang bước Merge & Phân tích

        } else {
          ElMessage.error(`Tải lên thất bại: ${response.data.message || 'Phản hồi không hợp lệ từ server.'}`);
        }
      } catch (error) {
        console.error("Lỗi khi tải lên file:", error.response?.data || error.message);
        ElMessage.error(
          `Có lỗi xảy ra khi tải file lên: ${error.response?.data?.message || error.message || "Không xác định"}`
        );
      } finally {
        isUploading.value = false;
      }
    };

    const handleMergeCompleted = () => {
      activeWorkflowStep.value = 2; // Chuyen sang buoc hoan thanh
      ElMessage.success("Quá trình ghép nối và xử lý file đã hoàn tất!");
    };

    const handleAllFilesMerged = (finalFileFromCombine) => {
      activeWorkflowStep.value = 2; // Chuyển sang bước "Hoàn thành"
      finalMergedFile.value = finalFileFromCombine;
      ElMessage.success("Tất cả quá trình ghép nối đã hoàn tất. File đầu ra đã sẵn sàng!");
    };

    const handleAdvanceMergeStop = (step) => {
      /**
       * Điều chỉnh activeWorkflowStep dựa trên activeStep của MergeStepsPage
       * activeStep của MergeStepsPage: 0 -> 1 -> 2
       * activeWorkflowStep của TimeTrackingPage: 0 -> 1 -> 2
       * Khi activeStep của MergeStepsPage là 0, activeWorkflowStep là 1 (vì đã qua bước upload)
       * Khi activeStep của MergeStepsPage là 1, activeWorkflowStep là 1 (vẫn trong bước Merge/Phân tích)
       * Khi activeStep của MergeStepsPage là 2, activeWorkflowStep là 2 (Hoàn thành)
       */
      if (step === 2) {
        // Nếu MergeStepsPage hoàn thành bước cuối cùng (step 2)
        activeWorkflowStep.value = 2;
      }
    };

    const resetWorkflow = () => {
      activeWorkflowStep.value = 0; // Quay lai buoc Upload
      selectedSingleFile.value = null;
      selectedMultiFiles.value = [];
      uploadedFilesForMerge.value = [];
      isUploading.value = false;
      finalMergedFile.value = null;
      // Reset cac component upload
      if (
        singleUploadRef.value &&
        typeof singleUploadRef.value.clearFiles === "function"
      ) {
        singleUploadRef.value.clearFiles();
      }
      if (multiUploadRef.value && typeof multiUploadRef.value.clearFiles === "function") {
        multiUploadRef.value.clearFiles();
      }
      ElMessage.info("Đã đặt lại quy trình. Vui lòng tải lên file mới.");
    };

    return {
      activeWorkflowStep,
      singleUploadRef,
      multiUploadRef,
      selectedSingleFile,
      selectedMultiFiles,
      uploadedFilesForMerge,
      isUploading,
      finalMergedFile,
      totalFilesSelected,
      canUploadFiles,
      handleSingleFileSelected,
      handleSingleFileCleared,
      handleMultiFileSelected,
      handleMultiFileCleared,
      uploadAllFiles,
      handleMergeCompleted,
      handleAllFilesMerged,
      handleAdvanceMergeStop,
      resetWorkflow,
    };
  },
};
</script>

<style scoped>
.time-tracking-container {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  padding: 30px;
  background-color: #f0f2f5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  /* Điều chỉnh kích thước của chính TimeTrackingPage */
  width: 100%;
  min-width: 320px; /* Chiều rộng tối thiểu để đảm bảo đọc được trên màn hình nhỏ */
  height: calc(100vh - 60px); /* Chiều cao tự động theo nội dung */
  min-height: 85vh; /* Chiều cao tối thiểu là 85% chiều cao của viewport */
  margin: 30px auto; /* Căn giữa theo chiều ngang, có khoảng cách trên dưới */
  display: flex; /* Sử dụng flexbox */
  flex-direction: column; /* Sắp xếp các phần tử con theo cột */
  /* Loại bỏ align-items: center; ở đây nếu bạn muốn nội dung chính căn lề trái */
  box-sizing: border-box; /* Đảm bảo padding không làm tăng tổng kích thước */
}

.header-steps {
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.main-content-area {
  flex-grow: 1; /* Cho phép phần nội dung chính chiếm hết không gian còn lại theo chiều dọc */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  /* Đảm bảo chiều cao tối đa không vượt quá không gian còn lại */
  overflow: auto; /* Thêm thanh cuộn nếu nội dung quá lớn */
}

.section-title {
  text-align: center;
  color: #409eff;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.upload-step-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.upload-components-wrapper {
  display: flex;
  flex-direction: row;
  gap: 30px;
  flex-grow: 1;
  margin-bottom: 30px; /* Khoảng cách với nút upload */
}

.action-bar-upload {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

.action-bar-upload .el-button {
  min-width: 250px;
  font-size: 1.2em;
  padding: 15px 25px;
}

/* Quan trọng: Điều chỉnh cho merge-steps-wrapper */
.merge-steps-wrapper {
  flex-grow: 1; /* Cho phép nó chiếm hết không gian còn lại */
  display: flex; /* Kích hoạt Flexbox để quản lý CombineFile */
  justify-content: center; /* Căn giữa CombineFile theo chiều ngang */
  align-items: flex-start; /* Căn CombineFile từ trên cùng theo chiều dọc */
  /* Đảm bảo nó không vượt quá kích thước của main-content-area */
  min-height: 0; /* Cho phép Flex item co lại nhỏ hơn nội dung của nó */
  /* Nếu CombineFile có max-width riêng, nó sẽ không bị tràn */
  width: 100%; /* Đảm bảo nó chiếm đủ chiều rộng */
}


/* Responsive adjustments */
@media (max-width: 992px) {
  .upload-components-wrapper {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .time-tracking-container {
    padding: 15px;
    margin: 15px auto;
    width: 100%;
    min-height: 90vh; /* Tăng chiều cao tối thiểu trên màn hình rất nhỏ */
    border-radius: 0;
  }
  .header-steps {
    margin-bottom: 20px;
    padding: 10px 0;
  }
  .section-title {
    font-size: 1.5em;
    margin-bottom: 20px;
  }
  .action-bar-upload .el-button {
    min-width: 100%;
    font-size: 1em;
    padding: 10px 15px;
  }
}
</style>
