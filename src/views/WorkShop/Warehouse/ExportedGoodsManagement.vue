<template>
  <div class="imported-goods-managment-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t("DataUploading") }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" v-on:click="handleUploadFile" class="warehouse-action-btn" :icon="UploadFilled">{{ langStore.t("uploadTemplateButton") }}</el-button>
          <el-button type="danger" v-on:click="handleDownloadClick" :icon="Download">{{ langStore.t("downloadButton") }}</el-button>
          <el-button type="primary" :icon="Plus" v-on:click="addNewItem">Thêm sản phẩm mới</el-button>          
          <el-button type="warning" v-on:click="refreshData" class="add-task-button" :icon="Refresh" plain circle />
          <el-button type="danger" v-if="!selectionEmpty || isDeleting" v-on:click="deleteAllSelectedItems" :icon ="Delete" :loading="isDeleting">Xóa Đã Chọn ({{ selectedItems.length }})</el-button>
        </div>
        <div class="action-filter">
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
            v-model="selectedLocationCode"
            :placeholder="langStore.t('filterByLocationCodePlaceholder')"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchLoaction"
            :loading="loadingLocaction"
          >
            <el-option
              v-for="barcode in locationOptions"
              :key="barcode.id"
              :label="barcode.name"
              :value="barcode.id"
            />
          </el-select>
          <el-select
            v-model="selectedMD"
            placeholder="Lọc theo mã MD"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchMD"
            :loading="loadingMD"
          >
            <el-option
              v-for="barcode in mdOptions"
              :key="barcode.id"
              :label="barcode.name"
              :value="barcode.id"
            />
          </el-select>
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
            v-model="selectedStatus"
            :placeholder="langStore.t('filterByStatusNumberPlaceholder')"
            clearable
            @change="applyFilters"
            class="barcode-select"
          >
            <el-option
              v-for="barcode in uniqueStatus"
              :key="barcode.id"
              :label="getInstallationStatusName(barcode.id)"
              :value="barcode.id"
            />
          </el-select>
          <!-- <el-date-picker 
              v-model="selectedImportDate"
              type="date"
              placeholder="Lọc theo ngày nhập phiếu"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              clearable
              @change="applyFilters"
              style="width: 100%;"
          /> -->
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
                        <el-empty description="No Data" />
                    </div>
                </template>
                <el-table-column type="selection" width="55" />
                <el-table-column prop="higher_lever_function" :label="langStore.t('tableHigherLeverFunction')" width="auto" />
                <el-table-column prop="location" :label="langStore.t('tableHeaderLocation')" width="auto" />
                <el-table-column prop="dt" :label="langStore.t('tableDT')" width="auto" />
                <el-table-column prop="quantity" :label="langStore.t('tableHeaderQuantity')" width="auto" />
                <el-table-column prop="description" :label="langStore.t('tableHeaderDescription')" width="auto" />
                <el-table-column prop="part_no" :label="langStore.t('tableHeaderPartNo')" width="auto" />
                <el-table-column prop="seri_number" :label="langStore.t('tableHeaderSeriNumber')" width="auto" />
                <el-table-column prop="manufacturer" :label="langStore.t('tableHeaderManufacturer')" width="auto" />                                                      
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

        <el-tab-pane label="Danh sách tủ điện" name="expand">
          <!-- Class 1 -->
          <el-table
            :data="paginatedMDGroup"
            border
            style="width: 100%;"
            stripe
            class="items-table"
            height="calc(100vh - 321px)"
            row-key="cabinet_no"
            :expand-row-keys="expandedMDKeys"
            @expand-change="handleMDExpandChange"
          >
            <template #empty>
                <div v-if="emptyData" class="empty-data-message">
                    <el-empty :description="langStore.t('NoData')" />
                </div>
            </template>
            <el-table-column type="expand">
              <!-- Class 2 -->
              <template #default="{ row: mdGroup }">
                <div style="padding: 0 20px; background-color: #2C2C6A;">
                  <h4 style="color: white !important;">Danh sách tủ thuộc mã dãy: {{ mdGroup.cabinet_no }}</h4>
                  <el-table
                    :data="paginatedItemsGroup"
                    border
                    style="width: 100%;"
                    stripe
                    class="items-table"
                    height="calc(100vh - 297px)"
                    row-key="location"
                    :expand-row-keys="locationExpandedKeys"
                    @expand-change="handleLocationExpandChange"
                  >
                    <template #empty>
                        <div v-if="emptyData" class="empty-data-message">
                            <el-empty :description="langStore.t('NoData')" />
                        </div>
                    </template>
                    <el-table-column type="expand">
                      <!-- Class 3 -->
                      <template #default="{ row: locationGroup }">
                        <div style="padding: 0 20px; background-color: #8383A3;">
                          <h4 style="color: white !important;">Chi tiết hàng hóa thuộc tủ: {{ locationGroup.location }}</h4>
                          <el-table :data="getPaginatedChildItems(locationGroup)" border size="small">
                                <el-table-column prop="id" label="ID" width="auto" />
                                <el-table-column prop="higher_lever_function" label="Higher Level Function" width="auto" />
                                <el-table-column prop="location" label="Mã tủ" width="auto" />
                                <el-table-column prop="dt" label="DT" width="auto" />
                                <el-table-column prop="quantity" label="Số lượng" width="120" />
                                <el-table-column prop="description" label="Mô tả" width="auto" />
                                <el-table-column prop="part_no" label="Mã hàng hóa" width="auto" />
                                <el-table-column prop="seri_number" label="Seri No." width="auto" />
                                <el-table-column prop="manufacturer" label="Hãng" width="auto" />
                                <el-table-column fixed="right" :label="langStore.t('tableHeaderAction')" min-width="auto">
                                  <template #default="{ row }">
                                      <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
                                      <!-- <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" plain circle /> -->
                                      <!-- <el-button type="danger" size="default" @click="handleDelete(row)" :icon="Delete" plain circle /> -->
                                  </template>
                                </el-table-column>
                            </el-table>
                            <el-pagination
                                  layout="prev, pager, next, sizes, total"
                                  :total="locationGroup.items.length" 
                                  :page-sizes="[5, 10, 20, 50, 100]"
                                  :page-size="itemPaginationState[locationGroup.location]?.pageSize || 10"
                                  :current-page="itemPaginationState[locationGroup.location]?.currentPage ||1"
                                  @size-change="val => handleItemSizeChangeGroup(val, locationGroup)"
                                  @current-change="val => handleItemCurrentChangeGroup(val, locationGroup)"
                                  class="pagination-controls"
                              >
                            </el-pagination>   
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="location" label="Mã tủ" min-width="600" sortable />                   
                  </el-table>
                  <el-pagination
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
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="cabinet_no" label="MD" min-width="600" sortable />
          </el-table>
          <el-pagination
              background
              layout="prev, pager, next, sizes, total"
              :total="totalMDForPagination" 
              :page-sizes="[5, 10, 20, 50, 100]"
              v-model:page-size="pageSizeMD"
              v-model:current-page="currentPageMD"
              @size-change="handleSizeChangeMD"
              @current-change="handleCurrentChangeMD"
              class="pagination-controls"
          >
          </el-pagination>
        </el-tab-pane> 

        <el-tab-pane :label="langStore.t('groupedByStatusTabLabel')" name="Status">
            <el-table
                :data="paginatedStatusGroup"
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
                    <template #default="{ row: statusGroup }">
                        <div style="padding: 0 20px;">
                            <h4 style="color: black !important;">{{ langStore.t('detailGroupStatusTitle') }} {{ getInstallationStatusName(statusGroup.status) }}</h4>
                            <el-table :data="statusGroup.items" border size="small">
                                <el-table-column prop="id" :label="langStore.t('detailIdLabel')" width="auto" />
                                <el-table-column prop="project_code" :label="langStore.t('tableHeaderProjectCode')" width="auto" />
                                <el-table-column prop="part_no" :label="langStore.t('tableHeaderPartNo')" width="auto" />
                                <el-table-column prop="manufacturer" :label="langStore.t('detailOriginLabel')" width="auto" />
                                <el-table-column prop="description" :label="langStore.t('detailDescriptionLabel')" width="auto" />
                                <el-table-column prop="quantity" :label="langStore.t('tableHeaderQuantity')" width="120" />
                                <el-table-column prop="seri_number" :label="langStore.t('tableHeaderSeriNumber')" width="auto" />
                                <el-table-column fixed="right" :label="langStore.t('tableHeaderAction')" min-width="auto">
                                  <template #default="{ row }">
                                      <el-button type="success" size="default" @click="showDetail(row)" :icon="View" plain circle />
                                      <!-- <el-button type="primary" size="default" @click="editItem(row)" :icon="EditPen" plain circle /> -->
                                      <!-- <el-button type="danger" size="default" @click="handleDelete(row)" :icon="Delete" plain circle :disabled="true" /> -->
                                  </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="status" :label="langStore.t('tableHeaderStatus')" min-width="600" sortable :formatter="statusFormatter" />
            </el-table>
            <el-pagination
                background
                layout="prev, pager, next, sizes, total"
                :total="totalStatusForPagination" 
                :page-sizes="[5, 10, 20, 50, 100]"
                v-model:page-size="pageSizeStatus"
                v-model:current-page="currentPageStatus"
                @size-change="handleSizeChangeStatus"
                @current-change="handleCurrentChangeStatus"
                class="pagination-controls"
            >
          </el-pagination>
        </el-tab-pane>

      </el-tabs>

      <detail-popup v-model="isDetailVisible" :title="langStore.t('detailPopupTitle')">
        <div v-if="selectedItem">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="langStore.t('detailHigherLeverFunction')">{{ selectedItem.higher_lever_function }}</el-descriptions-item>
  \         <el-descriptions-item :label="langStore.t('detailProjectCodeLabel')">{{ selectedItem.project_code }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailManufacturerLabel')">{{ selectedItem.manufacturer }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailDescriptionLabel')">{{ selectedItem.description }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailQuantityLabel')">{{ selectedItem.quantity }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailSeriNumberLabel')">{{ selectedItem.seri_number }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailLocationLabel')">{{ selectedItem.location }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailDT')">{{ selectedItem.dt }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailHeaderCabinetNo')">{{ selectedItem.cabinet_no }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailStatusLabel')">{{ statusFormatter(null, null, selectedItem.status, null) }}</el-descriptions-item>
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
    <warehouse-export-data-dialog 
      v-model="dialogVisible"
      :item-to-edit="currentItem"
      @save="saveItem"
      @close="closeDialog"
    />
    <FormNewItemPopup
      v-model="newItemDialogVisible"
      :currentItem="currentItem"
      :isEditing="isEditing"
      @close="closeDialog"
      @save="createItem"
    />
    </div>
    <WarehouseExportUpload 
        v-model="uploadDialogVisible"
        @uploadSuccess="handleUploadSuccess"
    />
    <DownloadFilterDialog
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
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import { useWarehouseExportDatas } from "../../../composables/Warehouse_Export/useWarehouseExportDatas";
import { useWarehouseExportAction } from "../../../composables/Warehouse_Export/useWarehouseExportAction";
import WarehouseExportUpload from "../../../components/upload/WarehouseExportUpload.vue";
import WarehouseExportDataDialog from "../../../components/dialog/WarehouseExportDataDialog.vue";
import { useBarcodeLogic } from "../../../composables/utils/useBarcodeLogic";
import { useDateFormat } from "../../../composables/utils/useDateFormat";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWarehouseExportDownload } from "../../../composables/Warehouse_Export/useWarehouseExportDownload";
import DownloadFilterDialog from "../../../components/dialog/DownloadFilterDialog.vue";
import FormNewItemPopup from "../../../components/popup/FormNewItemPopup.vue";

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
    WarehouseExportDataDialog,
    DownloadFilterDialog,
    FormNewItemPopup,
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

    // Khai báo ref và hàm phân trang riêng cho Tab Status
    const currentPageStatus = ref(1);
    const pageSizeStatus = ref(10);
    const handleCurrentChangeStatus = (val) => { currentPageStatus.value = val; };
    const handleSizeChangeStatus = (val) => { pageSizeStatus.value = val; currentPageStatus.value = 1; };

    // Khai báo ref và hàm phân trang riêng cho tab MD
    const currentPageMD = ref(1);
    const pageSizeMD = ref(10);
    const handleCurrentChangeMD = (val) => { currentPageMD.value = val; };
    const handleSizeChangeMD = (val) => { pageSizeMD.value = val; currentPageMD.value = 1; };

    const {
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      selectedLocationCode,
      selectedProductCode,
      selectedSeriNumber,
      selectedStatus,
      uniqueStatus,
      pageSize, // Keep for filter, but do not use for UI pagination
      currentPage,
      applyFilters,
      isLoading,
      selectedImportDate,
      productCodeOptions,
      loadingProductCode,
      loadingManufacturer,
      remoteSearchProductCode,
      remoteSearchProjectCode,
      selectedProjectCode,
      totalItemsForPagination,
      totalStatusForPagination,
      totalMDForPagination,
      groupedItems,
      groupedMD,
      groupedStatus,
      projectCodeOptions,
      loadingProjectCode,
      selectedBrand,
      selectedExportId,
      exportIdOptions,
      loadingExportId,
      remoteSearchExportId,
      remoteSearchLocation,
      brandOptions,
      loadingBrand,
      remoteSearchBrand,
      manuFacturerOptions,
      remoteSearchLoaction,
      loadingLocaction,
      locationOptions,
      selectedMD,
      remoteSearchMD,
      loadingMD,
      mdOptions,
    } = useWarehouseExportDatas();

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
        isEditing,
        addNewItem,
        newItemDialogVisible,
        createItem,
    } = useWarehouseExportAction(langStore, fetchDataAndInitialize);

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
    
    const paginatedMDGroup = computed(() => {
      if (!Array.isArray(groupedMD.value)) return [];
      const start = (currentPageMD.value - 1) * pageSizeMD.value;
      const end = start + pageSizeMD.value;

      return groupedMD.value.slice(start, end);
    });
    
    const paginatedStatusGroup = computed(() => {
      if (!Array.isArray(groupedStatus.value)) return [];
      const start = (currentPageStatus.value - 1) * pageSizeStatus.value;
      const end = start + pageSizeStatus.value;

      return groupedStatus.value.slice(start, end);
    });
    
    const handleDelete = async (item) => {
      try {
        await ElMessageBox.confirm(
          `Bạn có chắc chắn muốn xóa hàng hóa có mã hàng hóa: ${item.part_no} không ?`,
          'Cảnh báo',
          {
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            type: 'warning',
          }
        );
        await deleteItemApi(item);
        ElMessage({
          type: 'success',
          message: 'Xóa hàng hóa thành công',
        });
        fetchDataAndInitialize();
      } catch (e) {
        if (e === 'cancel') {
            ElMessage({
                type: 'info',
                message: 'Đã hủy thao tác xóa.',
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
    } = useWarehouseExportDownload();

    const handleDownloadClick = () => {
      openDownloadDialog();
    };

    const handleCreateDownloadLink = (filterPayload) => {
      createDownloadLinkApi(filterPayload);
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

    const handleSelectionChange = (selection) => {
    selectedItems.value = selection;
    };

    const expandedMDKeys = ref([]); 

    const handleMDExpandChange = (row, expandedRows) => {
        if (expandedRows.length > 0) {
          expandedMDKeys.value = [row.cabinet_no];
        } else {
          expandedMDKeys.value = [];
        }
    };

    const locationExpandedKeys = ref([]);

    const handleLocationExpandChange = (row, expandedRows) => {
      if (expandedRows.length > 0) {
          locationExpandedKeys.value = [row.location]; 
      } else {
          locationExpandedKeys.value = [];
      }
    };
    // let intervalId = null;
    // const POLLING_INTERVAL = 30000; // 30 seconds
    // onMounted(() => {
    //   // Thiết lập interval để gọi refreshData sau mỗi POLLING_INTERVAL
    //   intervalId = setInterval(() => {
    //     console.log(`Polling: làm mới dữ liệu sau mỗi ${POLLING_INTERVAL / 1000} giây...`);
    //     refreshData();
    //   }, POLLING_INTERVAL);
    // });

    // onUnmounted(() => {
    //   // Rất quan trọng: Xóa interval khi component bị hủy để tránh rò rỉ bộ nhớ
    //   if (intervalId) {
    //     clearInterval(intervalId);
    //   }
    // });

    const itemPaginationState = ref({});

    const getPaginatedChildItems = (locationGroup) => {
      const locationVal = locationGroup.location;
      if (!itemPaginationState.value[locationVal]) {
        itemPaginationState.value[locationVal] = {
          currentPage: 1,
          pageSize: 10,
        };
      }

      const state = itemPaginationState.value[locationVal];
      const allItems = locationGroup.items;

      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return allItems.slice(start, end);
    };
    
    const handleItemSizeChangeGroup = (val, locationGroup) => {
      const locationVal = locationGroup.location;
      if (itemPaginationState.value[locationVal]) {
        itemPaginationState.value[locationVal].pageSize = val;
        itemPaginationState.value[locationVal].currentPage = 1;
      }
    };

    const handleItemCurrentChangeGroup = (val, locationGroup) => {
      const locationVal = locationGroup.location;
      if (itemPaginationState.value[locationVal]) {
        itemPaginationState.value[locationVal].currentPage = val;
      }
    };

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
      selectedProductCode,
      selectedLocationCode,
      selectedSeriNumber,
      selectedStatus,
      pageSize,
      uniqueStatus,
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
      loadingManufacturer,
      remoteSearchProductCode,
      remoteSearchProjectCode,
      totalItemsForPagination,
      totalStatusForPagination,
      totalMDForPagination,
      groupedItems,
      groupedStatus,
      paginatedItemsFlat,
      paginatedStatusGroup,
      paginatedItemsGroup,
      paginatedMDGroup,
      currentPageFlat,
      pageSizeFlat,
      handleCurrentChangeFlat,
      handleSizeChangeFlat,
      currentPageGroup,
      pageSizeGroup,
      handleCurrentChangeGroup,
      handleSizeChangeGroup,
      currentPageStatus,
      pageSizeStatus,
      handleCurrentChangeStatus,
      handleSizeChangeStatus,
      activeTab,
      projectCodeOptions,
      loadingProjectCode,
      selectedBrand,
      deleteItemApi,
      handleDelete,
      ElMessage,
      ElMessageBox,
      selectedExportId,
      confirmDownloadFile,
      exportIdOptions,
      loadingExportId,
      remoteSearchExportId,
      remoteSearchLocation,
      brandOptions,
      loadingBrand,
      remoteSearchBrand,
      getInstallationStatusName,
      statusFormatter,
      manuFacturerOptions,
      remoteSearchLoaction,
      loadingLocaction,
      locationOptions,
      selectedItems,
      groupedMD,
      currentPageMD,
      pageSizeMD,
      handleCurrentChangeMD,
      handleSizeChangeMD,
      expandedMDKeys,
      handleMDExpandChange,
      getPaginatedChildItems,
      handleItemSizeChangeGroup,
      handleItemCurrentChangeGroup,
      itemPaginationState,
      locationExpandedKeys,
      handleLocationExpandChange,
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      handleDownloadClick,
      handleCreateDownloadLink,
      confirmDownloadFile,
      selectedMD,
      remoteSearchMD,
      loadingMD,
      mdOptions,
      itemSelectionChange,
      selectionEmpty,
      deleteAllSelectedItems,
      isDeleting,
      isEditing,
      Plus,
      addNewItem,
      newItemDialogVisible,
      createItem,
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

.action-area {
  justify-content: start;
  display: flex;
  flex-direction: row;
  align-self: baseline;
}

h4 {
  padding-top: 5px;
  color: white;
}

.items-table {
  display: flex;
  gap: 2px;
}
</style>
