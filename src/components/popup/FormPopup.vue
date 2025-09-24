<template>
    <el-dialog
        :model-value="modelValue"
        :title="title"
        width="60%"
        :before-close="handleClose"
        destroy-on-close
    >
        <slot></slot>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="danger" v-on:click="handleClose">Hủy</el-button>
                <el-button type="primary" v-on:click="handleSubmit">Lưu</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
export default {
    name: 'FormPopup',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Chỉnh sửa'
        }
    },
    emits: ['update:modelValue', 'submit'],
    setup(props, { emit }) {
        const handleClose = () => {
            emit('update:modelValue', false);
        };

        const handleSubmit = () => {
            emit('submit');
        };

        return {
            handleClose,
            handleSubmit,
        }
    }
}
</script>