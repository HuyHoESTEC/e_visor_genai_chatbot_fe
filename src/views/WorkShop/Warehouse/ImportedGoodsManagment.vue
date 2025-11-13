<template>
  <div class="imported-goods-managment-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t("DataUploading") }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="warehouse-action-btn" :icon="UploadFilled"
            >{{ langStore.t("uploadTemplateButton") }}</el-button
          >
          <el-button type="danger" v-on:click="handleDownloadClick" :icon="Download">{{ langStore.t("downloadButton") }}</el-button>
          <!-- <el-button type="primary" :icon="Plus" v-on:click="addNewItem">{{ langStore.t("addNewProductButton") }}</el-button> -->
          <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh" plain circle />
          <el-button type="danger" 
            v-if="!selectionEmpty || isDeleting" 
            v-on:click="deleteAllSelectedItems" 
            :icon ="Delete" 
            :loading="isDeleting"
          >
            {{ langStore.t("deleteSelectedButton") }} ({{ selectedItems.length }})
          </el-button>       
        </div>
        <div class="action-filter">
          <el-select
            v-model="selectedProjectCode"
            :placeholder="langStore.t('filterByProjectCodePlaceholder')"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchProjectCode"
            :loading="loadingProjectCode"
          >
            <el-option
              v-for="barcode in projectCodeOptions"
              :key="barcode.id"
              :label="barcode.name"
              :value="barcode.id"
            />
          </el-select>
          <el-select
            v-model="selectedProductCode"
            :placeholder="langStore.t('filterByProductCodePlaceholder')"
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
            v-model="selectedImportId"
            :placeholder="langStore.t('FilterByImportId')"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchImportId"
            :loading="loadingImportId"
          >
            <el-option
              v-for="barcode in importIdOptions"
              :key="barcode.id"
              :label="barcode.name"
              :value="barcode.id"
            />
          </el-select>
          <el-select
            v-model="selectedBrand"
            :placeholder="langStore.t('filterByBrandPlaceholder')"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchBrand"
            :loading="loadingBrand"
          >
            <el-option
              v-for="barcode in brandOptions"
              :key="barcode.id"
              :label="barcode.name"
              :value="barcode.id"
            />
          </el-select>
          <el-select
            v-model="selectedSeriNumber"
            :placeholder="langStore.t('FilterBySeriNumber')"
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
          <el-date-picker 
              v-model="selectedImportDate"
              type="date"
              :placeholder="langStore.t('FilterByImportDate')"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              clearable
              @change="applyFilters"
              style="width: 100%;"
          />
        </div>
      </div>
      <el-tabs v-model="activeTab" class="export-data-tabs" type="border-card">
        <el-tab-pane :label="langStore.t('flatListTabLabel')" name="flat">
            <el-table
                :data="paginatedItemsFlat"
                border
                style="width: 100%;"
                stripe
                class="items-table"
                height="calc(100vh - 321px)"
                @selection-change="itemSelectionChange"
            >
                <template #empty>
                    <div v-if="emptyData" class="empty-data-message">
                        <el-empty :description="langStore.t('NoData')" />
                    </div>
                </template>
                <el-table-column type="selection" width="55" />                
                <el-table-column fixed prop="import_id" :label="langStore.t('PO')" width="auto" sortable />
                <el-table-column prop="project_code" :label="langStore.t('tableHeaderProjectCode')" width="auto" />
                <el-table-column prop="product_name" :label="langStore.t('detailProductNameLabel')" width="auto" />
                <el-table-column prop="part_no" :label="langStore.t('tableHeaderPartNo')" width="auto" />
                <el-table-column prop="origin" :label="langStore.t('detailOriginLabel')" width="auto" />
                <el-table-column prop="quantity" :label="langStore.t('tableHeaderQuantity')" width="auto" />
                <el-table-column prop="seri_number" :label="langStore.t('tableHeaderSeriNumber')" width="auto" />
                <el-table-column fixed="right" :label="langStore.t('tableHeaderAction')" min-width="auto">
                <template #default="{ row }">
                    <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
                    <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" plain circle />
                    <el-button type="danger" size="default" @click="handleDelete(row)" :icon="Delete" plain circle />
                </template>
                </el-table-column>
            </el-table>
            <el-pagination
                background
                layout="prev, pager, next, sizes, total"
                :total="filteredItems.length"
                :page-sizes="[5, 10, 20, 50, 100]"
                v-model:page-size="pageSizeFlat"
                v-model:current-page="currentPageFlat"
                @size-change="handleSizeChangeFlat"
                @current-change="handleCurrentChangeFlat"
                class="pagination-controls"
            >
            </el-pagination>
        </el-tab-pane>

        <el-tab-pane :label="langStore.t('GroupedByProjectCode')" name="grouped">
            <el-table
                :data="paginatedItemsGroup"
                border
                style="width: 100%;"
                stripe
                class="items-table"
                height="calc(100vh - 321px)"
            >
                <template #empty>
                    <div v-if="emptyData" class="empty-data-message">
                        <el-empty :description="langStore.t('NoData')" />
                    </div>
                </template>
                <el-table-column type="expand">
                    <template #default="{ row: projectGroup }">
                        <div style="padding: 0 20px;">
                            <h4 style="color: black !important;">{{ langStore.t('DetailGroupTitleProject') }}: {{ projectGroup.project_code }}</h4>
                            <el-table :data="projectGroup.items" border size="small">
                                <el-table-column prop="project_code" :label="langStore.t('tableHeaderProjectCode')" width="auto" />
                                <el-table-column prop="product_name" :label="langStore.t('detailProductNameLabel')" width="auto" />
                                <el-table-column prop="part_no" :label="langStore.t('tableHeaderPartNo')" width="auto" />
                                <el-table-column prop="origin" :label="langStore.t('detailOriginLabel')" width="auto" />
                                <el-table-column prop="quantity" :label="langStore.t('tableHeaderQuantity')" width="auto" />
                                <el-table-column prop="seri_number" :label="langStore.t('tableHeaderSeriNumber')" width="auto" />
                                <el-table-column fixed="right" :label="langStore.t('tableHeaderAction')" min-width="auto">
                                  <template #default="{ row }">
                                      <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
                                      <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" plain circle />
                                      <el-button type="danger" size="default" @click="handleDelete(row)" :icon="Delete" plain circle />
                                  </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="project_code" :label="langStore.t('tableHeaderProjectCode')" min-width="600" sortable />
            </el-table>
            <el-pagination
                background
                layout="prev, pager, next, sizes, total"
                :total="totalItemsForPagination" 
                :page-sizes="[5, 10, 20, 50, 100]"
                v-model:page-size="pageSizeGroup"
                v-model:current-page="currentPageGroup"
                @size-change="handleSizeChangeGroup"
                @current-change="handleCurrentChangeGroup"
                class="pagination-controls"
            >
          </el-pagination>
        </el-tab-pane>
        <!-- <el-tab-pane label="Lịch sử chỉnh sửa" name="history">
          <el-table
              :data="paginatedItemsFlat"
              border
              style="width: 100%;"
              stripe
              class="items-table"
              height="calc(100vh - 297px)"
          >
              <template #empty>
                  <div v-if="emptyData" class="empty-data-message">
                      <el-empty description="No Data" />
                  </div>
              </template>
              <el-table-column fixed prop="import_id" label="Mã phiếu" width="auto" sortable />
              <el-table-column prop="project_code" label="Mã dự án" width="auto" />
              <el-table-column prop="product_name" label="Tên hàng hóa" width="auto" />
              <el-table-column prop="part_no" label="Mã hàng hóa" width="auto" />
              <el-table-column prop="origin" label="Hãng" width="auto" />
              <el-table-column prop="quantity" label="Số lượng" width="auto" />
              <el-table-column prop="seri_number" label="Seri No." width="auto" />
              <el-table-column prop="owner" label="Người thao tác" width="auto" />
              <el-table-column prop="edit_date" label="Ngày chỉnh sửa" width="auto" />
              <el-table-column fixed="right" label="Hành động" min-width="auto">
              <template #default="{ row }">
                  <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
              </template>
              </el-table-column>
          </el-table>
        </el-tab-pane> -->
      </el-tabs>
      <detail-popup v-model="isDetailVisible" :title="langStore.t('detailPopupTitle')">
      <div v-if="selectedItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="langStore.t('detailIdLabel')">{{ selectedItem.id }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('PO')">{{ selectedItem.import_id }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('ImportNoteDate')">{{ formattedImportTime }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('ImportItemDate')">{{ formattedTime }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailProjectCodeLabel')">{{ selectedItem.project_code }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailProductNameLabel')">{{ selectedItem.product_name }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailPartNoLabel')">{{ selectedItem.part_no }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailOriginLabel')">{{ selectedItem.origin }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailQuantityLabel')">{{ selectedItem.quantity }}</el-descriptions-item>
          <el-descriptions-item :label="langStore.t('detailSeriNumberLabel')">{{ selectedItem.seri_number }}</el-descriptions-item>
        </el-descriptions>
        <div class="barcode-area">
            <h4 class="barcode-label">{{ langStore.t('barcodeLabel') }}</h4>
            <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
                <el-button 
                    type="primary" 
                    size="small" 
                    :icon="Download" 
                    :disabled="generatedBarcode === 'N/A'"
                    @click="downloadBarcodeSvg"
                >
                    {{ langStore.t('downloadSvgButton') }}
                </el-button>
                <div v-if="generatedBarcode && generatedBarcode !== 'N/A'">
                    <svg ref="barcodeRef"></svg> 
                </div>
            </div>
            <p v-else class="barcode-value-error">{{ langStore.t('barcodeError') }}</p>
        </div>
      </div>
    </detail-popup>
    <warehouse-import-data-dialog 
      v-model="dialogVisible"
      :item-to-edit="currentItem"
      @save="saveItem"
      @close="closeDialog"
    />
    <FormNewitemPopupImport
      v-model="newItemDialogVisible"
      :currentItem="currentItem"
      :isEditing="isEditing"
      @close="closeDialog"
      @save="createItem"
    />
    </div>
    <WarehouseImportUpload 
      v-model="uploadDialogVisible"
      @uploadSuccess="handleUploadSuccess"
    />
    <DownloadFilterDiaglogImport
      v-model="downloadDialogVisible"
      :download-url="downloadFileUrl"
      :file-name="downloadFileName"
      :is-preparing="isDownloadPreparing"
      @create-download-link="handleCreateDownloadLink"
      @confirm-download="confirmDownloadFile"
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
  Plus,
} from "@element-plus/icons-vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseImportDatas } from "../../../composables/Warehouse_Import/useWarehouseImportDatas";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import WarehouseImportUpload from "../../../components/upload/WarehouseImportUpload.vue";
import WarehouseImportDataDialog from "../../../components/dialog/WarehouseImportDataDialog.vue";
import { useWarehouseImportAction } from "../../../composables/Warehouse_Import/useWarehouseImportAction";
import { useBarcodeLogic } from "../../../composables/utils/useBarcodeLogic";
import { useDateFormat } from "../../../composables/utils/useDateFormat";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWarehouseImportDownload } from "../../../composables/Warehouse_Import/useWarehouseImportDownload";
import DownloadFilterDiaglogImport from "../../../components/dialog/DownloadFilterDiaglogImport.vue";
import FormNewitemPopupImport from "../../../components/popup/FormNewitemPopupImport.vue";

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
    WarehouseImportDataDialog,
    DownloadFilterDiaglogImport,
    FormNewitemPopupImport,
  },
  setup() {
    const langStore = useLanguageStore();
    const activeTab = ref('flat'); // Mặc định hiển thị tab danh sách phẳng
    // Khai báo ref và hàm phân trang riêng cho Tab Phẳng
    const currentPageFlat = ref(1);
    const pageSizeFlat = ref(10);
    const handleCurrentChangeFlat = (val) => { currentPageFlat.value = val; };
    const handleSizeChangeFlat = (val) => { pageSizeFlat.value = val; currentPageFlat.value = 1; };
    // Khai báo ref và hàm phân trang riêng cho Tab Nhóm
    const currentPageGroup = ref(1);
    const pageSizeGroup = ref(10);
    const handleCurrentChangeGroup = (val) => { currentPageGroup.value = val; };
    const handleSizeChangeGroup = (val) => { pageSizeGroup.value = val; currentPageGroup.value = 1; };
    const {
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      paginatedItems,
      selectedProductCode,
      selectedSeriNumber,
      selectedImportDate,
      uniqueSeriNumber,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
      selectedProjectCode,
      productCodeOptions,
      loadingProductCode,
      remoteSearchProductCode,
      groupedItems,
      totalItemsForPagination,
      projectCodeOptions,
      loadingProjectCode,
      remoteSearchProjectCode,
      selectedBrand,
      selectedImportId,
      importIdOptions,
      loadingImportId,
      remoteSearchImportId,
      brandOptions,
      loadingBrand,
      remoteSearchBrand,
    } = useWarehouseImportDatas();

    const {
        dialogVisible,
        currentItem,
        editItem,
        saveItem,
        closeDialog,
        deleteItemApi,
        selectedItems,
        itemSelectionChange,
        selectionEmpty,
        deleteAllSelectedItems,
        isDeleting,
        addNewItem,
        createItem,
        newItemDialogVisible,
        isEditing,
    } = useWarehouseImportAction(langStore, fetchDataAndInitialize);

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);

    const editedItem = ref({});

    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    }

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
        if (selectedItem.value && selectedItem.value.import_time) {
            return formatDateTimeToDate(selectedItem.value.import_time);
        }
        return 'N/A';
    });

    const formattedTime = computed(() => {
        if (selectedItem.value && selectedItem.value.time) {
            return formatDateTimeToDate(selectedItem.value.time);
        }
        return 'N/A';
    });

    // Calculator Paginated Items for tab
    const paginatedItemsFlat = computed(() => {
      if (!Array.isArray(filteredItems.value)) return [];
      const start = (currentPageFlat.value - 1) * pageSizeFlat.value;
      const end = start + pageSizeFlat.value;

      return filteredItems.value.slice(start, end);
    });

    // Calculator Paginated Items for group tab
    const paginatedItemsGroup = computed(() => {
      if (!Array.isArray(groupedItems.value)) return [];
      const start = (currentPageGroup.value - 1) * pageSizeGroup.value;
      const end = start + pageSizeGroup.value;

      return groupedItems.value.slice(start, end);
    });

    const handleDelete = async (item) => {
      try {
        await ElMessageBox.confirm(
          `Bạn có chắc chắn muốn xóa hàng hóa có mã hàng hóa: ${item.part_no} không ?`,
          langStore.t('warning'),
          {
            confirmButtonText: langStore.t('delete'),
            cancelButtonText: langStore.t('cancel'),
            type: 'warning',
          }
        );
        await deleteItemApi(item);
        ElMessage({
          type: 'success',
          message: langStore.t('delete_success_message'),
        });
        fetchDataAndInitialize();
      } catch (e) {
        if (e === 'cancel') {
            ElMessage({
                type: 'info',
                message: langStore.t('delete_cancelled_message'),
            });
        } else if (e.message && e.message.startsWith('API Error')) {
             ElMessage({
                type: 'error',
                message: e.message,
            });
        }
      }
    };

    const {
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      openDownloadDialog,
      downloadFile: createDownloadLinkApi,
      confirmDownloadFile,
    } = useWarehouseImportDownload();

    const handleDownloadClick = () => {
      openDownloadDialog();
    };

    const handleCreateDownloadLink = (filterPayload) => {
      createDownloadLinkApi(filterPayload);
    };

    // Auto reload data
    let intervalId = null;
    const POLLING_INTERVAL = 30000; // 10 seconds
    onMounted(() => {
      // Thiết lập interval để gọi refreshData sau mỗi POLLING_INTERVAL
      intervalId = setInterval(() => {
        console.log(`Polling: làm mới dữ liệu sau mỗi ${POLLING_INTERVAL / 1000} giây...`);
        refreshData();
      }, POLLING_INTERVAL);
    });

    onUnmounted(() => {
      // Rất quan trọng: Xóa interval khi component bị hủy để tránh rò rỉ bộ nhớ
      if (intervalId) {
        clearInterval(intervalId);
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
      uniqueSeriNumber,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
      isDetailVisible,
      selectedItem,
      editedItem,
      showDetail,
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
      formattedImportTime,
      formattedTime,
      Delete,
      selectedProjectCode,
      productCodeOptions,
      loadingProductCode,
      remoteSearchProductCode,
      groupedItems,
      totalItemsForPagination,
      projectCodeOptions,
      loadingProjectCode,
      remoteSearchProjectCode,
      paginatedItemsFlat,
      paginatedItemsGroup,
      activeTab,
      currentPageFlat,
      pageSizeFlat,
      handleCurrentChangeFlat,
      handleSizeChangeFlat,
      currentPageGroup,
      pageSizeGroup,
      handleCurrentChangeGroup,
      handleSizeChangeGroup,
      selectedBrand,
      deleteItemApi,
      handleDelete,
      ElMessage,
      ElMessageBox,
      selectedImportId,
      downloadDialogVisible,
      downloadFileName,
      importIdOptions,
      loadingImportId,
      remoteSearchImportId,
      brandOptions,
      loadingBrand,
      remoteSearchBrand,
      selectedItems,
      itemSelectionChange,
      selectionEmpty,
      deleteAllSelectedItems,
      isDownloadPreparing,
      downloadFileUrl,
      handleDownloadClick,
      handleCreateDownloadLink,
      confirmDownloadFile,
      isDeleting,
      addNewItem,
      createItem,
      newItemDialogVisible,
      isEditing,
      Plus,
      FormNewitemPopupImport,
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
  overflow-y: hidden;
  overflow-x: hidden;
}
.header-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}
.filter-section {
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.action-filter {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
