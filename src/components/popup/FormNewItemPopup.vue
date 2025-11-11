<template>
  <el-dialog 
    v-model="newItemDialogVisible"
    :title="popupTitle"
    width="50%"
    :before-close="handleClose"
  >
    <el-form 
      :model="formData" 
      ref="formRef" 
      label-width="150px"
      v-loading="loading"
       :rules = rules
    >
      <el-form-item label="ID" v-if="formData.id">
        <el-input :model-value="formData.id" disabled />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Mã tủ" prop="location">
            <el-input v-model="formData.location" placeholder="Nhập mã tủ" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="DT" prop="dt">
            <el-input v-model="formData.dt" placeholder="Nhập mã DT" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Số lượng" prop="quantity">
            <el-input-number 
              v-model="formData.quantity" 
              :min="1" 
              controls-position="right"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Mã sản phẩm" prop="part_no">
            <el-input v-model="formData.part_no" placeholder="Nhập mã sản phẩm" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Số seri" prop="seri_number">
            <el-input v-model="formData.seri_number" placeholder="Nhập số seri" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Hãng" prop="manufacturer">
            <el-input v-model="formData.manufacturer" placeholder="Nhập hãng sản phẩm" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Mã dự án" prop="project_code">
            <el-input v-model="formData.project_code" placeholder="Nhập mã dự án" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Mã dãy" prop="cabinet_no">
            <el-input v-model="formData.cabinet_no" placeholder="Nhập mã dãy" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="Mô tả" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="2" 
          placeholder="Nhập mô tả sản phẩm" 
        />
      </el-form-item>

      <el-form-item label="Function" prop="higher_lever_function">
        <el-input v-model="formData.higher_lever_function" placeholder="Nhập mã Function" />
      </el-form-item>

      <el-form-item label="Trạng thái" prop="status" >
        <el-select v-model="formData.status" placeholder="Chọn trạng thái" style="width: 100%;" disabled>
          <el-option label="Đã lắp đặt" :value="1"></el-option>
          <el-option label="Chưa lắp đặt" :value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Hủy</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';

export default {
    name: "FormNewItemPopup",
    props: {
        modelValue: {
          type: Boolean,
          default: false
        },
        currentItem: {
            type: Object,
            default: null,
        },
        isEditing: {
            type: Boolean,
            default: false,
        }
    },
    emits: ['update:modelValue', 'save', 'close'],
    setup(props, { emit }) {
        const formRef = ref(null);
        const loading = ref(null);
        const newItemDialogVisible = ref(props.modelValue);
        const formData = ref({});

        watch(() => props.modelValue, (newVal) => {
          newItemDialogVisible.value = newVal;
        });
        
        watch(() => props.currentItem, (newItem) => {
            if(newItem) {
                formData.value = { ...newItem };
            } else {
                formData.value = {
                  quantity: 1,
                  status: 0,
                };
            }
        }, { immediate: true });

        const popupTitle = computed(() =>
            props.isEditing ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm mới'
        );
        
        const submitForm = () => {
    if (!formRef.value) return;
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            try {
                emit('save', formData.value); 
            } catch (e){
                ElMessage.error("Đã xảy ra lỗi khi lưu.");
            } finally {
                loading.value = false;
            }
        } else {
            ElMessage.warning("Vui lòng điền đầy đủ và đúng thông tin yêu cầu.");
            return false;
        }
    });
};
        
        const handleClose = () => {
            newItemDialogVisible.value = false;
            emit('update:modelValue', false);
            emit('close');
            if (formRef.value) {
                formRef.value.resetFields();
            }
        };

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
        part_no: [
          { required: true, message: "Mã hàng hóa không được để trống", trigger: "change" },
        ],
        manufacturer: [
          { required: true, message: "Hãng không được để trống", trigger: "change" },
        ]
      };

        return {
            popupTitle,
            submitForm,
            handleClose,
            newItemDialogVisible,
            formData,
            loading,
            formRef,
            rules,
        }
    }

}
</script>

<style scoped>
</style>