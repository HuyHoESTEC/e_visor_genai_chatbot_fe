<template>
  <el-dialog 
    v-model="newItemDialogVisible"
    width="50%"
    :before-close="handleClose"
    top="5vh" >
    
    <template #header>
      <span class="centered-dialog-title">{{ popupTitle }}</span>
    </template>
    
    <el-form
      :model="formData" 
      ref="formRef" 
      label-width="auto"
      label-position="top"
      v-loading="loading"
      :rules="rules"
      size="large"
      class="responsive-form"
    >
      <el-form-item label="ID" v-if="formData.id">
        <el-input :model-value="formData.id" disabled />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Mã PO" prop="ticket_id">
            <el-input v-model="formData.ticket_id" placeholder="Nhập mã PO" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Mã dự án" prop="project_code">
            <el-input v-model="formData.project_code" placeholder="Nhập mã dự án" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Ngày nhập phiếu" prop="import_time">
            <el-date-picker
              v-model="formData.import_time"
              type="date"
              placeholder="Chọn ngày nhập phiếu"
              style="width: 100%"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Ngày nhập hàng" prop="time">
            <el-date-picker
              v-model="formData.time"
              type="date"
              placeholder="Chọn ngày nhập hàng"
              style="width: 100%"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Tên hàng hóa" prop="product_name">
            <el-input v-model="formData.product_name" placeholder="Nhập tên hàng hóa" />
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
          <el-form-item label="Hãng" prop="origin">
            <el-input v-model="formData.origin" placeholder="Nhập hãng sản phẩm" />
          </el-form-item>
        </el-col>
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
      </el-row>

      <el-form-item label="Số Seri." prop="seri_number">
        <el-input v-model="formData.seri_number" placeholder="Nhập mã số Seri." />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ langStore.t('cancelButton') }}</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? langStore.t('updateButton') : langStore.t('addNewButton') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from 'element-plus';
import { computed, ref, watch } from 'vue';
import { useLanguageStore } from "../../stores/language";
import { Edit, Plus } from '@element-plus/icons-vue';

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
        // Khởi tạo Language Store
        const langStore = useLanguageStore(); 
        
        const formRef = ref(null);
        const loading = ref(false);
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

        // Sử dụng key localization cho tiêu đề pop-up
        const popupTitle = computed(() =>
            props.isEditing ? langStore.t('editItemTitle') : langStore.t('addItemTitle')
        );
        
        const submitForm = () => {
          if (!formRef.value) return;
          formRef.value.validate((valid) => {
            console.log('valid:', valid);
            if (valid) {
                loading.value = true;
                try {
                    emit('save', formData.value); 
                } catch (e){
                    // Sử dụng key localization cho ElMessage.error
                    ElMessage.error(langStore.t('saveErrorMessage'));
                } finally {
                    loading.value = false;
                }
            } else {
                // Sử dụng key localization cho ElMessage.warning
                ElMessage.warning(langStore.t('validationErrorMessage'));
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

        // Quy tắc kiểm tra hợp lệ sử dụng key localization
        const rules = {
          quantity: [
              { required: true, message: langStore.t('quantityRequiredMessage'), trigger: "change" },
              {
                validator: (rule, value, callback) => {
                  const numericValue = Number(value);
                  if (isNaN(numericValue)) {
                    callback(new Error(langStore.t('quantityMustBeNumberMessage')));
                  } else if (numericValue < 0) {
                    callback(new Error(langStore.t('quantityCannotBeNegativeMessage')));
                  } else {
                    callback();
                  }
                },
                trigger: "blur", 
              },
            ],
            part_no: [
              { required: true, message: langStore.t('partNoRequiredMessage'), trigger: "change" },
            ],
            ticket_id: [
              { required: true, message: langStore.t('ticketIDRequiredMessage'), trigger: "change"},
            ],
            import_time: [
              { required: true, message: langStore.t('importTimeRequiredMessage'), trigger: "change"},
            ],
            origin: [
              { required: true, message: langStore.t('originRequiredMessage'), trigger: "change"},
            ],
            project_code: [
              { required: true, message: langStore.t('projectCodeRequiredMessage'), trigger: "change"},
            ],
            product_name: [
              { required: true, message: langStore.t('prodcutNameRequiredMessage'), trigger: "change"},
            ],
            seri_number: [
              { required: true, message: langStore.t('seriNumberRequiredMessage'), trigger: "change"},
            ],
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
            langStore,
            Edit,
            Plus,
        }
    }

}
</script>

<style scoped>

.el-dialog :deep(.el-dialog__header) {
  padding-top: 20px;
  padding-bottom: 10px; /* Thêm khoảng cách dưới tiêu đề */
  text-align: center; 
  border-bottom: 2px solid #ecf0f1; /* Đường gạch chân mỏng */
}

.centered-dialog-title {
  display: block; /* Đảm bảo nó chiếm đủ chiều rộng để căn giữa */
  font-size: 1.5em; /* KÍCH THƯỚC LỚN HƠN */
  font-weight: 700; /* IN ĐẬM */
  color: #2c3e50; /* Màu chữ đậm, chuyên nghiệp */
}

.el-form-item {
  margin-bottom: 20px; 
}

.el-row {
  margin-bottom: 10px; 
}

.el-form-item :deep(.el-form-item__label) {
  font-weight: 600; 
  color: #303133; 
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* Căn nút sang phải */
  gap: 10px; /* Khoảng cách giữa các nút */
  padding-top: 15px; 
  border-top: 1px solid #ebeef5; /* Đường kẻ phân tách form và footer */
  margin-top: 10px; 
}
</style>