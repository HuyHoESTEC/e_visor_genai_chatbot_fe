<template>
  <detail-popup
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="langStore.t('productGroupDetailTitle')"
  >
    <div v-if="item">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="langStore.t('detailPartNoLabel')">{{
          item.part_no
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailHigherLeverFunction')">{{
          item.higher_lever_function
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailProjectCodeLabel')">{{
          item.project_code
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailManufacturerLabel')">{{
          item.manufacturer
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailDescriptionLabel')">{{
          item.description
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailQuantityLabel')">{{
          item.quantity
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailSeriNumberLabel')">{{
          item.seri_number
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailLocationLabel')">{{
          item.location
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailDT')">{{
          item.dt
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailHeaderCabinetNo')">{{
          item.cabinet_no
        }}</el-descriptions-item>
        <el-descriptions-item :label="langStore.t('detailStatusLabel')">{{
          statusFormatter(null, null, item.status, null)
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="barcode-area">
        <h4 class="barcode-label">{{ langStore.t("barcodeLabel") }}</h4>
        <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
          <el-button
            type="primary"
            size="small"
            :icon="Download"
            :disabled="generatedBarcode === 'N/A'"
            @click="downloadBarcodeSvg"
          >
            {{ langStore.t("downloadSvgButton") }}
          </el-button>
          <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
            <svg ref="barcodeRef"></svg>
          </div>
        </div>
        <p v-else class="barcode-value-error">{{ langStore.t("barcodeError") }}</p>
      </div>
    </div>
  </detail-popup>
</template>

<script>
import { Download } from "@element-plus/icons-vue";
import DetailPopup from "./DetailPopup.vue";
import { useLanguageStore } from "../../stores/language";
import { computed, toRefs } from "vue";
import { useBarcodeLogic } from "../../composables/utils/useBarcodeLogic";
import { useDateFormat } from "../../composables/utils/useDateFormat";

export default {
  name: "InstallationDetailPopup",
  components: {
    DetailPopup,
    Download,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup(props) {
    const langStore = useLanguageStore();
    const { item, modelValue } = toRefs(props);

    const { barcodeRef, generatedBarcode, downloadBarcodeSvg } = useBarcodeLogic(
      item,
      modelValue
    );
    const { formatDateTimeToDate } = useDateFormat();
    const formattedTime = computed(() => {
      if (item.value && item.value.time) {
        return formatDateTimeToDate(item.value.time);
      }
      return "N/A";
    });

    const getInstallationStatusName = (statusValue) => {
      if (statusValue === 0) {
        return "Đã lắp đặt";
      }

      if (statusValue === 1) {
        return "Chưa lắp đặt";
      }

      return "Không xác định";
    };

    const statusFormatter = (row, column, cellValue, index) => {
      return getInstallationStatusName(cellValue);
    };

    return {
      // --- Variables ---
      langStore,
      Download,
      barcodeRef,
      generatedBarcode,
      downloadBarcodeSvg,
      // --- Functions ---
      formattedTime,
      getInstallationStatusName,
      statusFormatter,
    };
  },
};
</script>

<style scoped>
.barcode-area {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f4f4f5;
  text-align: center;
}

.barcode-label {
  margin-top: 0;
  margin-bottom: 5px;
  font-weight: bold;
  color: #606266;
}

.barcode-value {
  font-size: 1.5em; /* Kích thước lớn hơn cho mã */
  font-family: monospace; /* Sử dụng font cố định để mô phỏng mã */
  font-weight: 700;
  color: #303133;
  word-break: break-all; /* Đảm bảo mã dài không tràn */
}
.barcode-area {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f4f4f5;
  text-align: center; /* Căn giữa nội dung, bao gồm barcode SVG */
}

.barcode-label {
  margin-top: 0;
  margin-bottom: 10px;
  font-weight: bold;
  color: #606266;
}

.actual-barcode-image {
  display: block; /* Quan trọng để căn giữa SVG */
  margin: 0 auto;
  max-width: 90%;
  height: auto;
}

.barcode-value-error {
  color: #f56c6c;
  font-style: italic;
}
</style>
