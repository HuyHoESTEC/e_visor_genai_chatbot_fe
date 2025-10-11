<template>
  <div class="warehouse_management_container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t('DataUploading') }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" class="warehouse-action-btn" :icon="UploadFilled" v-on:click="handleUploadFile">{{ langStore.t('BOMFileUpload') }}</el-button>
          <el-button type="danger" class="warehouse-action-btn" :icon="Printer" disabled />
          <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh"></el-button>
        </div>
        <el-select
          v-model="selectedProductCode"
          placeholder="Lọc theo mã code sản phẩm"
          clearable
          @change="applyFilters"
          class="barcode-select"
          filterable
          remote
          :remote-method="remoteSearchProductCode"
          :loading="loadingProductCode"
        >
          <el-option
            v-for="barcode in productCodeOptions"
            :key="barcode.id"
            :label="barcode.name"
            :value="barcode.id"
          />
        </el-select>
        <el-select
          v-model="selectedBrand"
          placeholder="Lọc theo hãng"
          clearable
          @change="applyFilters"
          class="barcode-select"
        >
          <el-option
            v-for="barcode in uniqueBrand"
            :key="barcode.id"
            :label="barcode.name"
            :value="barcode.id"
          />
        </el-select>
        <el-select
          v-model="selectedProductSeriNum"
          placeholder="Lọc theo số seri sản phẩm"
          clearable
          @change="applyFilters"
          class="barcode-select"
        >
          <el-option
            v-for="barcode in uniqueProductSeriNum"
            :key="barcode.id"
            :label="barcode.name"
            :value="barcode.id"
          />
        </el-select>
        <!-- <el-date-picker /> -->
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
        <el-table-column prop="product_name" label="Tên hàng hóa" width="auto" />
        <el-table-column prop="part_no" label="Mã hàng hóa" width="auto" />
        <el-table-column prop="origin" label="Hãng" width="auto" />
        <el-table-column prop="quantity" label="Số lượng" width="auto" />
        <el-table-column prop="seri_number" label="Seri No." width="auto" />
        <el-table-column label="Trạng thái" width="120">
          <template #default="{ row }">
            <el-tag :type="row.quantity > 0 ? 'success' : 'danger'" effect="light">
              {{ row.quantity > 0 ? `Còn hàng` : `Hết hàng` }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="Hành động" min-width="auto">
          <template #default="{ row }">
            <el-button type="success" size="default" @click="showDetail(row)" :icon="View" circle />
            <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" circle />
            <el-button type="danger" size="default" :icon="Delete" circle disabled />
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
            <el-descriptions-item label="Tên hàng hóa">{{ selectedItem.product_name }}</el-descriptions-item>
            <el-descriptions-item label="Mã hàng hóa">{{ selectedItem.part_no }}</el-descriptions-item>
            <el-descriptions-item label="Hãng">{{ selectedItem.origin }}</el-descriptions-item>
            <el-descriptions-item label="Mô tả">{{ selectedItem.description }}</el-descriptions-item>
            <el-descriptions-item label="Số lượng">{{ selectedItem.quantity }}</el-descriptions-item>
            <el-descriptions-item label="Số Seri">{{ selectedItem.seri_number }}</el-descriptions-item>
            <el-descriptions-item label="Vị trí">{{ selectedItem.location }}</el-descriptions-item>
            <el-descriptions-item label="Người nhập">{{ selectedItem.entered_by }}</el-descriptions-item>
            <el-descriptions-item label="Ngày nhập">{{ formattedTime }}</el-descriptions-item>
            <el-descriptions-item label="Đơn vị">{{ selectedItem.unit }}</el-descriptions-item>
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
      <warehouse-item-dialog 
        v-model="dialogVisible"
        :item-to-edit="currentItem"
        @save="saveItem"
        @close="closeDialog"
      />
    </div>
    <warehouse-item-upload 
      v-model="uploadDialogVisible"
      @uploadSuccess="handleUploadSuccess"
    />
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { Delete, Download, EditPen, Printer, Refresh, UploadFilled, View } from "@element-plus/icons-vue";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import { useWarehouseManagementDatas } from "../../../composables/Warehouse/useWarehouseManagmentDatas";
import WarehouseItemDialog from "../../../components/dialog/WarehouseItemDialog.vue";
import { useWarehouseManagementActions } from "../../../composables/Warehouse/useWarehouseManagmentActions";
import WarehouseItemUpload from "../../../components/upload/WarehouseItemUpload.vue";
import { useBarcodeLogic } from "../../../composables/utils/useBarcodeLogic";
import { useDateFormat } from "../../../composables/utils/useDateFormat";

export default {
  name: "WarehouseManagementDashboard",
  props: {
    listItem: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    DetailPopup,
    UploadFilled,
    Printer,
    WarehouseItemDialog,
    WarehouseItemUpload,
    Download,
    Delete,
  },
  setup() {
    const langStore = useLanguageStore();
    const { 
      filteredItems,
      fetchDataAndInitialize,
      emptyData, paginatedItems,
      selectedProductCode,
      selectedProductSeriNum,
      uniqueProductSeriNum,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
      productCodeOptions,
      loadingProductCode,
      remoteSearchProductCode,
      selectedBrand,
      uniqueBrand,
    } = useWarehouseManagementDatas();

    const {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
    } = useWarehouseManagementActions(langStore, fetchDataAndInitialize);

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);

    const isEditVisible = ref(false);
    const editedItem = ref({});

    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    }

    const showEditForm = (item) => {
      // Copy data to avoid changing directly on the board
      editedItem.value = { ...item };
      isEditVisible.value = true;
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

    const refreshData = () => {
      fetchDataAndInitialize();
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

    const { barcodeRef, generatedBarcode, downloadBarcodeSvg } = useBarcodeLogic(selectedItem, isDetailVisible);
    const { formatDateTimeToDate } = useDateFormat();

    const formattedTime = computed(() => {
        if (selectedItem.value && selectedItem.value.time) {
            return formatDateTimeToDate(selectedItem.value.time);
        }
        return 'N/A';
    });

    return {
      langStore,
      isDetailVisible,
      selectedItem,
      showDetail,
      EditPen,
      View,
      isEditVisible,
      editedItem,
      showEditForm,
      handleFormSubmit,
      UploadFilled,
      Printer,
      Refresh,
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      paginatedItems,
      selectedProductCode,
      selectedProductSeriNum,
      handleCurrentChange,
      uniqueProductSeriNum,
      pageSize,
      currentPage,
      handleSizeChange,
      applyFilters,
      isLoading,
      refreshData,
      dialogVisible,
      currentItem,
      editItem,
      saveItem,
      closeDialog,
      uploadDialogVisible,
      handleUploadFile,
      handleUploadSuccess,
      generatedBarcode,
      barcodeRef,
      downloadBarcodeSvg,
      Download,
      formattedTime,
      Delete,
      productCodeOptions,
      loadingProductCode,
      remoteSearchProductCode,
      selectedBrand,
      uniqueBrand,
    };
  },
};
</script>

<style>
.warehouse_management_container {
  padding: 20px;
  height: 100vh;
  display: flex;
  background-color: #f9f9f9;
  flex-direction: column;
  overflow: scroll;
  overflow-x: hidden;
}

.table-data {
  display: contents;
}

.action-area {
  display: flex;
  flex-direction: row;
}

.filter-section {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.pagination-controls {
  margin-top: auto; /* Đẩy phân trang xuống cuối */
  display: flex;
  justify-content: center;
  padding-top: 15px;
  padding-bottom: 15px;
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
