<template>
  <div class="installation-table-container">
    <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px">
      <label style="font-weight: bold; min-width: 100px"
        >{{ langStore.t("ProjectCode") }}:</label
      >
      <el-input
        v-model="projectCodeFilterText"
        :placeholder="
          langStore.t('placeholderSearchProjectCode') || 'Nhập mã dự án để tìm kiếm...'
        "
        clearable
        style="max-width: 300px"
      />
    </div>
    <el-table
      :data="paginatedProjectGroups"
      border
      stripe
      style="width: 100%; height: calc(100vh - 340px)"
      row-key="project_code"
      :expand-row-keys="expandedProjectKeys"
      @expand-change="handleProjectExpandChange"
    >
      <el-table-column type="expand">
        <template #default="{ row: projectRow }">
          <div style="padding: 10px 20px; background-color: #f5f7 fa">
            <h4 style="margin-top: 0; color: #606266">
              Danh sách trạng thái của thiết bị thuộc dự án -
              {{ projectRow.project_code }}
            </h4>

            <el-table
              :data="getGroupedStatusByProject(projectRow.items)"
              border
              stripe
              size="small"
            >
              <el-table-column :label="langStore.t('tableHeaderStatus')" width="200">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusName(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column :label="langStore.t('quantityColumn')" width="150">
                <template #default="{ row }">
                  <span style="font-weight: bold">{{ row.items.length }}</span>
                </template>
              </el-table-column>

              <el-table-column :label="langStore.t('tableHeaderAction')">
                <template #default="{ row: statusRow }">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="List"
                    @click="openPartNoDialog(statusRow, projectRow.project_code)"
                  >
                    Xem danh sách chi tiết
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="project_code"
        :label="langStore.t('projectCodeLabel')"
        sortable
      />
      <el-table-column label="Số lượng">
        <template #default="{ row }">
          <el-tag effect="dark">{{ row.items.length }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="totalProjectGroups"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-controls"
    />

    <el-dialog
      v-model="dialogPartNoVisible"
      :title="`Chi tiết hàng hóa dự án: ${selectedProjectCode} - ${getStatusName(
        selectedStatus
      )}`"
      width="80%"
      align-center
      append-to-body
      class="responsive-dialog"
      @closed="handlePartNoDialogClosed"
    >
      <div v-if="selectedStatusItems.length > 0">
        <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px">
          <label style="font-weight: bold; min-width: 100px">{{
            langStore.t("itemPartNoColumn")
          }}</label>
          <el-input
            v-model="partNoFilterText"
            :placeholder="
              langStore.t('placeholderSearchPartNo') || 'Nhập mã hàng hóa để tìm kiếm...'
            "
            clearable
            style="max-width: 300px"
          />
        </div>
        <el-table
          :data="paginatedPartNoGroups"
          border
          stripe
          height="500px"
          row-key="part_no"
          :expand-row-keys="expandedPartNoKeys"
          @expand-change="handlePartNoExpandChange"
        >
          <el-table-column type="expand">
            <template #default="{ row: partNoRow }">
              <div style="padding: 10px">
                <el-table :data="getPaginatedItemsInDialog(partNoRow)" border size="small">
                  <el-table-column
                    prop="higher_lever_function"
                    :label="langStore.t('tableHigherLeverFunction')"
                    width="auto"
                  />
                  <el-table-column
                    prop="location"
                    :label="langStore.t('tableHeaderLocation')"
                    width="auto"
                  />
                  <el-table-column
                    prop="dt"
                    :label="langStore.t('tableDT')"
                    width="auto"
                  />
                  <el-table-column
                    prop="quantity"
                    :label="langStore.t('tableHeaderQuantity')"
                    width="auto"
                  />
                  <el-table-column
                    prop="description"
                    :label="langStore.t('tableHeaderDescription')"
                    width="auto"
                  />
                  <el-table-column
                    prop="part_no"
                    :label="langStore.t('tableHeaderPartNo')"
                    width="auto"
                  />
                  <el-table-column
                    prop="seri_number"
                    :label="langStore.t('tableHeaderSeriNumber')"
                    width="auto"
                  />
                  <el-table-column
                    prop="manufacturer"
                    :label="langStore.t('tableHeaderManufacturer')"
                    width="auto"
                  />
                  <el-table-column
                    :label="langStore.t('tableHeaderAction')"
                    width="100"
                    fixed="right"
                  >
                    <template #default="{ row }">
                      <el-button
                        type="success"
                        plain
                        circle
                        size="small"
                        :icon="View"
                        @click="$emit('view-detail', row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                    background
                    layout="prev, pager, next, sizes, total"
                    :total="filterItemsByText(partNoRow.items, partNoFilterText).length"
                    :page-size="getItemPageSizeInDialog(partNoRow.part_no)"
                    :current-page="getItemCurrentPageInDialog(partNoRow.part_no)"
                    @size-change="(val) => handleItemSizeChangeInDialog(val, partNoRow)"
                    @current-change="(val) => handleItemCurrentChangeInDialog(val, partNoRow)"
                    style="margin-top: 10px; justify-content: center;"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="part_no"
            :label="langStore.t('itemPartNoColumn')"
            sortable
          />
          <el-table-column :label="langStore.t('quantityColumn')" width="120">
            <template #default="{ row }">
              <el-tag>{{ row.items.length }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 15px; display: flex; justify-content: center">
          <el-pagination
            background
            layout="prev, pager, next, sizes, total"
            :total="totalPartNoGroups"
            v-model:current-page="currentPartNoPage"
            v-model:page-size="partNoPageSize"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogPartNoVisible = false">{{
            langStore.t("closeButton")
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { List, View } from "@element-plus/icons-vue";
import { useLanguageStore } from "../../../stores/language";
import { useWarehouseInstallationManagement } from "../../../composables/Warehouse/useWarehouseInstallationManagement";
import { computed, ref } from "vue";

export default {
  name: "InstallationStatusTable",
  components: {
    View,
    List,
  },
  emits: ["view-detail"],
  setup() {
    const langStore = useLanguageStore();
    const {
      filteredInstallationItems,
      groupItemsByPartNo,
    } = useWarehouseInstallationManagement();

    // --- LOGIC class 1: Group by project code ---
    const currentPage = ref(1);
    const pageSize = ref(10);
    const projectCodeFilterText = ref("");

    const groupedByProject = computed(() => {
      if (!filteredInstallationItems.value) return [];
      const filterText = projectCodeFilterText.value
        ? projectCodeFilterText.value.toLowerCase()
        : "";
      const filteredItems = filterText
        ? filteredInstallationItems.value.filter((item) => {
            const pCode = item.project_code || langStore.t("NoData");
            return pCode.toLowerCase().includes(filterText);
          })
        : filteredInstallationItems.value;

      const groups = {};
      filteredItems.forEach((item) => {
        const pCode = item.project_code || langStore.t("NoData");
        if (!groups[pCode]) {
          groups[pCode] = { project_code: pCode, items: [] };
        }
        groups[pCode].items.push(item);
      });
      return Object.values(groups);
    });

    const paginatedProjectGroups = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return groupedByProject.value.slice(start, start + pageSize.value);
    });

    const totalProjectGroups = computed(() => groupedByProject.value.length);

    // --- LOGIC class 2: Group by status ---
    const getGroupedStatusByProject = (projectItems) => {
      const statusGroup = {};
      projectItems.forEach((item) => {
        const st = item.status ?? -1;
        if (!statusGroup[st]) {
          statusGroup[st] = { status: st, items: [] };
        }
        statusGroup[st].items.push(item);
      });
      return Object.values(statusGroup).sort((a, b) => a.status - b.status);
    };

    // --- LOGIC Class 3: Group by part no ---
    const dialogPartNoVisible = ref(false);
    const selectedStatusItems = ref([]);
    const selectedProjectCode = ref("");
    const selectedStatus = ref(null);

    const currentPartNoPage = ref(1);
    const partNoPageSize = ref(10);

    const partNoFilterText = ref("");

    const openPartNoDialog = (statusRow, projectCode) => {
      selectedStatusItems.value = statusRow.items;
      selectedProjectCode.value = projectCode;
      selectedStatus.value = statusRow.status;
      currentPartNoPage.value = 1;
      dialogPartNoVisible.value = true;
    };

    const filteredStatusItemsByPartNo = computed(() => {
      const text = partNoFilterText.value
        ? partNoFilterText.value.toLocaleLowerCase()
        : "";
      if (!text || !selectedStatusItems.value.length) {
        return selectedStatusItems.value;
      }

      return selectedStatusItems.value.filter((item) => {
        return item.part_no && item.part_no.toLocaleLowerCase().includes(text);
      });
    });

    const groupedPartNosInPopup = computed(() => {
      if (!filteredStatusItemsByPartNo.value.length) return [];
      return groupItemsByPartNo(filteredStatusItemsByPartNo.value);
    });

    const paginatedPartNoGroups = computed(() => {
      const start = (currentPartNoPage.value - 1) * partNoPageSize.value;
      return groupedPartNosInPopup.value.slice(start, start + partNoPageSize.value);
    });

    const totalPartNoGroups = computed(() => groupedPartNosInPopup.value.length);
    // --- HELPER FUNCTIONS ---
    const getStatusName = (val) => {
      if (val === 0) return langStore.t("statusInstalled") || "Đã lắp đặt";
      if (val === 1) return langStore.t("statusNotInstalled") || "Chưa lắp đặt";
      return langStore.t("statusUnknown") || "Không xác định";
    };

    const getStatusType = (val) =>
      val === 0 ? "success" : val === 1 ? "warning" : "info";

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };

    const expandedPartNoKeys = ref([]);
    const handlePartNoExpandChange = (row, expandedRows) => {
      if (expandedRows.length > 0) {
        expandedPartNoKeys.value = [row.part_no];
      } else {
        expandedPartNoKeys.value = [];
      }
    };

    const expandedProjectKeys = ref([]);
    const handleProjectExpandChange = (row, expandedRows) => {
      if (expandedRows.length > 0) {
        expandedProjectKeys.value = [row.project_code];
      } else {
        expandedProjectKeys.value = [];
      }
    };

    const handlePartNoDialogClosed = () => {
      selectedStatusItems.value = [];
      selectedProjectCode.value = "";
      selectedStatus.value = null;

      currentPartNoPage.value = 1;
      expandedPartNoKeys.value = [];
      partNoFilterText.value = "";

      itemPaginationStateInDialog.value = {};
    };

    const itemPaginationStateInDialog = ref({});
    const filterItemsByText = (items, filterText) => {
        if (!filterText) return items;
        const lowerCaseFilter = filterText.toLowerCase();
        return items.filter(item => 
            item.seri_number?.toLowerCase().includes(lowerCaseFilter) ||
            item.product_name?.toLowerCase().includes(lowerCaseFilter)
        );
    };

    const getItemPageSizeInDialog = (partNo) =>
      itemPaginationStateInDialog.value[partNo]?.pageSize || 10;
    const getItemCurrentPageInDialog = (partNo) =>
      itemPaginationStateInDialog.value[partNo]?.currentPage || 1;

    const getPaginatedItemsInDialog = (partNoRow) => {
      const filteredItems = filterItemsByText(partNoRow.items, partNoFilterText.value);
      const state = itemPaginationStateInDialog.value[partNoRow.part_no] || {
        currentPage: 1,
        pageSize: 10,
      };
      const start = (state.currentPage - 1) * state.pageSize;
      return filteredItems.slice(start, start + state.pageSize);
    };

    const handleItemSizeChangeInDialog = (val, partNoRow) => {
      if (!itemPaginationStateInDialog.value[partNoRow.part_no]) {
        itemPaginationStateInDialog.value[partNoRow.part_no] = { currentPage: 1 };
      }
      itemPaginationStateInDialog.value[partNoRow.part_no].pageSize = val;
      itemPaginationStateInDialog.value[partNoRow.part_no].currentPage = 1;
    };

    const handleItemCurrentChangeInDialog = (val, partNoRow) => {
      if (!itemPaginationStateInDialog.value[partNoRow.part_no]) {
        itemPaginationStateInDialog.value[partNoRow.part_no] = { pageSize: 10 };
      }
      itemPaginationStateInDialog.value[partNoRow.part_no].currentPage = val;
    };

    return {
      // --- Variables ---
      langStore,
      filteredInstallationItems,
      currentPage,
      pageSize,
      groupedByProject,
      paginatedProjectGroups,
      totalProjectGroups,
      dialogPartNoVisible,
      selectedStatusItems,
      selectedProjectCode,
      selectedStatus,
      currentPartNoPage,
      partNoPageSize,
      totalPartNoGroups,
      View,
      List,
      expandedPartNoKeys,
      expandedProjectKeys,
      partNoFilterText,
      projectCodeFilterText,
      filteredStatusItemsByPartNo,
      itemPaginationStateInDialog,
      itemPaginationStateInDialog,
      groupedPartNosInPopup,
      paginatedPartNoGroups,
      // --- Functions ---
      groupItemsByPartNo,
      getGroupedStatusByProject,
      openPartNoDialog,
      getStatusType,
      getStatusName,
      handleSizeChange,
      handleCurrentChange,
      handlePartNoExpandChange,
      handleProjectExpandChange,
      handlePartNoDialogClosed,
      getPaginatedItemsInDialog,
      getItemPageSizeInDialog,
      getItemCurrentPageInDialog,
      handleItemSizeChangeInDialog,
      handleItemCurrentChangeInDialog,
      filterItemsByText,
    };
  },
};
</script>

<style scoped>
.installation-table-container {
  height: 100%;
}
/* Style để popup con nằm trên popup cha nếu cần thiết */
:deep(.el-overlay-dialog) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-dialog) {
  /* Quan trọng: Xóa margin mặc định 15vh của Element Plus */
  margin: 0 !important;

  /* Đảm bảo dialog không cao quá màn hình */
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* Cho phép phần nội dung (body) của dialog cuộn nếu màn hình quá nhỏ */
:deep(.el-dialog__body) {
  overflow-y: auto;
  flex: 1;
}

/* RESPONSIVE: Xử lý chiều rộng cho màn hình nhỏ */
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important; /* Trên mobile lấy 95% chiều rộng thay vì 80% */
  }
}
</style>
