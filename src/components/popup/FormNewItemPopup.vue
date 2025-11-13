<template>
  <el-dialog 
    v-model="newItemDialogVisible"
    :title="popupTitle"
    width="90%"
    :before-close="handleClose"
    class="custom-form-dialog"
  >
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
    
      <el-form-item :label="langStore.t('idLabel')" v-if="formData.id" class="id-item">
        <el-input :model-value="formData.id" disabled />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('locationCodeLabel')" prop="location">
            <el-input v-model="formData.location" :placeholder="langStore.t('locationCodePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('dtCodeLabel')" prop="dt">
            <el-input v-model="formData.dt" :placeholder="langStore.t('dtCodePlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('detailQuantityLabel')" prop="quantity">
            <el-input-number 
              v-model="formData.quantity" 
              :min="1" 
              controls-position="right"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('partNoCodeLabel')" prop="part_no">
            <el-input v-model="formData.part_no" :placeholder="langStore.t('partNoCodePlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('seriNumberLabel')" prop="seri_number">
            <el-input v-model="formData.seri_number" :placeholder="langStore.t('seriNumberPlaceholder')" disabled />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('manufacturerLabel')" prop="manufacturer">
            <el-input v-model="formData.manufacturer" :placeholder="langStore.t('manufacturerPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('projectCodeLabel')" prop="project_code">
            <el-input v-model="formData.project_code" :placeholder="langStore.t('projectCodePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12">
          <el-form-item :label="langStore.t('cabinetNoLabel')" prop="cabinet_no">
            <el-input v-model="formData.cabinet_no" :placeholder="langStore.t('cabinetNoPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="langStore.t('descriptionLabel')" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="4"
          :placeholder="langStore.t('descriptionPlaceholder')" 
        />
      </el-form-item>

      <el-form-item :label="langStore.t('functionLabel')" prop="higher_lever_function">
        <el-input v-model="formData.higher_lever_function" :placeholder="langStore.t('functionPlaceholder')" />
      </el-form-item>

      <el-form-item :label="langStore.t('statusLabel')" prop="status" >
        <el-select v-model="formData.status" :placeholder="langStore.t('statusPlaceholder')" style="width: 100%;" disabled>
          <el-option :label="langStore.t('statusInstalled')" :value="1"></el-option>
          <el-option :label="langStore.t('statusNotInstalled')" :value="0"></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose" size="large">{{ langStore.t('cancelButton') }}</el-button>
        <el-button type="primary" @click="submitForm" size="large">
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
        const loading = ref(false); // Đổi giá trị mặc định thành false
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
            manufacturer: [
              { required: true, message: langStore.t('manufacturerRequiredMessage'), trigger: "change" },
            ],
            higher_lever_function: [
              { required: true, message: langStore.t('higher_lever_functionRequiredMessage'), trigger: "change"},
            ],
            location: [
              { required: true, message: langStore.t('locationRequiredMessage'), trigger: "change"},
            ],
            dt: [
              { required: true, message: langStore.t('dtRequiredMessage'), trigger: "change"},
            ],
            description: [
              { required: true, message: langStore.t('descriptionRequiredMessage'), trigger: "change"},
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
        }
    }

}
</script>

<style scoped>

.section-title {
  font-size: 1.2em; 
  font-weight: 700; /* Tăng độ đậm */
  color: var(--el-color-primary); /* Sử dụng màu chủ đạo (Element Plus primary color) */
  padding: 0 10px; /* Thêm khoảng đệm nhỏ */
}

.responsive-form :deep(.el-divider--horizontal) {
    margin-top: 25px; /* Tăng khoảng cách trên */
    margin-bottom: 20px; /* Tăng khoảng cách dưới */
}

.responsive-form :deep(.el-form-item__label) {
  font-size: 1.05em; 
  font-weight: 600; /* Label đậm hơn */
  padding-bottom: 5px; /* Thêm khoảng cách giữa label và input */
}

@media (max-width: 768px) {
  .custom-form-dialog {
    width: 100% !important; 
    height: 100% !important; 
    margin: 0 !important; 
    top: 0 !important;
    left: 0 !important;
    max-height: 100vh;
    border-radius: 0; /* Bỏ border-radius */
  }
  
  .custom-form-dialog :deep(.el-dialog__title) {
  font-size: 2.2em; /* Kích thước chữ rất lớn */
  font-weight: 900; /* Rất đậm */
  color: var(--el-text-color-primary); /* Đảm bảo màu sắc nổi bật, thường là màu chữ chính */
  line-height: 1.2;
  }

  .custom-form-dialog :deep(.el-dialog__header) {
  padding: 25px 30px 15px 30px; /* Tăng padding để tiêu đề có không gian thở */
  border-bottom: 2px solid var(--el-border-color-lighter); /* Thêm đường kẻ mờ dưới tiêu đề (Tạo điểm nhấn) */
  }

  .custom-form-dialog :deep(.el-dialog__body) {
    padding: 15px;
  }
  
  .responsive-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.id-item :deep(.el-input.is-disabled .el-input__inner) {
    font-weight: bold;
    color: var(--el-text-color-primary);
    background-color: var(--el-fill-color-light); /* Màu nền nhạt để dễ phân biệt */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* Đặt nút ở bên phải */
  gap: 10px; /* Khoảng cách giữa các nút */
}
</style>