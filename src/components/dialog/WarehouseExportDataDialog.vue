<template>
  <el-dialog
    v-model="internalDialogVisible"
    title="Chỉnh sửa thông tin hàng hóa đã xuất"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="taskForm" label-width="150px">
      <el-form-item label="Mã phiếu" prop="export_id">
        <el-input v-model="formData.export_id"></el-input>
      </el-form-item>
      <el-form-item label="Mã dự án" prop="project_code">
        <el-input v-model="formData.project_code"></el-input>
      </el-form-item>
      <el-form-item label="Tên hàng hóa" prop="product_name">
        <el-input v-model="formData.product_name" type="textarea" :rows="3"></el-input>
      </el-form-item>
      <el-form-item label="Mã hàng hóa" prop="part_no">
        <el-input v-model="formData.part_no"></el-input>
      </el-form-item>
      <el-form-item label="Hãng" prop="origin">
        <el-input v-model="formData.origin"></el-input>
      </el-form-item>
      <el-form-item label="Số lượng" prop="quantity">
        <el-input v-model="formData.quantity" type="number"></el-input>
      </el-form-item>
      <el-form-item label="Số Seri" prop="seri_number">
        <el-input v-model="formData.seri_number"></el-input>
      </el-form-item>
      <el-form-item label="Ngày xuất hàng" prop="time">
        <el-date-picker v-model="formData.time" type="date" placeholder="Chọn ngày xuất hàng" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Hủy</el-button>
        <el-button type="primary" @click="handleSubmit">Lưu</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'WarehouseExportDataDialog',
  props: {
    modelValue: { // Sử dụng modelValue cho v-model
      type: Boolean,
      default: false,
    },
    itemToEdit: {
      type: Object,
      default: null, // Sẽ là null khi thêm mới
    },
  },
  emits: ['update:modelValue', 'save', 'close'], // Khai báo các sự kiện emit

  setup(props, { emit }) {
    const internalDialogVisible = ref(props.modelValue);
    const formData = ref(initializeFormData(props.itemToEdit));
    const taskForm = ref(null); // Ref để truy cập form component

    // Computed property để xác định chế độ chỉnh sửa hay thêm mới
    const isEditing = computed(() => !!props.itemToEdit && props.itemToEdit.id !== '');

    // Quy tắc kiểm tra hợp lệ cho form
    const rules = {
      quantity: [
        { required: true, message: "Số lượng không được để trống", trigger: "change" },
        {
          validator: (rule, value, callback) => {
            // Convert value to number, check
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
              callback(new Error("Số giờ phải là số"));
            } else if (numericValue < 0) {
              callback(new Error("Số giờ không thể là số âm!"));
            } else {
              callback(); // Valid
            }
          },
          trigger: "blur", // Activate when users leave the input box
        },
      ],
      export_id: [
        { required: true, message: "Mã phiếu không được để trống", trigger: "change" },
      ],
      time: [
        { required: true, message: "Ngày xuất kho không được để trống", trigger: "change" },
      ],
    };

    // Theo dõi thay đổi của modelValue (v-model) từ component cha
    watch(() => props.modelValue, (newVal) => {
      internalDialogVisible.value = newVal;
      if (newVal && props.itemToEdit) {
        // Khi mở dialog và có itemToEdit, điền dữ liệu
        formData.value = JSON.parse(JSON.stringify(props.itemToEdit));
      } else if (newVal && !props.itemToEdit) {
        // Khi mở dialog để thêm mới, reset form
        formData.value = initializeFormData(null);
        if (taskForm.value) {
          taskForm.value.resetFields(); // Reset lỗi validation
        }
      }
    });

    // Theo dõi thay đổi của itemToEdit để đảm bảo form được reset/điền đúng
    watch(() => props.itemToEdit, (newVal) => {
      formData.value = initializeFormData(newVal);
      if (taskForm.value) {
        taskForm.value.clearValidate(); // Xóa lỗi validation khi taskToEdit thay đổi
      }
    });

    // Hàm khởi tạo dữ liệu form
    function initializeFormData(task) {
      return task ? { ...task } : {
        project_code: '',
        product_name: '',
        part_no: '',
        origin: '',
        quantity: '',
        seri_number: '',
        export_id: '',
        time: '',
      };
    }

    const handleSubmit = () => {
      taskForm.value.validate((valid) => {
        if (valid) {
          emit('save', formData.value, isEditing.value);
          // Không đóng dialog ở đây, để component cha quyết định
          // internalDialogVisible.value = false;
        } else {
          ElMessage.error('Vui lòng kiểm tra lại các trường bị lỗi.');
          return false;
        }
      });
    };

    const handleClose = () => {
      internalDialogVisible.value = false;
      emit('update:modelValue', false); // Cập nhật v-model ở component cha
      emit('close'); // Emit sự kiện close
      // Reset form sau khi đóng dialog để chuẩn bị cho lần mở tiếp theo
      formData.value = initializeFormData(null);
      if (taskForm.value) {
        taskForm.value.resetFields();
      }
    };

    return {
      internalDialogVisible,
      formData,
      rules,
      taskForm,
      isEditing,
      handleSubmit,
      handleClose,
    };
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
  display: block;
}
.option-input {
  width: 100%;
  margin-bottom: 8px;
}
</style>