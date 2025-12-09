<template>
  <div class="warehouse_management_container">
  <div class="filter-section">
    <div class="action-area">
      <el-button type="success" class="warehouse-action-btn" :icon="UploadFilled" v-on:click="handleUploadFile">{{ langStore.t('BOMFileUpload') }}</el-button>
      <el-button type="danger" class="warehouse-action-btn" :icon="Printer" disabled />
      <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh"></el-button>
    </div>
  </div>
    <el-tabs v-model="activeTab" class="warehouse-tabs" type="border-card" name="dashboard">
      <el-tab-pane :label="langStore.t('dashboardTabLabel')" name="dashboard" class="dashboard-tab-pane">
        <WarehouseDashboardTab 
          v-model:dateRange="startAndEndDateVal"
          :langStore="langStore"
          :importVal="importVal"
          :installation-val="installationVal"
          :totalPO="totalPO"
          :total-project="totalProject"
          :pied-chart="piedChart"
          :dual-chart-val="dualChartVal"
          :donut-data="donutData"
          :is-loading="isLoading"
          :is-visible="activeTab ==='dashboard'"
          @filter="filterByDate"
        />
      </el-tab-pane>

      <el-tab-pane :label="langStore.t('groupedItemsTabLabel')" name="grouped" class="grouped-tab-pane">
        <InventoryTable
          v-if="activeTab === 'grouped'"
          @view-detail="showDetail"
          @edit-detail="editItem"
        />
      </el-tab-pane>

      <el-tab-pane label="Danh sách trạng thái của thiết bị theo dự án" name="expand">
        <InstallationStatusTable
          v-if="activeTab === 'expand'"
          @view-detail="showDetailInstallation"
        />
      </el-tab-pane> 

    </el-tabs>
    
    <ItemDetailPopup 
      v-model="isDetailVisible"
      :item="selectedItem"
    />

    <InstallationDetailPopup
      v-model="isDetailInstallation"
      :item="selectedItemInstallation"
    />

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
import { computed, reactive, ref } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { Delete, Download, EditPen, Files, Filter, Printer, Refresh, ShoppingCart, Tickets, UploadFilled, Van, View } from "@element-plus/icons-vue";
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
import { useLoadWarehouseChart } from "../../../composables/Warehouse/useLoadWarehouseChart";
import PiedChart from "../../../components/charts/PiedChart.vue";
import { useWarehouseInstallationManagement } from "../../../composables/Warehouse/useWarehouseInstallationManagement";
import InstallationStatusTable from "../../../components/table/warehouse_dashboard/InstallationStatusTable.vue";
import InventoryTable from "../../../components/table/warehouse_dashboard/InventoryTable.vue";
import ItemDetailPopup from "../../../components/popup/ItemDetailPopup.vue";
import InstallationDetailPopup from "../../../components/popup/InstallationDetailPopup.vue";
import WarehouseDashboardTab from "../../../components/tab/WarehouseDashboardTab.vue";
import BalanceChart from "../../../components/charts/BalanceChart.vue";

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
    Filter,
    PiedChart,
    DualChart,
    InstallationStatusTable,
    InventoryTable,
    ItemDetailPopup,
    InstallationDetailPopup,
    WarehouseDashboardTab,
    BalanceChart,
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
      groupedItems,
      totalItemsForPagination,
      startAndEndDateVal,
      selectedFilterDate,
      selectedDashboardDate,
    } = useWarehouseManagementDatas();
    
    const {
      filteredInstallationItems,
      totalStatusForPagination,
      groupedStatus,
      groupItemsByPartNo,
      groupedInstallationStatus,
      emptyInstallationData,
      totalPartNoItemsForPagination,
    } = useWarehouseInstallationManagement();

    const {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
        itemDataByDate,
        filteredDataByDate,
    } = useWarehouseManagementActions(langStore, fetchDataAndInitialize, selectedFilterDate);

    const currentPageGroup = ref(1);
    const pageSizeGroup = ref(10);

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);

    const isDetailInstallation = ref(false);
    const selectedItemInstallation = ref(null);

    const isEditVisible = ref(false);
    const editedItem = ref({});

    const activeTab = ref('dashboard');

    const rawApiData = ref(null);

    const handleSizeChangeGroup = (val) => { pageSizeGroup.value = val; currentPageGroup.value = 1; };
    const handleCurrentChangeGroup = (val) => { currentPageGroup.value = val; };

    const currentPageStatus = ref(1);
    const pageSizeStatus = ref(10);
    const handleCurrentChangeStatus = (val) => { currentPageStatus.value = val; };
    const handleSizeChangeStatus = (val) => { pageSizeStatus.value = val; currentPageStatus.value = 1; };

    const currentPageFlat = ref(1);
    const pageSizeFlat = ref(10);
    const handleCurrentChangeFlat = (val) => { currentPageFlat.value = val; };
    const handleSizeChangeFlat = (val) => { pageSizeFlat.value = val; currentPageFlat.value = 1; };

    const currentPagePartNo = ref(1);
    const pageSizePartNo = ref(10);
    const handleCurrentChangePartNo = (val) => { currentPagePartNo.value = val; };
    const handleSizeChangePartNo = (val) => { pageSizePartNo.value = val; currentPagePartNo.value = 1; };

     const handleFilterByDate = () => {
      filteredDataByDate();
    };
    
    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    }

    const showDetailInstallation = (item) => {
      selectedItemInstallation.value = item;
      isDetailInstallation.value = true;
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

    const {
        filterByDateAction,
        inventoryChart,
        piedChart,
        importVal,
        installationVal,
        totalPO,
        totalProject,
        donutData,
        dualChartVal,
        notInstallationVal,
    } = useLoadWarehouseChart(langStore, startAndEndDateVal);

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
    
    const {
      barcodeRef: barcodeInstallationRef, 
      generatedBarcode: generatedInstallationBarcode, 
      downloadBarcodeSvg: downloadInstallationBarcodeSvg 
  } = useBarcodeLogic(selectedItemInstallation, isDetailInstallation);

    const { formatDateTimeToDate } = useDateFormat();

    const formattedTime = computed(() => {
        if (selectedItem.value && selectedItem.value.time) {
            return formatDateTimeToDate(selectedItem.value.time);
        }
        return 'N/A';
    });

    const filterByDate = () => {
      filterByDateAction();
    };

    const importSummaryData = ref([
      { total: 12323, imported: 1231, cutting: 2321, completed: 242 }
    ]);
    const exportSummaryData = ref([
      { total: 1083, loading: 677, pending: 294, exported: 294 }
    ]);

    const paginatedItemsGroup = computed(() => {
      if (!Array.isArray(groupedItems.value)) return [];
      const start = (currentPageGroup.value - 1) * pageSizeGroup.value;
      const end = start + pageSizeGroup.value;

      return groupedItems.value.slice(start, end);
    });

    const mappedQuantityData = computed(() => {
        const pieChartData = rawApiData.value?.chart?.pie_chart;

        if (!pieChartData) {
            return [];
        }

        const { import_quantity, export_quantity } = pieChartData;

        return [
            { value: import_quantity || 0 }, // Vị trí [0] 
            { value: export_quantity || 0 }  // Vị trí [1]
        ];
    });

    const itemPaginationState = ref({});

    const getPaginatedChildItems = (productGroup) => {
      const partNo = productGroup.part_no;
      if (!itemPaginationState.value[partNo]) {
        itemPaginationState.value[partNo] = {
          currentPage: 1,
          pageSize: 10,
        };
      }

      const state = itemPaginationState.value[partNo];
      const allItems = productGroup.items;

      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return allItems.slice(start, end);
    };

    const handleItemSizeChangeGroup = (val, productGroup) => {
      const partNo = productGroup.part_no;
      if (itemPaginationState.value[partNo]) {
        itemPaginationState.value[partNo].pageSize = val;
        itemPaginationState.value[partNo].currentPage = 1;
      }
    };

    const handleItemCurrentChangeGroup = (val, productGroup) => {
      const partNo = productGroup.part_no;
      if (itemPaginationState.value[partNo]) {
        itemPaginationState.value[partNo].currentPage = val;
      }
    };

    const filterDetailByDate = () => {
      filteredDataByDate();
    };

    const paginatedItemsFlat = computed(() => {      
      if (!Array.isArray(filteredInstallationItems.value)) return [];
      const start = (currentPageFlat.value - 1) * pageSizeFlat.value;
      const end = start + pageSizeFlat.value;

      return filteredInstallationItems.value.slice(start, end);
    });

    const paginatedStatusGroup = computed(() => {
      if (!Array.isArray(groupedStatus.value)) return [];
      const start = (currentPageStatus.value - 1) * pageSizeStatus.value;
      const end = start + pageSizeStatus.value;

      return groupedStatus.value.slice(start, end);
    });

    const expandedStatusKeys = ref([]); 

    const handleStatusExpandChange = (row, expandedRows) => {
        if (expandedRows.length > 0) {
          expandedStatusKeys.value = [row.status];
        } else {
          expandedStatusKeys.value = [];
        }
    };

    const itemProductPaginationState = ref({});

    const getPaginatedChildProductItems = (productcodeGroup) => {
      const productVal = productcodeGroup.part_no;
      if (!itemProductPaginationState.value[productVal]) {
        itemProductPaginationState.value[productVal] = {
          currentPage: 1,
          pageSize: 10,
        };
      }
      const state = itemProductPaginationState.value[productVal];
      const allItems = productcodeGroup.items;

      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return allItems.slice(start, end);
    };

    const handleItemProductSizeChangeGroup = (val, productcodeGroup) => {
      const productVal = productcodeGroup.part_no;
      if (itemProductPaginationState.value[productVal]) {
        itemProductPaginationState.value[productVal].pageSize = val;
        itemProductPaginationState.value[productVal].currentPage = 1;
      }
    };

    const handleProductCurrentChangeGroup = (val, productcodeGroup) => {
      const productVal = productcodeGroup.part_no;
      if (itemProductPaginationState.value[productVal]) {
        itemProductPaginationState.value[productVal].currentPage = val;
      }
    };

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

    const partnoPaginationState = reactive({}); 

// Hàm để lấy hoặc khởi tạo trạng thái phân trang cho một nhóm MD cụ thể
    const getPartNoGroupPaginationState = (partNo) => {
        if (!partnoPaginationState[partNo]) {
            partnoPaginationState[partNo] = {
                currentPage: 1,
                pageSize: 10,
            };
        }
        return partnoPaginationState[partNo];
    };

    // Hàm xử lý thay đổi trang
    const handleCurrentChangePartNoGroup = (val, partnoGroup) => {
        const state = getPartNoGroupPaginationState(partnoGroup.part_no);
        state.currentPage = val;
        // Bạn có thể cần dùng một computed property để slice dữ liệu cho bảng con cấp 2
    };

    // Hàm xử lý thay đổi kích thước trang
    const handleSizeChangePartNoGroup = (val, partnoGroup) => {
        const state = getPartNoGroupPaginationState(partnoGroup.part_no);
        state.pageSize = val;
        state.currentPage = 1; // Reset về trang 1 khi thay đổi kích thước
        // Bạn có thể cần dùng một computed property để slice dữ liệu cho bảng con cấp 2
    };

    const getPaginatedPartNoGroups = (partnoGroup) => {

      const { currentPage, pageSize } = getPartNoGroupPaginationState(partnoGroup.part_no);
      const PartNoGroups = groupItemsByPartNo(partnoGroup.items); // Dữ liệu gốc
      
      const start = (currentPage - 1) * pageSize;
      const end = currentPage * pageSize;
      
      return PartNoGroups.slice(start, end);
    };

    const partnoExpandedKeys = ref([]);

    const handlePartNoExpandChange = (row, expandedRows) => {
      if (expandedRows.length > 0) {
          partnoExpandedKeys.value = [row.part_no]; 
      } else {
          partnoExpandedKeys.value = [];
      }
    };

    // const getPaginatedPartNoGroups = computed(() => {
    //   if (!Array.isArray(groupItemsByPartNo.value)) return [];
    //   const start = (currentPagePartNo.value - 1) * pageSizePartNo.value;
    //   const end = start + pageSizePartNo.value;

    //   return groupItemsByPartNo.value.slice(start, end);
    // });

    // const partnoExpandedKeys = ref([]);

    // const handlePartNoExpandChange = (row, expandedRows) => {
    //   if (expandedRows.length > 0) {
    //       partnoExpandedKeys.value = [row.part_no]; 
    //   } else {
    //       partnoExpandedKeys.value = [];
    //   }
    // };

    // const partnoPaginationState = ref({});

    // const getPartNoGroupPaginationState = (partnoGroup) => {
    //   const partnoVal = partnoGroup.part_no;
    //   if (!partnoPaginationState.value[partnoVal]) {
    //     partnoPaginationState.value[partnoVal] = {
    //       currentPage: 1,
    //       pageSize: 10,
    //     };
    //   }
    //   const state = partnoPaginationState.value[partnoVal];
    //   const allItems = partnoGroup.items;

    //   const start = (state.currentPage - 1) * state.pageSize;
    //   const end = start + state.pageSize;

    //   return allItems.slice(start, end);
    // };

    // const handleSizeChangePartNoGroup = (val, partnoGroup) => {
    //   const partnoVal = partnoGroup.status;
    //   if (partnoPaginationState.value[partnoVal]) {
    //     partnoPaginationState.value[partnoVal].pageSize = val;
    //     partnoPaginationState.value[partnoVal].currentPage = 1;
    //   }
    // };

    // const handleCurrentChangePartNoGroup = (val, partnoGroup) => {
    //   const partnoVal = partnoGroup.status;
    //   if (partnoPaginationState.value[partnoVal]) {
    //     partnoPaginationState.value[partnoVal].currentPage = val;
    //   }
    // };

    return {
      langStore,
      isDetailVisible,
      selectedItem,
      showDetailInstallation,
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
      startAndEndDateVal,
      importSummaryData,
      exportSummaryData,
      paginatedItemsGroup,
      groupedItems,
      totalItemsForPagination,
      mappedQuantityData,
      filterByDate,
      filterByDateAction,
      Filter,
      inventoryChart,
      piedChart,
      currentPageGroup,
      handleSizeChangeGroup,
      handleCurrentChangeGroup,
      pageSizeGroup,
      getPaginatedChildItems,
      handleItemSizeChangeGroup,
      handleItemCurrentChangeGroup,
      itemPaginationState,
      handleFilterByDate,
      importVal,
      installationVal,
      totalPO,
      totalProject,
      donutData,
      dualChartVal,
      notInstallationVal,
      filterDetailByDate,
      selectedFilterDate,
      itemDataByDate,
      filteredDataByDate,
      selectedDashboardDate,
      handleCurrentChangeFlat,
      pageSizeFlat,
      currentPageFlat,
      handleSizeChangeFlat,
      paginatedItemsFlat,
      filteredInstallationItems,
      paginatedStatusGroup,
      expandedStatusKeys,
      handleStatusExpandChange,
      currentPageStatus,
      pageSizeStatus,
      handleCurrentChangeStatus,
      handleSizeChangeStatus,
      getPartNoGroupPaginationState,
      handleCurrentChangePartNoGroup,
      handleSizeChangePartNoGroup,
      partnoPaginationState,
      partnoExpandedKeys,
      handlePartNoExpandChange,
      getPaginatedChildProductItems,
      handleItemProductSizeChangeGroup,
      handleProductCurrentChangeGroup,
      totalStatusForPagination,
      groupedStatus,
      groupItemsByPartNo,
      groupedInstallationStatus,
      getPaginatedPartNoGroups,
      getInstallationStatusName,
      statusFormatter,
      emptyInstallationData,
      currentPagePartNo,
      pageSizePartNo,
      handleCurrentChangePartNo,
      handleSizeChangePartNo,
      totalPartNoItemsForPagination,
      itemProductPaginationState,
      isDetailInstallation,
      selectedItemInstallation,
      generatedInstallationBarcode,
      downloadInstallationBarcodeSvg,
      barcodeInstallationRef,
      BalanceChart,
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
  overflow: hidden;
  flex-direction: column;
}

.warehouse_management_container .el-tabs {
    flex-grow: 1;
    width: 100%;
    height: 88%;
}

.table-data {
  display: flex;
  flex-direction: column;
  height: 85%;
  flex-grow: 1;
}

.action-area {
  display: flex;
  flex-direction: row;
}

.items-table {
    flex-grow: 1;
    flex-basis: 0;
    overflow: auto;
}

.filter-section {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  position: sticky;
  top:0;
  z-index: 100;
}

.pagination-controls {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 15px;
  border-top: 1px solid #ebeef5;
  background-color: white;
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
  width: 100%;
  padding: 10px 0;
  height: auto;
}

.header-filters {
  display: flex;
  margin-bottom: 20px;
  width: fit-content;
  gap: 15px;
}

.metric-cards {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  border-radius: 8px;
}

.metric-card {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  width: 250px;
  height: 70px;
  gap: 20px;
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  cursor: pointer;
}

.metric-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 3px 3px rgba(0, 0, 0, 0.22);
}

.metric-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  font-size: 24px;
  padding: 0;
  border-radius: 50%;
  margin-right: 15px;
  color: white;
}

.metric-icon-import { background-color: #2c2c6a; } /* Blue */
.metric-icon-export { background-color: #67c23a; } /* Green */
.metric-icon-request { background-color: #e6a23c; } /* Yellow */
.metric-icon-transfer { background-color: #f56c6c; } /* Red */

.metric-value {
  font-size: 2em;
  font-weight: bold;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-top: 2px;
  /* white-space: nowrap; */
  word-wrap: break-word;
}

.charts-and-tables {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Chia thành 2 cột */
  width: 100%;
  gap: 20px;
  margin: 0 auto;
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
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px; 
  flex-grow: 1;
  min-width: 0;
}

.el-card{
  width: 100%;
  min-height: 300px;
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

.add-task-button {
  align-self: flex-end;
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

.dashboard-tab-pane {
  height: -webkit-fill-available;
  padding: 20px 20px;
  overflow: scroll;
  overflow-y: auto;
  overflow-x: hidden;
}

.action-filter {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.grouped-tab-pane {
  height: -webkit-fill-available;
  /* padding: 10px 10px; */
  overflow: scroll;
  overflow-y: hidden;
  overflow-x: hidden;
}
@media (max-width: 1200px) {
  /* Chuyển sang hiển thị 1 cột khi chiều rộng màn hình <= 1200px */
  .charts-and-tables {
    grid-template-columns: 1fr; /* Chỉ còn 1 cột chiếm toàn bộ chiều rộng */
  }
}

/* Media Query cho các Metric Card để không bị tràn */
@media (max-width: 1000px) {
    .metric-cards {
        flex-wrap: wrap; /* Cho phép các card nhảy xuống hàng mới */
        justify-content: center; /* Căn giữa các card */
        gap: 15px; /* Khoảng cách giữa các card */
    }
    .metric-card {
        width: 48%; /* Hoặc một giá trị cố định nhỏ hơn */
        max-width: 300px;
    }
}

/* Màn hình điện thoại */
@media (max-width: 600px) {
    .metric-cards {
        flex-direction: column; /* Xếp thành một cột dọc */
        align-items: center;
    }
    .metric-card {
        width: 100%;
        max-width: none;
    }
}
</style>
