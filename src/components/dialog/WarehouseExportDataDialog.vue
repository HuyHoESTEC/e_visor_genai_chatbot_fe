<template>
  <el-dialog
    v-model="internalDialogVisible"
    title="Chỉnh sửa thông tin hàng hóa đã xuất"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="taskForm" label-width="150px">
      <el-form-item label="Mã phiếu" prop="export_id">
        <el-input 
          v-model="formData.id"
          :disabled="true" 
          :readonly="true"
        ></el-input>
        <span style="color: red; font-size: 12px; margin-top: 0.1px; display: block;">
          Mã phiếu này không thể chỉnh sửa.
        </span>
      </el-form-item>
      <el-form-item label="Mã dự án" prop="project_code">
        <el-input v-model="formData.project_code"></el-input>
      </el-form-item>
      <el-form-item label="Mã hàng hóa" prop="part_no">
        <el-input v-model="formData.part_no"></el-input>
      </el-form-item>
      <el-form-item label="Hãng" prop="manufacturer">
        <el-input v-model="formData.manufacturer"></el-input>
      </el-form-item>
      <el-form-item label="Mô tả" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3"></el-input>
      </el-form-item>
      <el-form-item label="Số lượng" prop="quantity">
        <el-input v-model="formData.quantity" type="number" min="1"></el-input>
      </el-form-item>
      <el-form-item label="Số Seri" prop="seri_number">
        <el-input v-model="formData.seri_number"></el-input>
      </el-form-item>
      <el-form-item label="Mã tủ" prop="location">
        <el-input v-model="formData.location"></el-input>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="formData.status" placeholder="Chọn trạng thái">
            <el-option :value="0" label="Chưa lắp đặt"></el-option>
            <el-option :value="1" label="Đã lắp đặt"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="cabinet_no" prop="cabinet_no">
        <el-input 
          v-model="formData.cabinet_no"
          :disabled="true" 
          :readonly="true"
        ></el-input>
      </el-form-item>
      <el-form-item label="dt" prop="dt">
        <el-input 
          v-model="formData.dt"
          :disabled="true" 
          :readonly="true"
        ></el-input>
      </el-form-item>
      <el-form-item label="higher_lever_function" prop="higher_lever_function">
        <el-input 
          v-model="formData.higher_lever_function"
          :disabled="true" 
          :readonly="true"
        ></el-input>
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
              callback(new Error("Số lượng phải là số"));
            } else if (numericValue < 0) {
              callback(new Error("Số lượng không thể là số âm!"));
            } else {
              callback(); // Valid
            }
          },
          trigger: "blur", // Activate when users leave the input box
        },
      ],
      id: [
        { required: true, message: "Mã phiếu không được để trống", trigger: "change" },
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
        part_no: '',
        manufacturer: '',
        description: '',
        quantity: '',
        seri_number: '',
        location: '',
        status: 0,
        higher_lever_function: '',
        cabinet_no: '',
        dt: '',
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