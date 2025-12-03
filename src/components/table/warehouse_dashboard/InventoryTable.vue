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
                class="barcode-select"
            >
                <el-option 
                    v-for="item in productCodeOptions"
                    :key="item.id"
                    :label="item.name"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    @change="applyFilters"
                    style="width: 100%;"
                />
            </el-select>
            <el-select
                v-model="selectedBrand"
                :placeholder="langStore.t('filterByBrandPlaceholder')"
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
            <el-date-picker 
                v-model="selectedDashboardDate"
                type="date"
                :placeholder="langStore.t('FilterByImportDate')"
                fr
            />
        </div>
        <el-table
            :data="paginatedItems"
            border
            stripe
            class="items-table"
            style="width: 100%; height: calc(100vh - 330px)"
        >
            <el-table-column type="expand">
                <template #default="{ row: productGroup }">
                    <div style="padding: 0 20px;">
                        <h4>{{ langStore.t('productGroupDetailTitle') }}: {{ productGroup.part_no }}</h4>
                        <el-table :data="getPaginatedChildItems(productGroup)" border stripe>
                            <el-table-column prop="product_name" :label="langStore.t('itemNameColumn')" />
                            <el-table-column prop="seri_number" :label="langStore.t('detailSeriNumberLabel')" />
                            <el-table-column fixed="right" :label="langStore.t('JobAction')">
                                <template #default="{ row }">
                                    <el-button type="success" circle :icon="View" @click="$emit('view-detail', row)" />
                                    <el-button type="primary" circle :icon="EditPen" @click="$emit('edit-detail', row)" />
                                </template>
                            </el-table-column>
                        </el-table>

                        <el-pagination
                            background
                            layout="prev, pager, next"
                            :total="productGroup.items.length"
                            :page-size="getChildPageSize(productGroup.part_no)"
                            :current-page="getChildCurrentPage(productGroup.part_no)"
                            @current-change="(val) => handleChildPageChange(val, productGroup)"
                        />
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="part_no" :label="langStore.t('itemPartNoColumn')" sortable />
            <el-table-column :label="langStore.t('quantityColumn')">
                <template #default="{ row }">
                    <el-tag>{{ row.items.length }}</el-tag>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination 
            background
            layout="prev, pager, next, sizes, total"
            :total="totalItems"
            v-model:current-page="currentPage"
            v-model:page-sze="pageSize"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="pagination-controls"
        />
    </div>
</template>

<script>
import { EditPen, View } from "@element-plus/icons-vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseManagementDatas } from "../../../composables/Warehouse/useWarehouseManagmentDatas";
import { computed, ref } from "vue";

export default {
  name: "InventoryTable",
  components: {
    View,
    EditPen,
  },
  emits: ["view-detail", "edit-detail"],
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
      selectedBrand
    } = useWarehouseManagementDatas();

    const currentPage = ref(1);
    const pageSize = ref(10);
    const itemPaginationState = ref({});

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

    const handleChildPageChange = (val, group) => {
      if (!itemPaginationState.value[group.part_no]) {
        itemPaginationState.value[group.part_no] = { pageSize: 10 };
      }
      itemPaginationState.value[group.part_no].currentPage = val;
    };

    const handleSizeChange = (val) => (pageSize.value = val);
    const handleCurrentChange = (val) => (currentPage.value = val);

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
      // --- Functions ---
      applyFilters,
      remoteSearchProductCode,
      handleFilterChange,
      getChildPageSize,
      getChildCurrentPage,
      getPaginatedChildItems,
      handleChildPageChange,
      handleSizeChange,
      handleCurrentChange,
    };
  },
};
</script>
