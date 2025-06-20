<template>
  <div v-if="show" class="progress-bar-container">
    <h3>Tiến độ tải lên</h3>
    <div class="progress-wrapper">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <p class="progress-text">{{ progress }}% - {{ status }}</p>
    <el-button
      v-if="status === 'Đang tải lên...'"
      type="warning"
      size="small"
      @click="cancelUpload"
      >Hủy</el-button
    >
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "ProgressBar",
  props: {
    progress: {
      // Phần trăm tiến độ (0-100)
      type: Number,
      default: 0,
    },
    status: {
      // Trạng thái tải lên (ví dụ: "Đang tải lên...", "Thành công", "Lỗi")
      type: String,
      default: "",
    },
    show: {
      // Quyết định có hiển thị thanh tiến độ không
      type: Boolean,
      default: false,
    },
  },
  emits: ["cancel-upload"], // Phát sự kiện khi người dùng hủy tải lên
  setup(props, { emit }) {
    const internalProgress = ref(props.progress);
    const internalStatus = ref(props.status);

    watch(
      () => props.progress,
      (newVal) => {
        internalProgress.value = newVal;
      }
    );

    watch(
      () => props.status,
      (newVal) => {
        internalStatus.value = newVal;
      }
    );

    const cancelUpload = () => {
      emit("cancel-upload");
    };

    return {
      internalProgress,
      internalStatus,
      cancelUpload,
    };
  },
};
</script>

<style scoped>
.progress-bar-container {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
  text-align: center;
  width: 100%; /* Chiếm toàn bộ chiều rộng có sẵn */
  box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước */
}

h3 {
  color: #409eff;
  margin-bottom: 15px;
  font-weight: 500;
}

.progress-wrapper {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar {
  height: 20px;
  background-color: #409eff;
  width: 0%; /* Chiều rộng ban đầu */
  transition: width 0.3s ease-in-out; /* Hiệu ứng chuyển động mượt mà */
  border-radius: 5px;
}

.progress-text {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}
</style>
