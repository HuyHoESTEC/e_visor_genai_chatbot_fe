<template>
  <div class="imported-goods-managment-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t("DataUploading") }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="warehouse-action-btn" :icon="UploadFilled"
            >Tải lên phiếu nhập kho</el-button
          >
          <el-button type="danger" :icon="Printer" disabled />
          <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh"></el-button>
        </div>
        <el-select
          v-model="selectedProductCode"
          placeholder="Lọc theo mã code sản phẩm"
          clearable
          @change="applyFilters"
          class="barcode-select"
        >
          <el-option
            v-for="barcode in uniqueProductCode"
            :key="barcode.id"
            :label="barcode.name"
            :value="barcode.id"
          />
        </el-select>
        <el-select
          v-model="selectedSeriNumber"
          placeholder="Lọc theo số seri sản phẩm"
          clearable
          @change="applyFilters"
          class="barcode-select"
        >
          <el-option
            v-for="barcode in uniqueSeriNumber"
            :key="barcode.id"
            :label="barcode.name"
            :value="barcode.id"
          />
        </el-select>
      </div>
      <el-table
        :data="paginatedItems"
        border
        style="width: 100%; height: 100%"
        stripe
        class="items-table"
      >
        <template #empty>
            <div v-if="emptyData" class="empty-data-message">
                <el-empty description="No Data" />
            </div>
        </template>
        <el-table-column fixed prop="id" label="ID" width="80" sortable />
        <el-table-column prop="project_code" label="Mã dự án" width="auto" />
        <el-table-column prop="product_name" label="Tên hàng hóa" width="auto" />
        <el-table-column prop="part_no" label="Mã hàng hóa" width="auto" />
        <el-table-column prop="origin" label="Hãng" width="auto" />
        <el-table-column prop="quantity" label="Số lượng" width="auto" />
        <el-table-column prop="seri_number" label="Seri No." width="auto" />
        <el-table-column fixed="right" label="Hành động" min-width="auto">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="showDetail(row)" :icon="View">
              {{ langStore.t("DetailAct") }}
            </el-button>
            <el-button type="primary" size="small" @click="editItem(row)" :icon="EditPen">{{
              langStore.t("EditAct")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="filteredItems.length"
        :page-sizes="[5, 10, 20, 50, 100]"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination-controls"
      >
      </el-pagination>
      <detail-popup v-model="isDetailVisible" title="Chi tiết hàng hóa">
      <div v-if="selectedItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedItem.id }}</el-descriptions-item>
          <el-descriptions-item label="Mã phiếu">{{ selectedItem.import_id }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhập phiếu">{{ selectedItem.import_time }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhập hàng">{{ selectedItem.time }}</el-descriptions-item>
          <el-descriptions-item label="Mã dự án">{{ selectedItem.project_code }}</el-descriptions-item>
          <el-descriptions-item label="Tên hàng hóa">{{ selectedItem.product_name }}</el-descriptions-item>
          <el-descriptions-item label="Mã hàng hóa">{{ selectedItem.part_no }}</el-descriptions-item>
          <el-descriptions-item label="Hãng">{{ selectedItem.origin }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{ selectedItem.quantity }}</el-descriptions-item>
          <el-descriptions-item label="Số Seri">{{ selectedItem.seri_number }}</el-descriptions-item>
        </el-descriptions>
        <div class="barcode-area">
            <h4 class="barcode-label">Mã Barcode:</h4>
            <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
                <el-button 
                    type="primary" 
                    size="small" 
                    :icon="Download" 
                    :disabled="generatedBarcode === 'N/A'"
                    @click="downloadBarcodeSvg"
                >
                    Tải về SVG
                </el-button>
                <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
                    <svg ref="barcodeRef"></svg> 
                </div>
            </div>
            <p v-else class="barcode-value-error">Không có thông tin Part No. hoặc Seri No. để tạo Barcode.</p>
        </div>
      </div>
    </detail-popup>
    <warehouse-import-data-dialog 
      v-model="dialogVisible"
      :item-to-edit="currentItem"
      @save="saveItem"
      @close="closeDialog"
    />
    </div>
    <WarehouseImportUpload 
        v-model="uploadDialogVisible"
        @uploadSuccess="handleUploadSuccess"
    />
  </div>
</template>

<script>
import {
  Download,
  View,
  ArrowLeftBold,
  ArrowRightBold,
  ArrowDown,
  UploadFilled,
  Printer,
  EditPen,
  Refresh,
} from "@element-plus/icons-vue";
import { computed, nextTick, ref, watch } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseImportDatas } from "../../../composables/Warehouse_Import/useWarehouseImportDatas";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import WarehouseImportUpload from "../../../components/upload/WarehouseImportUpload.vue";
import WarehouseImportDataDialog from "../../../components/dialog/WarehouseImportDataDialog.vue";
import { useWarehouseImportAction } from "../../../composables/Warehouse_Import/useWarehouseImportAction";
import JsBarcode from "jsbarcode";

export default {
  name: "ImportedGoodsManagement",
  components: {
    Download,
    View,
    ArrowLeftBold,
    ArrowRightBold,
    ArrowDown,
    EditPen,
    Refresh,
    DetailPopup,
    WarehouseImportUpload,
    WarehouseImportDataDialog
  },
  setup() {
    const langStore = useLanguageStore();
    const {
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      paginatedItems,
      selectedProductCode,
      selectedSeriNumber,
      uniqueProductCode,
      uniqueSeriNumber,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
    } = useWarehouseImportDatas();

    const {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
    } = useWarehouseImportAction(langStore, fetchDataAndInitialize);

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);

    const editedItem = ref({});

    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    }

    const handleFormSubmit = () => {
      console.log('Send request success');
      
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
    };

    // Reactive variable to control display dialog upload
    const uploadDialogVisible = ref(false);
    // Function to open dialog upload file
    const handleUploadFile = () => {
      uploadDialogVisible.value = true;
    };
    const handleUploadSuccess = () => {
      // Callback fetch data function to update new data table
      fetchDataAndInitialize();
    };

    const refreshData = () => {
      fetchDataAndInitialize();
    };

    const barcodeRef = ref(null);

    const generateBarcode = (partNo, seriNumber) => {
        if (partNo && seriNumber) {
            return `${partNo}+${seriNumber}`;
        }
        return 'N/A';
    };

    const generatedBarcode = computed(() => {
        if (selectedItem.value) {
            const partNoClean = selectedItem.value.part_no ? String(selectedItem.value.part_no).replace(/[^0-9A-Z]/g, '') : '';
            const seriNumberClean = selectedItem.value.seri_number ? String(selectedItem.value.seri_number).replace(/[^0-9A-Z]/g, '') : '';

            return generateBarcode(partNoClean, seriNumberClean);
        }
        return 'N/A';
    });

    const renderBarcode = (code) => {
        if (code && code !== 'N/A' && barcodeRef.value) {
            try {
                JsBarcode(barcodeRef.value, code, {
                    format: "CODE128",
                    displayValue: true,
                    width: 2,
                    height: 100,
                    margin: 10
                });
            } catch (e) {
                console.error("Lỗi khi render JsBarcode:", e);
            }
        }
    };

    const downloadBarcodeSvg = () => {
        // 1. Kiểm tra xem mã barcode có hợp lệ và đã được render chưa
        if (!generatedBarcode.value || generatedBarcode.value === 'M/A') {
            console.warn("Không thể tải về. Barcode không hợp lệ hoặc chưa được render.");
            return;
        }
        // 2. Lấy phần tử SVG
        const svgElement = barcodeRef.value;
        if (!svgElement) {
            console.error("Không tìm thấy phần tử SVG để tải về.");
            return;
        }
        // 3. Chuyển SVG DOM element thành chuỗi XML
        const svgData = new XMLSerializer().serializeToString(svgElement);
        // 4. Tạo URL data URI
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        // 5. Tạo thẻ <a> ẩn để kích hoạt tải về
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        // Đặt tên file (ví dụ: part_no-seri_number.svg)
        const fileName = `${generatedBarcode.value}.svg`;
        downloadLink.download = fileName;
        // 6. Kích hoạt tải về và dọn dẹp
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    }

    watch([isDetailVisible, generatedBarcode], ([isDetail, barcodeValue]) => {
        if (isDetail && barcodeValue && barcodeValue!== 'N/A') {
            nextTick(() => {
                renderBarcode(barcodeValue);
            });
        }
    });

    return {
      Download,
      View,
      ArrowLeftBold,
      ArrowRightBold,
      ArrowDown,
      Printer,
      UploadFilled,
      EditPen,
      Refresh,
      langStore,
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      paginatedItems,
      selectedProductCode,
      selectedSeriNumber,
      uniqueProductCode,
      uniqueSeriNumber,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
      isDetailVisible,
      selectedItem,
      editedItem,
      showDetail,
      handleFormSubmit,
      handleCurrentChange,
      handleSizeChange,
      uploadDialogVisible,
      handleUploadFile,
      handleUploadSuccess,
      refreshData,
      dialogVisible,
      currentItem,
      editItem,
      saveItem,
      closeDialog,
      generateBarcode,
      generatedBarcode,
      renderBarcode,
      barcodeRef,
      downloadBarcodeSvg,
    };
  },
};
</script>

<style>
.imported-goods-managment-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  background-color: #f9f9f9;
  flex-direction: column;
  overflow: scroll;
  overflow-x: hidden;
}
.header-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}
.filter-section {
  margin-bottom: 20px;
}
.filter-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.content-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
.pagination-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}
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
