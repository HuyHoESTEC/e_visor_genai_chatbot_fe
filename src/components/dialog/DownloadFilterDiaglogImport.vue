<template>
    <el-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        :title="langstore.t('DownloadOptionsTitle')"
        width="500px"
        center
        :close-on-click-model="false"
    >
        <el-form :model="filterData" label-width="120px">
            <el-form-item :label="langstore.t('tableHeaderProjectCode')">
                <el-input v-model="filterData.project_code" :placeholder="langstore.t('InputProjectCodePlaceholder')" clearable />
            </el-form-item>
            <el-form-item :label="langstore.t('detailPOLabel')">
                <el-input v-model="filterData.ticket_id" :placeholder="langstore.t('InputPOPlaceholder')" clearable />
            </el-form-item>
        </el-form>

        <div style="text-align: center; margin-top: 20px;">
            <el-button
                type="primary"
                :icon="Download"
                :loading="isPreparing"
                v-on:click="handleDownload"
            >
                {{ isPreparing ? langstore.t('PreparingDownloadLink') : langstore.t('GetDownloadLinkButton') }}
            </el-button>
        </div>

        <el-alert
            v-if="downloadUrl"
            :title="langstore.t('DownloadLinkReadyTitle')"
            type="success"
            center
            show-icon
            style="margin-top: 20px;"
        >
            <p>{{ langstore.t('FileLabel') }}<span style="font-weight: bold;">{{ fileName }}</span></p>
            <p>URL: <a :href="downloadUrl" target="_blank" style="word-break: break-all;">{{ downloadUrl }}</a></p>
            <el-button
                type="success"
                :icon="Download"
                v-on:click="$emit('confirmDownload')"
                style="margin-top: 10px;"
            >
                {{ langstore.t('DownloadDocumentButton') }}
            </el-button>
        </el-alert>
    </el-dialog>
</template>

<script>
import { Download } from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
import { useLanguageStore } from '../../stores/language';

export default {
    name: 'DownloadFilterDialogImport',
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
            ticket_id: '',
        });

        const langStore = useLanguageStore();
        // Reset form while dialog close/open
        watch(() => props.modelValue, (newVal) => {
            if (!newVal) {
                // Reset form while close
                filterData.value = {
                    project_code: '',
                    ticket_id: '',
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
            langstore: langStore
        }
    }
}
</script>