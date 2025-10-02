<template>
  <div class="warehouse_management_container">
    <div v-if="isLoading" class="loading-message">
      {{ langStore.t('DataUploading') }}
    </div>
    <div v-else class="table-data">
      <div class="filter-section">
        <div class="action-area">
          <el-button type="success" class="warehouse-action-btn" :icon="UploadFilled">{{ langStore.t('BOMFileUpload') }}</el-button>
          <el-button type="primary" class="warehouse-action-btn" :icon="Printer">{{ langStore.t('FileExport') }}</el-button>
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
        <el-table-column fixed prop="ID" label="ID" width="80" />
        <el-table-column prop="product_name" label="Tên hàng hóa" width="auto" />
        <el-table-column prop="device_code" label="Mã hàng hóa" width="auto" />
        <el-table-column prop="brand" label="Hãng" width="auto" />
        <el-table-column prop="type" albel="Loại hàng hóa" width="auto" />
        <el-table-column prop="quantity" label="Số lượng" width="auto" />
        <el-table-column prop="series_number" label="Seri No." width="auto" />
        <el-table-column fixed="right" label="Hành động" min-width="auto">
          <template #default="scope">
            <el-button type="success" size="small" @click="showDetail(scope.row)" :icon="View">
              {{ langStore.t("DetailAct") }}
            </el-button>
            <el-button type="primary" size="small" @click="showEditForm(scope.row)" :icon="EditPen">{{
              langStore.t("EditAct")
            }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="filteredItems.length"
        :page-sizes="[5, 10, 20, 50]"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination-controls"
      >
      </el-pagination>
    </div>
    <detail-popup v-model="isDetailVisible" title="Chi tiết hàng hóa">
      <div v-if="selectedItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedItem.ID }}</el-descriptions-item>
          <el-descriptions-item label="Tên hàng hóa">{{ selectedItem.product_name }}</el-descriptions-item>
          <el-descriptions-item label="Mã hàng hóa">{{ selectedItem.device_code }}</el-descriptions-item>
          <el-descriptions-item label="Hãng">{{ selectedItem.brand }}</el-descriptions-item>
          <el-descriptions-item label="Số lượng">{{ selectedItem.quantity }}</el-descriptions-item>
          <el-descriptions-item label="Số Seri">{{ selectedItem.series_number }}</el-descriptions-item>
          <el-descriptions-item label="Vị trí">{{ selectedItem.location }}</el-descriptions-item>
          <el-descriptions-item label="Người nhập">{{ selectedItem.entered_by }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhập">{{ selectedItem.date_time }}</el-descriptions-item>
          <el-descriptions-item label="Loại">{{ selectedItem.type }}</el-descriptions-item>
          <el-descriptions-item label="Đơn vị">{{ selectedItem.unit }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </detail-popup>

    <form-popup 
      v-model="isEditVisible"
      title="Chỉnh sửa thông tin hàng hóa"
      @submit="handleFormSubmit"
    >
      <el-form :model="editedItem" label-width="150px">
        <el-form-item label="Tên hàng hóa">
          <el-input v-model="editedItem.product_name"></el-input>
        </el-form-item>
        <el-form-item label="Mã hàng hóa">
          <el-input v-model="editedItem.device_code"></el-input>
        </el-form-item>
        <el-form-item label="Hãng">
          <el-input v-model="editedItem.brand"></el-input>
        </el-form-item>
        <el-form-item label="Số lượng">
          <el-input v-model="editedItem.quantity"></el-input>
        </el-form-item>
        <el-form-item label="Số seri">
          <el-input v-model="editedItem.series_number"></el-input>
        </el-form-item>
        <el-form-item label="Vị trí">
          <el-input v-model="editedItem.location"></el-input>
        </el-form-item>
        <el-form-item label="Loại hàng hóa">
          <el-input v-model="editedItem.type"></el-input>
        </el-form-item>
      </el-form>
    </form-popup>
  </div>
</template>

<script>
import { ref } from "vue";
import { useLanguageStore } from "../../../stores/language";
import { EditPen, Printer, UploadFilled, View } from "@element-plus/icons-vue";
import DetailPopup from "../../../components/popup/DetailPopup.vue";
import FormPopup from "../../../components/popup/FormPopup.vue";
import { useWarehouseManagementDatas } from "../../../composables/Warehouse/useWarehouseManagmentDatas";

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
    FormPopup,
    UploadFilled,
    Printer,
  },
  setup() {
    const langStore = useLanguageStore();
    const { 
      filteredItems,
      fetchDataAndInitialize,
      emptyData, paginatedItems,
      selectedProductCode,
      selectedProductSeriNum,
      uniqueProductCode,
      uniqueProductSeriNum,
      pageSize,
      currentPage,
      applyFilters,
      isLoading,
    } = useWarehouseManagementDatas();

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
      filteredItems,
      fetchDataAndInitialize,
      emptyData,
      paginatedItems,
      selectedProductCode,
      selectedProductSeriNum,
      uniqueProductCode,
      handleCurrentChange,
      uniqueProductSeriNum,
      pageSize,
      currentPage,
      handleSizeChange,
      applyFilters,
      isLoading,
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
</style>
