<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="70%"
    :before-close="handleClose"
  >
    <slot></slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-on:click="handleClose">{{ langStore.t("CloseBtn") }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { useLanguageStore } from "../../stores/language";

export default {
  name: "DetailPopup",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
        type: String,
        default: 'Chi tiết'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const langStore = useLanguageStore();
    const handleClose = () => {
        emit('update:modelValue', false);
    }

    return {
      langStore,
      handleClose,
    };
  },
};
</script>
