<template>
  <el-dialog
    v-model="internalDialogVisible"
    :title="isEditing ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="taskForm" label-width="150px">
      <el-form-item label="Người thực hiện" prop="full_name">
        <el-select v-model="formData.full_name" placeholder="Chọn người thực hiện" style="width: 100%;">
          <el-option
            v-for="user in assignerList"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          ></el-option>
          <template #footer>
            <el-button v-if="!isAdding" text bg size="small" v-on:click="onAddOption">
              Thêm người thực hiện mới
            </el-button>
            <template v-else>
              <el-input
                v-model="optionName"
                class="option-input"
                placeholder="Nhập tên người thực hiện"
                size="small"
              />
              <el-button type="primary" size="small" v-on:click="onConfirm">
                Thêm
              </el-button>
              <el-button size="small" v-on:click="clearAction">Hủy</el-button>
            </template>
          </template>
        </el-select>
      </el-form-item>
      <el-form-item label="Mô tả" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3"></el-input>
      </el-form-item>
      <el-form-item label="Mã dự án" prop="project_code">
        <el-input v-model="formData.project_code"></el-input>
      </el-form-item>

      <el-form-item label="Ngày bắt đầu" prop="start_date">
        <el-date-picker
          v-model="formData.start_date"
          type="date"
          placeholder="Chọn ngày bắt đầu"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="Ngày kết thúc" prop="end_date">
        <el-date-picker
          v-model="formData.end_date"
          type="date"
          placeholder="Chọn ngày kết thúc"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="Số giờ" prop="QTY">
        <el-input 
          v-model="formData.QTY"
          type="number"
          placeholder="Nhập số giờ làm việc"
          :min="0"
          :max="20"
        />
      </el-form-item>

      <el-form-item label="Khu vực" prop="site">
        <el-select v-model="formData.site" placeholder="Chọn khu vực làm việc" style="width: 100%;">
          <el-option
            v-for="site in sites"
            :key="site.value"
            :label="site.label"
            :value="site.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="formData.status" placeholder="Chọn trạng thái" style="width: 100%;">
          <el-option
            v-for="status in statuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          ></el-option>
        </el-select>
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
  name: 'TaskFormDialog',
  props: {
    modelValue: { // Sử dụng modelValue cho v-model
      type: Boolean,
      default: false,
    },
    taskToEdit: {
      type: Object,
      default: null, // Sẽ là null khi thêm mới
    },
    users: { // Danh sách người dùng để hiển thị trong select
      type: Array,
      default: () => [],
    },
    statuses: { // Danh sách trạng thái để hiển thị trong select
      type: Array,
      default: () => [],
    },
    sites: {
      type: Array,
      default: () => []
    },
  },
  emits: ['update:modelValue', 'save', 'close'], // Khai báo các sự kiện emit

  setup(props, { emit }) {
    const internalDialogVisible = ref(props.modelValue);
    const formData = ref(initializeFormData(props.taskToEdit));
    const taskForm = ref(null); // Ref để truy cập form component

    // Computed property để xác định chế độ chỉnh sửa hay thêm mới
    const isEditing = computed(() => !!props.taskToEdit && props.taskToEdit.task_id !== '');

    const isAdding = ref(false);
    const optionName = ref('');
    const addedUser = ref([]);
    const assignerList = computed(() => {
      return [...props.users, ...addedUser.value];
    });
    
    const onAddOption = () => {
      isAdding.value = true;
    };

    const onConfirm = () => {
      if (optionName.value) {
        addedUser.value.push({
          id: optionName.value,
          name: optionName.value,
        })
        
        clearAction();
      }
    };

    const clearAction = () => {
      optionName.value = '';
      isAdding.value = false;
    };

    // Quy tắc kiểm tra hợp lệ cho form
    const rules = {
      task_id: [
        { required: true, message: 'Mã công việc không được để trống', trigger: 'blur' },
        { min: 1, message: 'Mã công việc phải có ít nhất 1 ký tự', trigger: 'blur' },
      ],
      description: [
        { required: true, message: 'Mô tả không được để trống', trigger: 'blur' },
      ],
      full_name: [
        { required: true, message: 'Người thực hiện không được để trống', trigger: 'change' },
      ],
      project_code: [
        { required: true, message: 'Mã dự án không được để trống', trigger: 'blur' },
      ],
      start_date: [
        { required: true, message: 'Ngày bắt đầu không được để trống', trigger: 'change' },
      ],
      end_date: [
        { required: true, message: 'Ngày kết thúc không được để trống', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            if (value && formData.value.start_date && new Date(value) < new Date(formData.value.start_date)) {
              callback(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
            } else {
              callback();
            }
          },
          trigger: 'change',
        },
      ],
      QTY: [
        { required: true, message: 'Số lượng không được để trống', trigger: 'change' },
        {
          validator: (rule, value, callback) => {
            // Convert value to number, check
            const numericValue = Number(value);
            if (isNaN(numericValue)) {
              callback(new Error('Số giờ phải là số'));
            } else if (numericValue < 0) {
              callback(new Error('Số giờ không thể là số âm!'));
            } else {
              callback(); // Valid
            }
          },
          trigger: 'blur' // Activate when users leave the input box
        }
      ],
      site: [
        { required: true, message: 'Khu vực làm việc không được để trống', trigger: 'change' },
      ],
      status: [
        { required: true, message: 'Trạng thái không được để trống', trigger: 'change' },
      ],
    };

    // Theo dõi thay đổi của modelValue (v-model) từ component cha
    watch(() => props.modelValue, (newVal) => {
      internalDialogVisible.value = newVal;
      if (newVal && props.taskToEdit) {
        // Khi mở dialog và có taskToEdit, điền dữ liệu
        formData.value = JSON.parse(JSON.stringify(props.taskToEdit));
      } else if (newVal && !props.taskToEdit) {
        // Khi mở dialog để thêm mới, reset form
        formData.value = initializeFormData(null);
        if (taskForm.value) {
          taskForm.value.resetFields(); // Reset lỗi validation
        }
      }
    });

    // Theo dõi thay đổi của taskToEdit để đảm bảo form được reset/điền đúng
    watch(() => props.taskToEdit, (newVal) => {
      formData.value = initializeFormData(newVal);
      if (taskForm.value) {
        taskForm.value.clearValidate(); // Xóa lỗi validation khi taskToEdit thay đổi
      }
    });


    // Hàm khởi tạo dữ liệu form
    function initializeFormData(task) {
      return task ? { ...task } : {
        task_id: '',
        full_name: '',
        project_code: '',
        description: '',
        start_date: '',
        end_date: '',
        QTY: 0,
        status: 'Chờ xử lý',
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
      isAdding,
      optionName,
      addedUser,
      assignerList,
      onAddOption,
      onConfirm,
      clearAction,
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