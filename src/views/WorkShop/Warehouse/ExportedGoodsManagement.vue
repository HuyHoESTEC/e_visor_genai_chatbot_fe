<template>
  <div class="imported-goods-managment-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t("DataUploading") }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="warehouse-action-btn" :icon="UploadFilled"
            >Tải lên phiếu xuất kho</el-button
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
        <el-select
          v-model="selectedImportDate"
          placeholder="Lọc theo ngày nhập phiếu"
          clearable
          @change="applyFilters"
          class="barcode-select"
        >
          <el-option
            v-for="barcode in uniqueImportDate"
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
            <el-button type="success" size="default" @click="showDetail(row)" :icon="View" />
            <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" />
            <el-button type="danger" size="default" :icon="Delete" disabled />
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
          <el-descriptions-item label="Mã phiếu">{{ selectedItem.export_id }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhập phiếu">{{ formattedImportTime }}</el-descriptions-item>
          <el-descriptions-item label="Ngày xuất hàng">{{ formattedTime }}</el-descriptions-item>
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
    <warehouse-export-data-dialog 
      v-model="dialogVisible"
      :item-to-edit="currentItem"
      @save="saveItem"
      @close="closeDialog"
    />
    </div>
    <WarehouseExportUpload 
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
  Delete,
} from "@element-plus/icons-vue";
import { computed, nextTick, ref, watch } from "vue";
import { useLanguageStore } from "../../../stores/language";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import { useWarehouseExportDatas } from "../../../composables/Warehouse_Export/useWarehouseExportDatas";
import { useWarehouseExportAction } from "../../../composables/Warehouse_Export/useWarehouseExportAction";
import WarehouseExportUpload from "../../../components/upload/WarehouseExportUpload.vue";
import WarehouseExportDataDialog from "../../../components/dialog/WarehouseExportDataDialog.vue";
import { useBarcodeLogic } from "../../../composables/utils/useBarcodeLogic";
import { useDateFormat } from "../../../composables/utils/useDateFormat";


export default {
  name: "ExportedGoodsManagement",
  components: {
    Download,
    View,
    ArrowLeftBold,
    ArrowRightBold,
    ArrowDown,
    EditPen,
    Refresh,
    DetailPopup,
    WarehouseExportUpload,
    WarehouseExportDataDialog
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
      selectedImportDate,
      uniqueImportDate,
    } = useWarehouseExportDatas();

    const {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
    } = useWarehouseExportAction(langStore, fetchDataAndInitialize);

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

    const { barcodeRef, generatedBarcode, downloadBarcodeSvg } = useBarcodeLogic(selectedItem, isDetailVisible);
    const { formatDateTimeToDate } = useDateFormat();

    const formattedImportTime = computed(() => {
        if (selectedItem.value && selectedItem.value.export_time) {
            return formatDateTimeToDate(selectedItem.value.export_time);
        }
        return 'N/A';
    });

    const formattedTime = computed(() => {
        if (selectedItem.value && selectedItem.value.time) {
            return formatDateTimeToDate(selectedItem.value.time);
        }
        return 'N/A';
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
      generatedBarcode,
      barcodeRef,
      downloadBarcodeSvg,
      selectedImportDate,
      uniqueImportDate,
      formattedImportTime,
      formattedTime,
      Delete,
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
