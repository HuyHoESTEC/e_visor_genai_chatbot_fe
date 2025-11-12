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
      :rules = "rules"
    >
      <el-form-item :label="langStore.t('idLabel')" v-if="formData.id">
        <el-input :model-value="formData.id" disabled />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="langStore.t('locationCodeLabel')" prop="location">
            <el-input v-model="formData.location" :placeholder="langStore.t('locationCodePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="langStore.t('dtCodeLabel')" prop="dt">
            <el-input v-model="formData.dt" :placeholder="langStore.t('dtCodePlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="langStore.t('detailQuantityLabel')" prop="quantity">
            <el-input-number 
              v-model="formData.quantity" 
              :min="1" 
              controls-position="right"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="langStore.t('partNoCodeLabel')" prop="part_no">
            <el-input v-model="formData.part_no" :placeholder="langStore.t('partNoCodePlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="langStore.t('seriNumberLabel')" prop="seri_number">
            <el-input v-model="formData.seri_number" :placeholder="langStore.t('seriNumberPlaceholder')" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="langStore.t('manufacturerLabel')" prop="manufacturer">
            <el-input v-model="formData.manufacturer" :placeholder="langStore.t('manufacturerPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="langStore.t('projectCodeLabel')" prop="project_code">
            <el-input v-model="formData.project_code" :placeholder="langStore.t('projectCodePlaceholder')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="langStore.t('cabinetNoLabel')" prop="cabinet_no">
            <el-input v-model="formData.cabinet_no" :placeholder="langStore.t('cabinetNoPlaceholder')" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item :label="langStore.t('descriptionLabel')" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="2" 
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
            langStore, // Đảm bảo langStore được trả về để template sử dụng
        }
    }

}
</script>

<style scoped>
</style>