<template>
  <div class="work-management-wrapper">
    <form @submit.prevent="handleSubmit" class="job-step-form">
      <h3>{{ editingStepId ? "Chỉnh sửa" : "Thêm" }} công đoạn</h3>
      <div class="form-group">
        <label for="stepName">Tên công đoạn:</label>
        <input type="text" id="stepName" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label for="worker">Người làm:</label>
        <input type="text" id="worker" v-model="form.worker" required />
      </div>
      <div class="form-group">
        <label for="startDate">Ngày bắt đầu:</label>
        <input type="date" id="startDate" v-model="form.startDate" required />
      </div>
      <div class="form-group">
        <label for="endDate">Ngày kết thúc:</label>
        <input type="date" id="endDate" v-model="form.endDate" required />
      </div>
      <button type="submit">{{ editingStepId ? "Cập nhật" : "Thêm" }}</button>
      <button type="button" v-on:click="emitCancel" class="cancel-btn">Hủy</button>
    </form>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "CreateProdutionOrdersProjects",
  props: {
    editingStepId: {
      type: String,
      default: null,
    },
    initialData: {
      type: Object,
      default: null,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const form = ref({
      name: "",
      worker: "",
      startDate: "",
      endDate: "",
    });

    const resetForm = () => {
      form.value = {
        name: "",
        worker: "",
        startDate: "",
        endDate: "",
      };
    };

    const handleSubmit = () => {
      const newStep = {
        id:
          props.editingStepId ||
          `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      emit('submit', newStep);
      resetForm();
    };

    const emitCancel = () => {
        resetForm();
        emit('cancel');
    };

    watch(
      () => props.initialData,
      (newVal) => {
        if (newVal) {
          form.value = { ...newVal };
        } else {
          resetForm();
        }
      },
      { immediate: true }
    );

    return {
      form,
      resetForm,
      handleSubmit,
      emitCancel,
    };
  },
};
</script>

<style scoped>
.work-management-wrapper {
  display: flex;
  height: calc(100vh - 60px);
  color: var(--text-color); /* Sử dụng biến màu chữ chính */
  background-color: white;
}

.job-step-form {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.job-step-form h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="date"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

.job-step-form button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  margin-right: 10px;
}

.job-step-form button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.job-step-form button[type="submit"]:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #5a6268;
}
</style>
