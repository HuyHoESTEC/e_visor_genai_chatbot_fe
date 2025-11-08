<template>
    <el-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        title="Tùy chọn tải file"
        width="500px"
        center
        :close-on-click-model="false"
    >
        <el-form :model="filterData" label-width="120px">
            <el-form-item label="Mã dự án">
                <el-input v-model="filterData.project_code" placeholder="Nhập mã dự án..." clearable />
            </el-form-item>
            <el-form-item label="Mã tủ">
                <el-input v-model="filterData.cabinet_no" placeholder="Nhập mã tủ..." clearable />
            </el-form-item>
        </el-form>

        <div style="text-align: center; margin-top: 20px;">
            <el-button
                type="primary"
                :icon="Download"
                :loading="isPreparing"
                v-on:click="handleDownload"
            >
                {{ isPreparing ? 'Đang tạo đường dẫn...' : 'Lấy đường dẫn tài liệu' }}
            </el-button>
        </div>

        <el-alert
            v-if="downloadUrl"
            title="Link tải đã sẵn sàng!"
            type="success"
            center
            show-icon
            style="margin-top: 20px;"
        >
            <p>File: <span style="font-weight: bold;">{{ fileName }}</span></p>
            <p>URL: <a :href="downloadUrl" target="_blank" style="word-break: break-all;">{{ downloadUrl }}</a></p>
            <el-button
                type="success"
                :icon="Download"
                v-on:click="$emit('confirmDownload')"
                style="margin-top: 10px;"
            >
                Tải tài liệu
            </el-button>
        </el-alert>
    </el-dialog>
</template>

<script>
import { Download } from '@element-plus/icons-vue';
import { ref, watch } from 'vue';

export default {
    name: 'DownloadFilterDialog',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        downloadUrl: String,
        fileName: String,
        isPreparing: Boolean,
    },
    emits: ['update:modelValue', 'confirmDownload', 'createDownloadLink'],
    setup(props, {emit}) {
        const filterData = ref({
            project_code: '',
            cabinet_no: '',
        });

        // Reset form while dialog close/open
        watch(() => props.modelValue, (newVal) => {
            if (!newVal) {
                // Reset form while close
                filterData.value = {
                    project_code: '',
                    cabinet_no: '',
                };
            }
        });

        const handleDownload = () =>{
            // Emit event with filterData to parent component call API
            emit('createDownloadLink', filterData.value);
        }

        return {
            Download,
            filterData,
            handleDownload,
        }
    }
}
</script>