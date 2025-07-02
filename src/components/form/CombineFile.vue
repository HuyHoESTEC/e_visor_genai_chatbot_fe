<template>
  <div class="merge-steps-container">
    <h2>Ghép File</h2>

    <div class="merge-mode-selection">
      <span class="mode-label">Chế độ ghép nối:</span>
      <el-switch
        v-model="isAutoMergeMode"
        active-text="Tự động"
        inactive-text="Thủ công"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;"
      />
    </div>

    <div v-if="showMergeProgressBar" class="progress-bar-section merge-progress">
      <h3>Đang xử lý ghép nối file...</h3>
      <div class="progress-wrapper">
        <div class="progress-bar" :style="{ width: mergeProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ mergeProgress }}% - {{ mergeStatusText }}</p>
      <el-button v-if="isMerging" type="warning" size="small" @click="cancelMergeProcess">Hủy ghép nối</el-button>
    </div>

    <div class="main-content-with-tracking">
      <div class="main-content">
        <div v-if="!showMergeProgressBar && availableFilesToDisplay.length > 0 && !isAutoMergeMode" class="available-files-summary">
          <p>Các file có sẵn để ghép nối:</p>
          <ul>
            <li v-for="(file, index) in availableFilesToDisplay" :key="file.id || index">
              <strong>{{ file.name }}</strong>
            </li>
          </ul>
        </div>
        <p v-else-if="!showMergeProgressBar && !isAutoMergeMode">Không có file nào để ghép nối.</p>

        <div v-if="!showMergeProgressBar" class="step-content">
          <p v-if="availableFilesToDisplay.length === 0 && !mergeResultFile && !isAutoMergeMode">
            Không có file nào để ghép nối. Vui lòng quay lại bước tải file.
          </p>
          <p v-else-if="availableFilesToDisplay.length === 1 && !mergeResultFile && !isAutoMergeMode">
            Chỉ còn một file. Bạn cần ít nhất hai file để ghép nối.
          </p>
          <p v-else-if="!isAutoMergeMode">
            Chọn các file từ danh sách để tiến hành ghép nối thủ công.
          </p>
          <p v-else>
            Chế độ Tự động sẽ ghép nối tất cả các file có sẵn.
          </p>

          <div class="file-selection-merge" :class="{ 'auto-mode-disabled-selection': isAutoMergeMode }">
            <div v-if="mergeResultFile && !isAutoMergeMode" class="merged-file-display">
              <span>File tổng hiện tại: <strong style="word-wrap: break-word">{{ mergeResultFile.minioObjectName }}</strong></span>
            </div>

            <el-select
              v-model="selectedFile1"
              placeholder="Chọn File 1 để merge"
              class="file-select"
              clearable
              :disabled="isAutoMergeMode"
            >
              <el-option
                v-for="file in filesForSelection1"
                :key="file.id || file.name"
                :label="file.name"
                :value="file.id"
                :disabled="selectedFile2 === file.id"
              ></el-option>
            </el-select>

            <el-select
              v-model="selectedFile2"
              placeholder="Chọn File 2 để merge"
              class="file-select"
              clearable
              :disabled="!!mergeResultFile || isAutoMergeMode"
            >
              <el-option
                v-for="file in filesForSelection2"
                :key="file.id || file.name"
                :label="file.name"
                :value="file.id"
                :disabled="selectedFile1 === file.id || (mergeResultFile && file.id !== mergeResultFile.id)"
              ></el-option>
            </el-select>

            <el-button
              type="success"
              :disabled="!canPerformMerge || isMerging || (isAutoMergeMode && currentFiles.length < 2)"
              @click="isAutoMergeMode ? performAutoMerge() : performMerge()"
              class="step-button"
            >
              {{ isMerging ? "Đang ghép nối..." : (isAutoMergeMode ? "Tự động ghép nối" : "Ghép nối ngay") }}
            </el-button>
          </div>

          <el-button
            type="danger"
            @click="resetMergeProcess"
            class="step-button"
            style="margin-top: 20px"
          >
            Bắt đầu lại (Xóa file tổng & quay lại bước tải file)
          </el-button>
        </div>
      </div>

      <div class="tracking-area">
        <h3>Bảng theo dõi</h3>
        <div v-if="errorMessages.length === 0" class="no-errors">
          Không có lỗi nào phát sinh trong quá trình ghép nối.
        </div>
        <ul v-else class="error-list">
          <li v-for="(error, index) in errorMessages" :key="index" :class="error.type">
            <strong>{{ error.timestamp }}:</strong> <p style="word-wrap: break-word;">{{ error.message }}</p>
          </li>
        </ul>
        <el-button
          v-if="errorMessages.length > 0"
          type="info"
          size="small"
          @click="clearErrorMessages"
          class="clear-errors-button"
        >
          Xóa thông báo lỗi
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ElButton, ElSelect, ElOption, ElMessage, ElSwitch } from "element-plus";
import { ref, computed, watch } from "vue";
import axios from "axios";

export default {
  name: "CombineFile",
  components: {
    ElButton,
    ElSelect,
    ElOption,
    ElSwitch,
  },
  props: {
    initialFiles: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["merge-completed", "reset-workflow", "all-file-merged"],
  setup(props, { emit }) {
    const currentFiles = ref([]);
    const selectedFile1 = ref(null);
    const selectedFile2 = ref(null);
    const mergeResultFile = ref(null);

    const isMerging = ref(false);
    const mergeStatusMessage = ref(null);
    const mergeStatusType = ref(null);

    // --- Biến trạng thái cho Progress Bar API Merge ---
    const showMergeProgressBar = ref(false);
    const mergeProgress = ref(0);
    const mergeStatusText = ref("");
    let mergeInterval = null;
    let abortController = null;
    // --- End Biến trạng thái ---

    // --- Biến trạng thái cho Auto/Manual Mode ---
    const isAutoMergeMode = ref(false);
    // --- End Biến trạng thái ---

    // --- Biến trạng thái cho Tracking Lỗi ---
    const errorMessages = ref([]);
    // --- End Biến trạng thái ---

    // Hàm thêm lỗi vào Tracking Area
    const addError = (message, type = "error") => {
      errorMessages.value.push({
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
      });
      // Giới hạn số lượng lỗi để tránh tràn bộ nhớ
      if (errorMessages.value.length > 50) {
        errorMessages.value.shift(); // Xóa lỗi cũ nhất
      }
    };

    // Hàm xóa tất cả lỗi
    const clearErrorMessages = () => {
      errorMessages.value = [];
    };

    // Watcher cho initialFiles: Reset khi có files mới từ component cha
    watch(
      () => props.initialFiles,
      (newVal) => {
        if (newVal && newVal.length > 0) {
          currentFiles.value = [...newVal];
          mergeResultFile.value = null;
          selectedFile1.value = null;
          selectedFile2.value = null;
          ElMessage.info("File mới đã sẵn sàng để ghép nối.");
          clearErrorMessages(); // Xóa lỗi cũ khi có file mới
        } else {
          currentFiles.value = [];
          mergeResultFile.value = null;
          selectedFile1.value = null;
          selectedFile2.value = null;
          clearErrorMessages(); // Xóa lỗi cũ
        }
      },
      { immediate: true, deep: true }
    );

    // Watcher cho isAutoMergeMode: Reset lựa chọn file khi đổi chế độ
    watch(isAutoMergeMode, (newMode) => {
      if (newMode) {
        selectedFile1.value = null;
        selectedFile2.value = null;
      } else {
        // Khi chuyển sang manual, nếu có file tổng, tự động chọn nó vào selectedFile2
        if (mergeResultFile.value) {
          selectedFile2.value = mergeResultFile.value.id;
        }
      }
    });

    // Computed: Danh sách file để hiển thị trong summary và cho các dropdown
    const availableFilesToDisplay = computed(() => {
      // Chỉ hiển thị các file chưa phải là file kết quả merge
      return currentFiles.value.filter((file) => !file.isMergedResult);
    });

    // Computed: Danh sách file có thể chọn cho dropdown File 1 (chế độ Manual)
    const filesForSelection1 = computed(() => {
      if (mergeResultFile.value) {
        // Nếu đã có file tổng, người dùng chỉ chọn file chưa merge để ghép với file tổng
        return currentFiles.value.filter((file) => file.id !== mergeResultFile.value.id);
      }
      // Lần merge đầu tiên, hiển thị tất cả các file chưa phải là kết quả merge
      return availableFilesToDisplay.value;
    });

    // Computed: Danh sách file có thể chọn cho dropdown File 2 (chế độ Manual)
    const filesForSelection2 = computed(() => {
      if (mergeResultFile.value) {
        // Nếu đã có file tổng, file tổng luôn là file thứ 2
        return [mergeResultFile.value];
      }
      // Lần merge đầu tiên, hiển thị tất cả các file chưa phải là kết quả merge
      return availableFilesToDisplay.value;
    });

    // Computed: Kiểm tra xem có thể thực hiện merge không (cho cả Auto và Manual)
    const canPerformMerge = computed(() => {
      if (isMerging.value) return false;

      if (isAutoMergeMode.value) {
        // Chế độ Auto: cần ít nhất 2 file để ghép nối
        return currentFiles.value.length >= 2;
      } else {
        // Chế độ Manual
        if (mergeResultFile.value) {
          // Đã có file tổng: cần chọn File 1 (file mới) và File 2 phải là file tổng
          return (
            selectedFile1.value !== null &&
            selectedFile2.value === mergeResultFile.value.id
          );
        }
        // Lần merge đầu tiên: cần chọn 2 file khác nhau và không rỗng
        return (
          selectedFile1.value !== null &&
          selectedFile2.value !== null &&
          selectedFile1.value !== selectedFile2.value
        );
      }
    });

    // Hàm gọi API ghép nối file (cho chế độ Manual)
    const performMerge = async () => {
      isMerging.value = true;
      showMergeProgressBar.value = true;
      mergeProgress.value = 0;
      mergeStatusText.value = "Đang chuẩn bị ghép nối...";
      mergeStatusMessage.value = {
        type: "info",
        message: "Đang tiến hành ghép nối thủ công...",
      };
      addError("Bắt đầu ghép nối thủ công...", "info");

      abortController = new AbortController();
      const signal = abortController.signal;

      const file1Obj = currentFiles.value.find((f) => f.id === selectedFile1.value);
      const file2Obj = currentFiles.value.find((f) => f.id === selectedFile2.value);

      if (!file1Obj || !file2Obj) {
        ElMessage.error("Vui lòng chọn đủ 2 file để ghép nối.");
        addError("Lỗi: Không tìm thấy file đã chọn.", "error");
        isMerging.value = false;
        showMergeProgressBar.value = false;
        return;
      }

      // Giả lập tiến trình upload
      let progress = 0;
      mergeInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 3; // Tăng ngẫu nhiên
        if (progress >= 95) {
          progress = 95;
          clearInterval(mergeInterval);
        }
        mergeProgress.value = progress;
        if (progress < 30) {
          mergeStatusText.value = "Đang gửi yêu cầu đến server...";
        } else if (progress < 70) {
          mergeStatusText.value = `Server đang xử lý ghép nối ${file1Obj.name} và ${file2Obj.name}...`;
        } else {
          mergeStatusText.value = "Gần hoàn tất...";
        }
      }, 300);

      try {
        const payload = {
          request_id: "evisor-1234567890",
          user_id: "hoanvlh",
          start_time: new Date().toISOString(),
          path_files: [
            file1Obj.minioObjectName,
            file2Obj.minioObjectName
          ]
          // Có thể thêm các tham số khác nếu API yêu cầu
        };

        // Thay thế 'YOUR_MERGE_API_ENDPOINT' bằng endpoint API thực tế của bạn
        const response = await axios.post("http://192.168.54.39:8000/POD_TimeTracker", payload, {
          signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearInterval(mergeInterval);
        mergeProgress.value = 100;
        mergeStatusText.value = "Hoàn tất!";

        const mergedFileData = response;
        console.log("mergedFileData:", response);
        

        // Kiểm tra xem API có trả về đủ thông tin không
        if (!mergedFileData || !mergedFileData.data.output) {
          throw new Error("Dữ liệu trả về từ API không hợp lệ.");
        }

        const newMergedFile = {
          id:
            mergedFileData.id ||
            `merged_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          minioObjectName: mergedFileData.data.output,
          isMergedResult: true, // Đánh dấu đây là file kết quả của quá trình merge
        };
        mergeResultFile.value = newMergedFile;
        
        // Cập nhật currentFiles: loại bỏ các file đã dùng và thêm file mới
        const filesAfterRemoval = currentFiles.value.filter(
          (f) => f.id !== file1Obj.id && f.id !== file2Obj.id
        );
        currentFiles.value = [...filesAfterRemoval, newMergedFile];

        selectedFile1.value = null; // Reset file được chọn để tiếp tục ghép nối
        selectedFile2.value = mergeResultFile.value.id; // Tự động chọn file tổng làm file thứ 2

        mergeStatusMessage.value = {
          type: "success",
          message: `Ghép nối thành công! File "${newMergedFile.minioObjectName}" đã sẵn sàng.`,
        };
        ElMessage.success(mergeStatusMessage.value.message);
        addError(`Ghép nối thành công: ${newMergedFile.minioObjectName}`, "success");
        emit("merge-completed", newMergedFile);

        setTimeout(() => {
          showMergeProgressBar.value = false;
        }, 1000);
      } catch (error) {
        clearInterval(mergeInterval);
        mergeProgress.value = 0;
        showMergeProgressBar.value = false;

        if (axios.isCancel(error)) {
          console.log("Yêu cầu ghép nối thủ công đã bị hủy bỏ:", error.message);
          mergeStatusText.value = "Đã hủy ghép nối.";
          mergeStatusMessage.value = {
            type: "warning",
            message: "Quá trình ghép nối đã bị hủy.",
          };
          ElMessage.warning("Quá trình ghép nối đã bị hủy.");
          addError("Quá trình ghép nối thủ công đã bị hủy.", "warning");
        } else {
          console.error("Lỗi khi gọi API ghép nối thủ công:", error);
          mergeStatusText.value = "Lỗi!";
          const errorMessage =
            error.response?.data?.message || error.message || "Không xác định";
          mergeStatusMessage.value = {
            type: "error",
            message: `Lỗi ghép nối: ${errorMessage}`,
          };
          ElMessage.error(mergeStatusMessage.value.message);
          addError(`Lỗi ghép nối thủ công: ${errorMessage}`, "error");
        }
      } finally {
        isMerging.value = false;
        abortController = null;
      }
    };

    // Hàm gọi API ghép nối file (cho chế độ Auto)
    const performAutoMerge = async () => {
      isMerging.value = true;
      showMergeProgressBar.value = true;
      mergeProgress.value = 0;
      mergeStatusText.value = "Đang bắt đầu ghép nối tự động...";
      mergeStatusMessage.value = {
        type: "info",
        message: "Đang tiến hành ghép nối tự động tất cả các file...",
      };
      addError("Bắt đầu ghép nối tự động...", "info");

      // Lấy tất cả các minioObjectName của các file hiện có
      const allFileObjectsToMerge = currentFiles.value.map(file => file.minioObjectName);

      if (allFileObjectsToMerge.length < 2) {
        ElMessage.warning("Không đủ file để tự động ghép nối (cần ít nhất 2 file).");
        addError("Lỗi: Không đủ file để tự động ghép nối.", "warning");
        isMerging.value = false;
        showMergeProgressBar.value = false;
        return;
      }

      abortController = new AbortController();
      const signal = abortController.signal;

      // Giả lập tiến trình chung
      let progress = 0;
      clearInterval(mergeInterval); // Xóa interval cũ nếu có
      mergeInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 3;
        if (progress >= 95) {
          progress = 95;
          clearInterval(mergeInterval);
        }
        mergeProgress.value = progress;
        if (progress < 30) {
          mergeStatusText.value = "Đang gửi tất cả file đến server...";
        } else if (progress < 70) {
          mergeStatusText.value = `Server đang xử lý ghép nối ${allFileObjectsToMerge.length} file...`;
        } else {
          mergeStatusText.value = "Gần hoàn tất quá trình tự động...";
        }
      }, 300);

      try {
        const payload = {
          request_id: "evisor-auto-merge-" + Date.now(), // ID request duy nhất
          user_id: "hoanvlh",
          start_time: new Date().toISOString(),
          path_files: allFileObjectsToMerge // Gửi TẤT CẢ các đường dẫn file
        };

        // GỌI API MERGE MỘT LẦN VỚI TẤT CẢ CÁC FILE
        const response = await axios.post("http://192.168.54.39:8000/POD_TimeTracker", payload, {
          signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearInterval(mergeInterval);
        mergeProgress.value = 100;
        mergeStatusText.value = "Hoàn tất ghép nối tự động!";

        const mergedFileData = response.data;

        if (!mergedFileData || !mergedFileData.output) {
          throw new Error("Dữ liệu trả về từ API không hợp lệ cho ghép nối tự động.");
        }

        const newMergedFile = {
          id: `merged_final_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          minioObjectName: mergedFileData.output,
          name: mergedFileData.output.split('/').pop(), // Lấy tên file từ path_object
          isMergedResult: true,
        };

        mergeResultFile.value = newMergedFile;
        currentFiles.value = [newMergedFile]; // Chỉ còn lại file tổng cuối cùng
        
        selectedFile1.value = null; 
        selectedFile2.value = null; // Reset các lựa chọn file thủ công

        ElMessage.success(
          `Tất cả ${allFileObjectsToMerge.length} file đã được tự động ghép nối thành công!`
        );
        mergeStatusMessage.value = {
          type: "success",
          message: "Tất cả file đã được ghép nối tự động thành công!",
        };
        addError("Tất cả file đã được ghép nối tự động thành công!", "success");
        emit("merge-completed", newMergedFile); // Emit file cuối cùng
        emit("all-file-merged"); // Có thể emit một sự kiện riêng cho chế độ tự động hoàn tất

        setTimeout(() => {
          showMergeProgressBar.value = false;
        }, 1000);

      } catch (error) {
        clearInterval(mergeInterval);
        mergeProgress.value = 0;
        showMergeProgressBar.value = false;

        if (axios.isCancel(error)) {
          console.log("Yêu cầu ghép nối tự động đã bị hủy bỏ:", error.message);
          mergeStatusText.value = "Đã hủy ghép nối tự động.";
          mergeStatusMessage.value = {
            type: "warning",
            message: "Quá trình ghép nối tự động đã bị hủy.",
          };
          ElMessage.warning("Quá trình ghép nối tự động đã bị hủy.");
          addError("Quá trình ghép nối tự động đã bị hủy.", "warning");
        } else {
          console.error("Lỗi khi gọi API ghép nối tự động:", error);
          mergeStatusText.value = "Lỗi!";
          const errorMessage =
            error.response?.data?.message || error.message || "Không xác định";
          mergeStatusMessage.value = {
            type: "error",
            message: `Lỗi ghép nối tự động: ${errorMessage}`,
          };
          ElMessage.error(mergeStatusMessage.value.message);
          addError(`Lỗi ghép nối tự động: ${errorMessage}`, "error");
        }
      } finally {
        isMerging.value = false;
        abortController = null;
      }
    };

    const cancelMergeProcess = () => {
      if (abortController) {
        abortController.abort();
      }
      clearInterval(mergeInterval);
      isMerging.value = false;
      showMergeProgressBar.value = false;
      mergeProgress.value = 0;
      mergeStatusText.value = "Đã hủy ghép nối.";
      mergeStatusMessage.value = {
        type: "warning",
        message: "Quá trình ghép nối đã bị hủy.",
      };
      ElMessage.warning("Quá trình ghép nối đã bị hủy.");
      addError("Quá trình ghép nối đã bị hủy bởi người dùng.", "warning");
    };

    const resetMergeProcess = () => {
      cancelMergeProcess(); // Dừng mọi quá trình đang chạy
      mergeResultFile.value = null;
      selectedFile1.value = null;
      selectedFile2.value = null;
      mergeStatusMessage.value = null;
      mergeStatusType.value = null;
      errorMessages.value = []; // Xóa tất cả lỗi khi reset
      currentFiles.value = [...props.initialFiles];
      ElMessage.info("Đã đặt lại quá trình ghép nối. Vui lòng chọn file mới.");
      emit("reset-workflow");
    };

    return {
      currentFiles,
      selectedFile1,
      selectedFile2,
      mergeResultFile,
      filesForSelection1,
      filesForSelection2,
      availableFilesToDisplay, // Export mới
      canPerformMerge,
      isMerging,
      mergeStatusMessage,
      mergeStatusType,
      performMerge,
      performAutoMerge, // Export hàm mới
      resetMergeProcess,

      showMergeProgressBar,
      mergeProgress,
      mergeStatusText,
      cancelMergeProcess,

      isAutoMergeMode, // Export biến toggle
      errorMessages, // Export lỗi
      clearErrorMessages, // Export hàm xóa lỗi
    };
  },
};
</script>

<style>
.merge-steps-container {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  width: 100%;
  text-align: center;
}

h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
  font-weight: 600;
  font-size: 2em;
  text-align: left; /* Đặt lại căn lề trái cho tiêu đề */
}

/* Các phần tử như merge-mode-selection, progress-bar-section, available-files-summary
   và step-content có thể giữ nguyên hoặc điều chỉnh text-align: left nếu cần */
.merge-mode-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  gap: 15px;
  padding: 15px 20px;
  background-color: #f0f8ff;
  border: 1px solid #cceeff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.merge-mode-selection .mode-label {
  font-weight: 600;
  color: #333;
  font-size: 1.1em;
}

.progress-bar-section {
  background-color: #e9f5ff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #a0cfff;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-section h3 {
  color: #1a73e8;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
  font-weight: 500;
}

.progress-wrapper {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  height: 25px;
}

.progress-bar {
  height: 100%;
  background-color: #409eff;
  width: 0%;
  transition: width 0.4s ease-in-out;
  border-radius: 5px;
}

.progress-text {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}

/* --- ĐIỀU CHỈNH CHÍNH CHO BỐ CỤC BÊN PHẢI --- */
.main-content-with-tracking {
  display: flex; /* Kích hoạt Flexbox */
  gap: 30px; /* Khoảng cách giữa nội dung chính và tracking */
  align-items: flex-start; /* Căn chỉnh các item con từ trên xuống */
  margin-top: 30px; /* Khoảng cách với phần tử phía trên */
}

.main-content {
  flex: 1; /* Cho phép phần nội dung chính chiếm hết không gian còn lại */
  text-align: left; /* Đảm bảo nội dung bên trong main-content được căn lề trái */
}

.available-files-summary {
  margin-bottom: 25px;
  text-align: left;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 15px;
  background-color: #fefefe;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.available-files-summary p {
  font-size: 16px;
  color: #606266;
  margin-top: 0;
  margin-bottom: 12px;
  font-weight: 500;
}

.available-files-summary ul {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
  max-height: 120px;
  overflow-y: auto;
  border-top: 1px dashed #ebeef5;
  padding-top: 10px;
}

.available-files-summary ul li {
  padding: 5px 0;
  font-size: 14px;
  color: #303133;
}

.step-content {
  margin-top: 30px;
  padding: 25px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #ffffff;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start; /* Căn chỉnh nội dung của step-content sang trái */
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.step-content p {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
}

.file-selection-merge {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 450px;
  margin-bottom: 15px;
}

.file-selection-merge.auto-mode-disabled-selection .el-select,
.file-selection-merge.auto-mode-disabled-selection .merged-file-display {
  opacity: 0.6;
  pointer-events: none;
}

.file-select {
  width: 100%;
}

.merged-file-display {
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 15px;
  color: #2e7d32;
  font-weight: 600;
  margin-bottom: 5px;
  text-align: center;
}

.step-button {
  margin: 5px;
  min-width: 180px;
  font-size: 1.1em;
  padding: 12px 20px;
}

.merge-status {
  margin-top: 10px;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  text-align: center;
  font-weight: 500;
}

.merge-status.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.merge-status.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.merge-status.info {
  background-color: #edf2fc;
  color: #909399;
  border: 1px solid #e9e9eb;
}

.merge-status.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

/* --- Styles cho Tracking Area (đặt bên phải) --- */
.tracking-area {
  flex-shrink: 0; /* Đảm bảo khu vực này không bị co lại khi không gian hẹp */
  width: 350px; /* Đặt chiều rộng cố định cho khu vực tracking */
  padding: 25px;
  background-color: #fefefe;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: left; /* Đảm bảo nội dung tracking căn lề trái */
  flex: 1;
}

.tracking-area h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
  font-weight: 600;
  font-size: 1.5em;
  text-align: center; /* Căn giữa tiêu đề của tracking */
}

.tracking-area .no-errors {
  color: #909399;
  text-align: center;
  font-style: italic;
  padding: 10px;
}

.tracking-area .error-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px; /* Tăng chiều cao tối đa cho danh sách lỗi */
  overflow-y: auto; /* Thêm thanh cuộn nếu danh sách quá dài */
  border: 1px solid #ebeef5;
  border-radius: 5px;
  background-color: #fff;
}

.tracking-area .error-list li {
  padding: 10px 15px;
  border-bottom: 1px dashed #f0f2f5;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.tracking-area .error-list li:last-child {
  border-bottom: none;
}

.tracking-area .error-list li.error {
  color: #f56c6c;
  background-color: #fef0f0;
}

.tracking-area .error-list li.warning {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.tracking-area .error-list li.info {
  color: #909399;
  background-color: #edf2fc;
}

.tracking-area .error-list li.success {
  color: #67c23a;
  background-color: #f0f9eb;
}

.tracking-area .clear-errors-button {
  margin-top: 20px;
  width: 100%; /* Nút xóa lỗi sẽ kéo dài hết chiều rộng của tracking area */
}

/* Điều chỉnh Responsive */
@media (max-width: 1200px) {
  .merge-steps-container {
    max-width: 95%; /* Tăng chiều rộng trên màn hình nhỏ hơn */
  }
  .main-content-with-tracking {
    flex-direction: column; /* Chuyển sang bố cục cột trên màn hình nhỏ */
    gap: 20px;
  }
  .tracking-area {
    width: 100%; /* Tracking area chiếm toàn bộ chiều rộng */
    margin-top: 20px; /* Thêm khoảng cách nếu chuyển xuống dưới */
  }
}

@media (max-width: 768px) {
  .merge-steps-container {
    padding: 15px;
    margin: 15px auto;
  }
  h2 {
    font-size: 1.6em;
    margin-bottom: 20px;
  }
  .merge-mode-selection {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  .merge-mode-selection .mode-label {
    font-size: 1em;
  }
  .progress-bar-section {
    padding: 15px;
    margin-bottom: 20px;
  }
  .progress-bar-section h3 {
    font-size: 1.1em;
  }
  .available-files-summary {
    padding: 10px;
    margin-bottom: 20px;
  }
  .available-files-summary p {
    font-size: 15px;
  }
  .step-content {
    padding: 15px;
    min-height: 150px;
    gap: 15px;
  }
  .step-content p {
    font-size: 14px;
  }
  .file-selection-merge {
    max-width: 100%;
  }
  .step-button {
    min-width: 100%;
    font-size: 1em;
    padding: 10px 15px;
  }
  .merge-status {
    padding: 8px 12px;
    font-size: 13px;
  }
  .tracking-area {
    margin-top: 30px;
    padding: 15px;
  }
  .tracking-area h3 {
    font-size: 1.3em;
    margin-bottom: 15px;
  }
  .tracking-area .error-list li {
    padding: 8px 10px;
    font-size: 13px;
  }
}
</style>
