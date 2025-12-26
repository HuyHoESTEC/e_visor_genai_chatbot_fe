<template>
  <div class="installation-devices-management-container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t("DataUploading") }}
    </div>

    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button
            type="success"
            v-on:click="handleUploadFile"
            class="warehouse-action-btn"
            plain
            :icon="UploadFilled"
          >
            {{ langStore.t("uploadTemplateButton") }}
          </el-button>

          <el-button
            type="warning"
            v-on:click="handleUploadDesignClick"
            class="warehouse-action-btn"
            plain
            :icon="Cpu"
          >
            Tải lên thiết kế thi công
          </el-button>

          <el-button type="primary" :icon="Plus" plain v-on:click="addNewItem">
            {{ langStore.t("addNewProductButton") }}
          </el-button>

          <el-button type="danger" v-on:click="handleDownloadClick" plain :icon="Download">
            {{ langStore.t("downloadButton") }}
          </el-button>

           <el-button
            type="warning"
            @click="refreshData"
            class="add-task-button"
            :icon="Refresh"
            plain
            circle
          />

          <el-button
            type="danger"
            v-if="!selectionEmpty || isDeleting"
            v-on:click="deleteAllSelectedItems"
            plain
            :icon="Delete"
            :loading="isDeleting"
          >
            {{ langStore.t("deleteSelectedButton") }} ({{ selectedItems.length }})
          </el-button>
        </div>

        <div class="action-filter">
          <el-select
            v-model="selectedProductCode"
            :placeholder="langStore.t('filterByProductCodePlaceholder')"
            clearable
            @change="applyFilters"
            filterable
            remote
            :remote-method="remoteSearchProductCode"
            :loading="loadingProductCode"
          >
            <el-option
              v-for="productCode in productCodeOptions"
              :key="productCode.id"
              :label="productCode.name"
              :value="productCode.id"
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
            :remote-method="remoteSearchLocation"
            :loading="loadingLocaction"
          >
            <el-option
              v-for="locationItem in locationOptions"
              :key="locationItem.id"
              :label="locationItem.name"
              :value="locationItem.id"
            />
          </el-select>

          <el-select
            v-model="selectedMd"
            :placeholder="langStore.t('filterByMDPlaceholder')"
            clearable
            @change="applyFilters"
            class="barcode-select"
            filterable
            remote
            :remote-method="remoteSearchMD"
            :loading="loadingMD"
          >
            <el-option
              v-for="mdVal in mdOptions"
              :key="mdVal.id"
              :label="mdVal.name"
              :value="mdVal.id"
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
              v-for="projectCodeVal in projectCodeOptions"
              :key="projectCodeVal.id"
              :label="projectCodeVal.name"
              :value="projectCodeVal.id"
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
              v-for="statusVal in uniqueStatus"
              :key="statusVal.id"
              :label="getInstallationStatusName(statusVal.id)"
              :value="statusVal.id"
            />
          </el-select>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="export-data-tabs" type="border-card">
        <el-tab-pane :label="langStore.t('flatListTabLabel')" name="flat">
          <flat-list-table
            v-if="activeTab === 'flat'"
            :data="filterdInstallationItems"
            :total-items="filterdInstallationItems.length"
            :status-formatter="statusFormatter"
            v-model:current-page="currentPageStatus"
            v-model:page-size="pageSizeStatus"
            @view-detail="showDetail"
            @edit-item="editItem"
            @delete-item="handleDelete"
            @selection-change="handleSelectionChange"
          />
        </el-tab-pane>

        <el-tab-pane :label="langStore.t('groupedByMDTabLabel')" name="expand">
          <project-m-d-group-table
            v-if="activeTab === 'expand'"
            :all-items="filterdInstallationItems"
            @view-detail="showDetail"
            @edit-item="editItem"
            @delete-item="handleDelete"
          />
        </el-tab-pane>
      </el-tabs>

      <detail-popup v-model="isDetailVisible" :title="langStore.t('detailPopupTitle')">
        <div v-if="selectedItem">
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="langStore.t('detailHigherLeverFunction')">{{
              selectedItem.higher_lever_function
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailProjectCodeLabel')">{{
              selectedItem.project_code
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailManufacturerLabel')">{{
              selectedItem.manufacturer
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailDescriptionLabel')">{{
              selectedItem.description
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailQuantityLabel')">{{
              selectedItem.quantity
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailSeriNumberLabel')">{{
              selectedItem.seri_number
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailLocationLabel')">{{
              selectedItem.location
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailDT')">{{
              selectedItem.dt
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailHeaderCabinetNo')">{{
              selectedItem.cabinet_no
            }}</el-descriptions-item>
            <el-descriptions-item :label="langStore.t('detailStatusLabel')">{{
              statusFormatter(null, null, selectedItem.status, null)
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

      <installation-data-edit-dialog
        v-model="dialogVisible"
        :item-to-edit="currentItem"
        @save="saveItem"
        @close="closeDialog"
      />

      <form-new-item-popup
        v-model="newItemDialogVisible"
        :current-item="currentItem"
        :is-editing="isEditing"
        @close="closeDialog"
        @save="createItem"
      />
    </div>

    <warehouse-export-upload
      v-model="uploadDialogVisible"
      @uploadSuccess="handleUploadSuccess"
    />

    <download-filter-dialog
      v-model="downloadDialogVisible"
      :download-url="downloadFileUrl"
      :file-name="downloadFileName"
      :is-preparing="isDownloadPreparing"
      @create-download-link="handleCreateDownloadLink"
      @confirm-download="confirmDownloadFile"
    />

    <file-url-uploading-dialog 
        v-model="isConstructionUploadDialogVisible"
        title="Tải lên tài liệu thiết kế thi công"    
        accept=".xlsx"
        :upload-function="uploadDesignFile"
        :max-file-size-mb="10"
        downloadUrlText="Tải xuống Tệp Thiết kế thi công"
        tipText="Chấp nhận tệp .xlsx cho thiết kế thi công"
        @uploadSuccess="handleDesignUploadSuccess"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import DownloadFilterDialog from "../../../components/dialog/DownloadFilterDialog.vue";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import FormNewItemPopup from "../../../components/popup/FormNewItemPopup.vue";
import FlatListTable from "../../../components/table/warehouse_installation/FlatListTable.vue";
import ProjectMDGroupTable from "../../../components/table/warehouse_installation/ProjectMDGroupTable.vue";
import WarehouseExportUpload from "../../../components/upload/WarehouseExportUpload.vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseExportAction } from "../../../composables/Warehouse_Export/useWarehouseExportAction";
import { useWarehouseExportDownload } from "../../../composables/Warehouse_Export/useWarehouseExportDownload";
import { useBarcodeLogic } from "../../../composables/utils/useBarcodeLogic";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Cpu,
  Delete,
  Download,
  EditPen,
  Plus,
  Printer,
  Refresh,
  UploadFilled,
  View,
} from "@element-plus/icons-vue";
import FileUrlUploadingDialog from "../../../components/upload/FileUrlUploadingDialog.vue";
import { useUploadConstructionDesign } from "../../../composables/Warehouse_Export/useUploadConstructionDesign";
import { useWarehouseInstallationPartManagement } from "../../../composables/Warehouse/Installation_Part/useWarehouseInstallationPartManagement";
import InstallationDataEditDialog from "../../../components/dialog/Warehouse/Installation/installationDataEditDialog.vue";

export default {
  name: "InstallationDevicesManagement",
  components: {
    Download,
    View,
    UploadFilled,
    Printer,
    EditPen,
    Refresh,
    Delete,
    Plus,
    DetailPopup,
    WarehouseExportUpload,
    DownloadFilterDialog,
    FormNewItemPopup,
    FlatListTable,
    ProjectMDGroupTable,
    FileUrlUploadingDialog,
    InstallationDataEditDialog,
  },
  setup() {
    const langStore = useLanguageStore();
    const activeTab = ref("flat");

    const {
      filterdInstallationItems,
      fetchDataInstallationAndInitialize,
      emptyInstallationVal,
      applyFilters,
      isLoading,
      selectedLocationCode,
      selectedProductCode,
      selectedProjectCode,
      selectedStatus,
      selectedMd,
      productCodeOptions,
      projectCodeOptions,
      locationOptions,
      mdOptions,
      uniqueStatus,
      loadingProductCode,
      loadingProjectCode,
      loadingMD,
      loadingLocaction,
      remoteSearchLocation,
      remoteSearchProductCode,
      remoteSearchProjectCode,
      remoteSearchMD,
    } = useWarehouseInstallationPartManagement();

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
    } = useWarehouseExportAction(langStore, fetchDataInstallationAndInitialize);

    const {
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      openDownloadDialog,
      downloadFile: createDownloadLinkApi,
      confirmDownloadFile,
    } = useWarehouseExportDownload();

    const isDetailVisible = ref(false);
    const selectedItem = ref(null);
    const { barcodeRef, generatedBarcode, downloadBarcodeSvg } = useBarcodeLogic(
      selectedItem,
      isDetailVisible
    );

    const currentPageStatus = ref(1);
    const pageSizeStatus = ref(10);

    const showDetail = (item) => {
      selectedItem.value = item;
      isDetailVisible.value = true;
    };

    const uploadDialogVisible = ref(false);
    const handleUploadFile = () => {
      uploadDialogVisible.value = true;
    };
    const handleUploadSuccess = () => {
      fetchDataInstallationAndInitialize();
    };

    const refreshData = () => {
      fetchDataInstallationAndInitialize();
    };

    const handleDownloadClick = () => {
      openDownloadDialog();
    };
    const handleCreateDownloadLink = (filterPayload) => {
      createDownloadLinkApi(filterPayload);
    };

    const handleDelete = async (item) => {
      try {
        await ElMessageBox.confirm(
          `Bạn có chắc chắn muốn xóa hàng hóa có mã hàng hóa: ${item.part_no} không ?`,
          langStore.t("warning"),
          {
            confirmButtonText: langStore.t("delete"),
            cancelButtonText: langStore.t("cancel"),
            type: "warning",
          }
        );
        await deleteItemApi(item);
        ElMessage({ type: "success", message: langStore.t("delete_success_message") });
        fetchTableDataInstallation();
      } catch (e) {
        // Resolve error
      }
    };

    const handleSelectionChange = (selection) => {
      itemSelectionChange(selection);
    };

    const getInstallationStatusName = (statusValue) => {
      if (statusValue === 0) return "Đã lắp đặt";
      if (statusValue === 1) return "Chưa lắp đặt";
      return "Không xác định";
    };

    const statusFormatter = (row, column, cellValue) => {
      return getInstallationStatusName(cellValue);
    };

    const isConstructionUploadDialogVisible = ref(false);
    const uploadedDesignUrl = ref("");

    const {
      isUploading: isDesignUploading,
      uploadFile: uploadDesignFile,
    } = useUploadConstructionDesign();

    const handleUploadDesignClick = () => {
      uploadedDesignUrl.value = "";
      isConstructionUploadDialogVisible.value = true;
    };

    const handleDesignUploadSuccess = (url) => {
      uploadedDesignUrl.value = url;
    };

    return {
      // Icons
      Download,
      View,
      UploadFilled,
      Printer,
      EditPen,
      Refresh,
      Delete,
      Plus,

      // Store & State
      langStore,
      activeTab,
      isLoading,
      emptyInstallationVal,
      filterdInstallationItems, // Dữ liệu chính truyền xuống components con

      // Filters Models & Options
      selectedProductCode,
      selectedLocationCode,
      selectedProjectCode,
      selectedStatus,
      selectedMd,
      productCodeOptions,
      projectCodeOptions,
      locationOptions,
      mdOptions,
      uniqueStatus,
      loadingProductCode,
      loadingProjectCode,
      loadingLocaction,
      loadingMD,

      // Filter Functions
      applyFilters,
      remoteSearchProductCode,
      remoteSearchProjectCode,
      remoteSearchLocation,
      remoteSearchMD,
      getInstallationStatusName,
      statusFormatter,
      fetchDataInstallationAndInitialize,

      // Actions
      refreshData,
      handleUploadFile,
      handleUploadSuccess,
      uploadDialogVisible,
      handleDownloadClick,
      downloadDialogVisible,
      downloadFileName,
      downloadFileUrl,
      isDownloadPreparing,
      handleCreateDownloadLink,
      confirmDownloadFile,
      addNewItem,
      newItemDialogVisible,
      createItem,
      handleDelete,
      deleteAllSelectedItems,
      isDeleting,
      selectionEmpty,
      selectedItems,
      handleSelectionChange,

      // Detail & Edit Dialogs
      showDetail,
      isDetailVisible,
      selectedItem,
      dialogVisible,
      currentItem,
      editItem,
      saveItem,
      closeDialog,
      isEditing,

      // Barcode
      generatedBarcode,
      barcodeRef,
      downloadBarcodeSvg,
      currentPageStatus,
      pageSizeStatus,

      isConstructionUploadDialogVisible,
      uploadDesignFile,
      handleUploadDesignClick,
      handleDesignUploadSuccess,
      uploadedDesignUrl,
      Cpu,
    };
  },
};
</script>

<style>
.installation-devices-management-container {
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
