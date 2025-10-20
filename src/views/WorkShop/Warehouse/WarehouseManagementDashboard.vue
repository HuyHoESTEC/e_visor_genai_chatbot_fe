<template>
  <div class="warehouse_management_container">
    <el-tabs v-model="activeTab" class="warehouse-tabs" type="border-card">
      <el-tab-pane label="Tổng quan kho" name="dashboard">
        <div class="dashboard-content">
          <div class="header-filters">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="→"
              start-placeholder="Ngày bắt đầu"
              end-placeholder="Ngày kết thúc"
              size="default"
            />
          </div>

          <div class="metric-cards">
            <el-card class="metric-card">
              <div class="metric-icon metric-icon-import"><el-icon><UploadFilled /></el-icon></div>
              <div class="metric-data">
                <div class="metric-value">1200</div>
                <div class="metric-label">Phiếu nhập kho</div>
              </div>
            </el-card>
            <el-card class="metric-card">
              <div class="metric-icon metric-icon-import"><el-icon><UploadFilled /></el-icon></div>
              <div class="metric-data">
                <div class="metric-value">1100</div>
                <div class="metric-label">Phiếu xuất kho | lắp đặt</div>
              </div>
            </el-card>
          </div>
          <div class="charts-and-tables">
            <div class="left-column">
              <el-card header="Phiếu nhập kho">
                <div class="card-header-filter">
                  <el-select placeholder="Tât cả kho" size="small" style="width: 120px;" />
                </div>
                <el-table :data="importSummaryData" border size="small">
                  <el-table-column prop="total" label="Tổng" width="100" />
                  <el-table-column prop="imported" label="Nhập kho" width="100" />
                  <el-table-column prop="cutting" label="Đang cắt hàng" />
                  <el-table-column prop="completed" label="Cắt hàng xong" />
                </el-table>
              </el-card>

              <el-card header="Phiếu xuất kho" class="mt-20">
                <div class="card-header-filter">
                  <el-select placeholder="Tất cả kho" size="small" style="width: 120px;" />
                </div>
                <el-table :data="exportSummaryData" border size="small">
                  <el-table-column prop="total" label="Tổng" />
                  <el-table-column prop="loading" label="Đang lấy hàng" />
                  <el-table-column prop="pending" label="Chờ xuất kho" />
                  <el-table-column prop="exported" label="Đã xuất kho" />
                </el-table>
              </el-card>
            </div>

            <div class="right-column">
              <el-card header="Hàng tồn kho hiện tại">
                <div class="card-header-filter">
                  <el-select placeholder="Tất cả kho" size="small" style="width: 120px;" />
                  <el-select placeholder="Tên vật tư" size="small" style="width: 120px;" />
                </div>
                <PieChart />
              </el-card>
            </div>

            <div class="left-column">
              <el-card header="Giá trị tồn kho">
               <div class="card-header-filter">
                 <el-select placeholder="Tất cả kho" size="small" style="width: 120px;" />
                 <el-select placeholder="Tên vật tư" size="small" style="width: 120px;" />
               </div>
               <DonutChart :inventory-data="inventoryValueData" />
              </el-card>
            </div>

            <div class="right-column">
               <el-card header="Biến động tồn kho">
              <InventoryChart :initial-data="inventoryChartData" />
               </el-card>
            </div>

          <el-card class="transaction-chart-card mt-20">
              <DualChart 
                  :chart-data="transactionChartData"
                  :is-visible="activeTab === 'dashboard'" 
              />
          </el-card>

          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Quản lý hàng hóa" name="table">
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
            <el-table-column prop="import_quantity" label="Số lượng nhập kho" width="auto" />
            <el-table-column prop="export_quantity" label="Số lượng xuất kho" width="auto" />
            <el-table-column prop="remaining _quantity" label="Số lượng còn lại" width="auto" />
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
                <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
                <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" plain circle />
                <el-button type="danger" size="default" :icon="Delete" plain circle />
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
        </div>
      </el-tab-pane>
    </el-tabs>

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
import PieChart from "../../../components/charts/PieChart.vue";
import DonutChart from "../../../components/charts/DonutChart.vue";
import InventoryChart from "../../../components/charts/InventoryChart.vue";
import DualChart from "../../../components/charts/DualChart.vue";

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
    PieChart,
    DonutChart,
    InventoryChart,
    DualChart,
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

    const activeTab = ref('dashboard');

    const inventoryValueData = ref([
      { label: 'Giá trị VT bị giữ', value: 3 }, 
      { label: 'Giá trị VT có thể xuất', value: 5 }, 
    ]);

    const inventoryChartData = ref([
      { date: '2024-02-12', quantity: 90000, value: 50000 },
      { date: '2024-02-13', quantity: 40000, value: 5000 },
      { date: '2024-02-14', quantity: 55000, value: 70000 },
      { date: '2024-02-15', quantity: 95000, value: 45000 },
      { date: '2024-02-16', quantity: 35000, value: 40000 },
    ]);

    const transactionChartData = ref({
      dates: ['19/10/2025', '20/10/2025', '21/10/2025', '22/10/2025', '23/10/2025', '24/10/2025', '25/10/2025'],
      importQuantity: [950, 250, 500, 500, 900, 350, 500],
      exportQuantity: [850, 1050, 980, 400, 800, 700, 520],
      importValue: [38000000, 5000000, 20000000, 20000000, 40000000, 15000000, 20000000], 
      exportValue: [40000000, 42000000, 40000000, 16000000, 38000000, 28000000, 20800000], 
    });
    
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
    
    const dateRange = ref(null);
    const importSummaryData = ref([
      { total: 12323, imported: 1231, cutting: 2321, completed: 242 }
    ]);
    const exportSummaryData = ref([
      { total: 1083, loading: 677, pending: 294, exported: 294 }
    ]);

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
      activeTab,
      dateRange,
      importSummaryData,
      exportSummaryData,
      inventoryValueData,
      inventoryChartData,
      transactionChartData,
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

.dashboard-content {
  padding: 10px 0;
}

.header-filters {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.metric-icon {
  font-size: 32px;
  padding: 10px;
  border-radius: 6px;
  margin-right: 15px;
  color: white;
}

.metric-icon-import { background-color: #409eff; } /* Blue */
.metric-icon-export { background-color: #67c23a; } /* Green */
.metric-icon-request { background-color: #e6a23c; } /* Yellow */
.metric-icon-transfer { background-color: #f56c6c; } /* Red */

.metric-value {
  font-size: 1.5em;
  font-weight: bold;
}

.metric-label {
  font-size: 0.8em;
  color: #909399;
}

.charts-and-tables {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Chia thành 2 cột */
  gap: 20px;
  margin-top: 20px;
}

.transaction-chart-card {
    width: 100%;
}

.card-header-filter {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.mt-20 {
  margin-top: 20px;
}

.chart-placeholder {
  text-align: center;
  padding: 20px 0;
  /* Giả lập biểu đồ */
  height: 250px; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* Style cho donut chart */
  background-image: conic-gradient(
    #409eff 0 20%, 
    #ff8a00 20% 100%
  );
  border-radius: 50%;
  width: 250px;
  margin: 20px auto;
  border: 40px solid white; /* Tạo hiệu ứng donut */
  box-shadow: 0 0 0 2px #dcdfe6;
}

.left-column,
.right-column-charts {
  display: flex;
  flex-direction: column;
  gap: 20px; 
}

.chart-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #ff8a00;
  margin-top: -10px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  font-size: 0.9em;
}

.chart-extra-filters {
    display: flex;
    gap: 15px; /* Khoảng cách giữa các select */
    margin-top: 10px;
    padding: 15px; 
    border-top: 1px solid #EBEEF5; /* Đường phân cách */
    background-color: #F8F8F8; /* Màu nền nhẹ */
    border-radius: 0 0 4px 4px; /* Bo góc dưới */
}

.legend-item {
  display: flex;
  align-items: center;
}

.color-box {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

.color-box.blue { background-color: #409eff; }
.color-box.orange { background-color: #ff8a00; }

/* Điều chỉnh lại style cho nội dung tab để tận dụng không gian */
.el-tabs__content {
    padding: 0;
}
.el-tab-pane {
    height: 100%;
    overflow-y: auto;
}
</style>
