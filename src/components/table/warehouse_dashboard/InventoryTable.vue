<template>
  <div class="inventory-table-container">
    <div class="action-filter">
      <el-select
        v-model="localSelectedProductCode"
        :placeholder="langStore.t('filterByProductCodePlaceholder')"
        clearable
        filterable
        remote
        :remote-method="remoteSearchProductCode"
        :loading="loadingProductCode"
        @change="handleFilterChange"
        style="width: 100%"
        class="barcode-select"
      >
        <el-option
          v-for="item in productCodeOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          style="width: 100%"
        />
      </el-select>

      <el-select
        v-model="selectedBrand"
        :placeholder="langStore.t('filterByBrandPlaceholder')"
        clearable
        @change="handleFilterChange"
        style="width: 100%"
        class="barcode-select"
      >
        <el-option
          v-for="barcode in uniqueBrand"
          :key="barcode.id"
          :label="barcode.name"
          :value="barcode.id"
        />
      </el-select>

      <el-date-picker
        v-model="selectedDashboardDate"
        type="date"
        :placeholder="langStore.t('FilterByImportDate')"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        clearable
        @change="handleFilterChange"
        style="width: 100%"
      />
    </div>

    <el-table
      :data="paginatedItems"
      border
      stripe
      class="items-table"
      style="width: 100%; height: calc(100vh - 330px)"
      row-key="part_no"
      :expand-row-keys="expandedRowKeys"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row: productGroup }">
          <div style="padding: 0 20px">
            <h4 style="color: black !important">
              {{ langStore.t('productGroupDetailTitle') }}: {{ productGroup.part_no }}
            </h4>
            <el-table
              :data="getPaginatedChildItems(productGroup)"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column fixed prop="id" label="ID" width="80" sortable />
              <el-table-column prop="product_name" :label="langStore.t('itemNameColumn')" width="auto" />
              <el-table-column prop="part_no" :label="langStore.t('itemPartNoColumn')" width="auto" />
              <el-table-column prop="origin" :label="langStore.t('brandColumn')" width="auto" />
              <el-table-column prop="quantity_import" :label="langStore.t('detailImportQuantityLabel')" width="auto" />
              <el-table-column prop="quantity_export" :label="langStore.t('detailExportQuantityLabel')" width="auto" />
              <el-table-column prop="quantity_stock" :label="langStore.t('detailStockQuantityLabel')" width="auto" />
              <el-table-column prop="seri_number" :label="langStore.t('detailSeriNumberLabel')" width="auto" />
              
              <el-table-column fixed="right" :label="langStore.t('JobAction')" min-width="120">
                <template #default="{ row }">
                  <el-button type="success" size="small" plain circle :icon="View" @click="$emit('view-detail', row)" />
                  <!-- <el-button type="primary" size="small" plain circle :icon="EditPen" @click="$emit('edit-detail', row)" />
                  <el-button type="danger" size="small" plain circle :icon="Delete" @click="$emit('detete-detail', row)" /> -->
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              background
              layout="prev, pager, next, sizes, total"
              :total="productGroup.items.length"
              :page-sizes="[5, 10, 20, 50, 100]"
              :page-size="getChildPageSize(productGroup.part_no)"
              :current-page="getChildCurrentPage(productGroup.part_no)"
              @size-change="(val) => handleChildSizeChange(val, productGroup)"
              @current-change="(val) => handleChildCurrentChange(val, productGroup)"
              class="pagination-controls"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="part_no" :label="langStore.t('itemPartNoColumn')" min-width="300" sortable />
      <el-table-column prop="product_name" :label="langStore.t('itemNameColumn')" min-width="600">
        <template #default="{ row: productGroup }">
          {{ productGroup.items.length > 0 ? productGroup.items[0].product_name : 'N/A' }}
        </template>
      </el-table-column>
      
      <el-table-column :label="langStore.t('quantityColumn')" min-width="100" sortable>
        <template #default="{ row: productGroup }">
          <el-tag size="small" type="info" style="margin-left: 10px">
            {{ productGroup.items.length }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="origin" :label="langStore.t('brandColumn')" width="auto">
        <template #default="{ row: productGroup }">
          {{ productGroup.items.length > 0 ? productGroup.items[0].origin : 'N/A' }}
        </template>
      </el-table-column>
      
      <el-table-column prop="unit" :label="langStore.t('unitColumn')" min-width="150">
        <template #default="{ row: productGroup }">
          {{ productGroup.items.length > 0 ? productGroup.items[0].unit : 'N/A' }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="totalItems"
      :page-sizes="[5, 10, 20, 50, 100]"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      class="pagination-controls"
    />
  </div>
</template>

<script>
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseManagementDatas } from "../../../composables/Warehouse/useWarehouseManagmentDatas";
import { computed, ref } from "vue";

export default {
  name: "InventoryTable",
  components: {
    View,
    EditPen,
    Delete,
  },
  emits: ["view-detail", "edit-detail", "detete-detail"],
  setup() {
    const langStore = useLanguageStore();
    const {
      groupedItems,
      applyFilters,
      selectedProductCode,
      productCodeOptions,
      remoteSearchProductCode,
      loadingProductCode,
      selectedDashboardDate,
      selectedBrand,
      uniqueBrand,
    } = useWarehouseManagementDatas();

    const currentPage = ref(1);
    const pageSize = ref(10);
    const itemPaginationState = ref({});

    const expandedRowKeys = ref([]);
    const handleExpandChange = (row, expandedRows) => {
        if (expandedRows.length > 0) {
            expandedRowKeys.value = [row.part_no];
        } else {
            expandedRowKeys.value = [];
        }
    };

    // Đồng bộ v-model với store/composable
    const localSelectedProductCode = computed({
      get: () => selectedProductCode.value,
      set: (val) => (selectedProductCode.value = val),
    });

    const handleFilterChange = () => {
      applyFilters();
      currentPage.value = 1;
    };

    const paginatedItems = computed(() => {
      if (!groupedItems.value) return [];
      const start = (currentPage.value - 1) * pageSize.value;
      return groupedItems.value.slice(start, start + pageSize.value);
    });

    const totalItems = computed(() => groupedItems.value?.length || 0);

    // --- Logic Pagination cho Bảng Con ---
    const getChildPageSize = (partNo) =>
      itemPaginationState.value[partNo]?.pageSize || 10;
      
    const getChildCurrentPage = (partNo) =>
      itemPaginationState.value[partNo]?.currentPage || 1;

    const getPaginatedChildItems = (group) => {
      const state = itemPaginationState.value[group.part_no] || {
        currentPage: 1,
        pageSize: 10,
      };
      const start = (state.currentPage - 1) * state.pageSize;
      return group.items.slice(start, start + state.pageSize);
    };

    // Tách logic xử lý size và current page cho bảng con để rõ ràng
    const handleChildSizeChange = (val, group) => {
      if (!itemPaginationState.value[group.part_no]) {
        itemPaginationState.value[group.part_no] = { currentPage: 1 };
      }
      itemPaginationState.value[group.part_no].pageSize = val;
      itemPaginationState.value[group.part_no].currentPage = 1; // Reset về trang 1 khi đổi size
    };

    const handleChildCurrentChange = (val, group) => {
      if (!itemPaginationState.value[group.part_no]) {
        itemPaginationState.value[group.part_no] = { pageSize: 10 };
      }
      itemPaginationState.value[group.part_no].currentPage = val;
    };

    return {
      // --- Variables ---
      langStore,
      groupedItems,
      loadingProductCode,
      currentPage,
      pageSize,
      itemPaginationState,
      localSelectedProductCode,
      selectedProductCode,
      productCodeOptions,
      paginatedItems,
      totalItems,
      selectedDashboardDate,
      selectedBrand,
      uniqueBrand,
      View,
      EditPen,
      Delete,
      expandedRowKeys,
      // --- Functions ---
      applyFilters,
      remoteSearchProductCode,
      handleFilterChange,
      getChildPageSize,
      getChildCurrentPage,
      getPaginatedChildItems,
      handleChildSizeChange,
      handleChildCurrentChange,
      handleExpandChange,
    };
  },
};
</script>

<style scoped>
.inventory-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.action-filter {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.barcode-select {
  width: 200px; /* Hoặc độ rộng tùy chỉnh */
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

/* Kế thừa style từ file gốc nếu cần */
.items-table {
  flex-grow: 1;
  overflow: auto;
}
</style>