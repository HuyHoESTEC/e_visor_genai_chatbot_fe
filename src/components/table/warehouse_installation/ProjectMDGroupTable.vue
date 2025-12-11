<template>
  <div class="project-md-group-container">
    <el-table
      :data="paginatedProjectGroups"
      border
      stripe
      style="width: 100%; height: calc(100vh - 321px)"
      row-key="project_code"
    >
      <el-table-column type="expand">
        <template #default="{ row: projectRow }">
          <div style="padding: 10px 20px; background-color: #f5f7fa">
            <h4 style="margin-top: 0; color: #606266">
              Danh sách tủ thuộc dự án - {{ projectRow.project_code }}
            </h4>

            <el-table :data="getGroupedMDByProject(projectRow.items, projectRow.project_code)" border size="small">
              <el-table-column
                prop="cabinet_no"
                :label="langStore.t('tableHeaderCabinetNo')"
                width="200"
              />

              <el-table-column :label="langStore.t('quantityColumn')" width="150">
                <template #default="{ row }">
                  <span style="font-weight: bold">{{ row.items.length }}</span>
                </template>
              </el-table-column>

              <el-table-column :label="langStore.t('tableHeaderAction')">
                <template #default="{ row: mdRow }">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="List"
                    v-on:click="openDetailDialog(mdRow, projectRow.project_code)"
                  >
                    Xem danh sách chi tiết
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin-top: 10px; display: flex; justify-content: center">
              <el-pagination
                background
                layout="prev, pager, next, sizes, total"
                :total="getMDPaginationState(projectRow.project_code).total"
                :current-page="getMDPaginationState(projectRow.project_code).currentPage"
                :page-size="getMDPaginationState(projectRow.project_code).pageSize"
                @update:current-page="
                  (val) => handleMDPageChange(val, projectRow.project_code)
                "
                @update:page-size="
                  (val) => handleMDSizeChange(val, projectRow.project_code)
                "
              />
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="project_code"
        :label="langStore.t('projectCodeLabel')"
        sortable
      />
      <el-table-column :label="langStore.t('quantityColumn')">
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
      class="pagination-controls"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="`Danh sách tủ thuộc mã dãy: ${selectedMDCode} (${selectedProjectCode})`"
      width="85%"
      align-center
      append-to-body
      class="responsive-dialog"
      @closed="handleDialogClosed"
    >
      <div v-if="selectedMDItems.length > 0">
        <div style="margin-bottom: 15px; display: flex; gap: 10px;">
          <el-input
            v-model="filterText"
            placeholder="Tìm kiếm Location..."
            style="width: 300px"
            clearable
          />
          <el-input 
            v-model="partNoFilterText"
            placeholder="Tìm kiếm Mã hàng hóa..."
            style="width: 300px;"
            clearable
          />
        </div>

        <el-table
          :data="paginatedLocationGroups"
          border
          stripe
          height="500px"
          row-key="location"
        >
          <el-table-column type="expand">
            <template #default="{ row: locationRow }">
              <div style="padding: 10px">
                <el-table :data="getPaginatedLocationItems(locationRow.items, locationRow.location)" border size="small">
                  <el-table-column
                    prop="part_no"
                    :label="langStore.t('tableHeaderPartNo')"
                    width="150"
                  />
                  <el-table-column
                    prop="description"
                    :label="langStore.t('tableHeaderDescription')"
                    min-width="200"
                  />
                  <el-table-column
                    prop="quantity"
                    :label="langStore.t('tableHeaderQuantity')"
                    width="80"
                  />
                  <el-table-column
                    prop="seri_number"
                    :label="langStore.t('tableHeaderSeriNumber')"
                    width="150"
                  />
                  <el-table-column
                    prop="status"
                    :label="langStore.t('tableHeaderStatus')"
                    width="auto"
                    :formatter="statusFormatter"
                  />
                  <el-table-column fixed="right" width="100" label="Action">
                    <template #default="{ row }">
                      <el-button
                        type="success"
                        size="small"
                        :icon="View"
                        circle
                        plain
                        @click="$emit('view-detail', row)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
                <div style="margin-top: 10px; display: flex; justify-content: center;">
                  <el-pagination
                    bacground
                    size="small"
                    layout="total, sizes, prev, pager, next"
                    :total="getLocationItemPaginationState(locationRow.location).total"
                    :current-page="getLocationItemPaginationState(locationRow.location).currentPage"
                    :page-size="getLocationItemPaginationState(locationRow.location).pageSize"
                    :page-sizes="[5, 10, 20, 50, 100]"
                    @update:current-page="(val) => handleLocationItemPageChange(val, locationRow.location)"
                    @update:page-size="(val) => handleLocationItemSizeChange(val, locationRow.location)"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="location"
            :label="langStore.t('tableHeaderLocation')"
            sortable
          />
          <el-table-column label="Số lượng hàng hóa">
            <template #default="{ row }">
              <el-tag>{{ row.items.length }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 15px; display: flex; justify-content: center">
          <el-pagination
            background
            size="small"
            layout="prev, pager, sizes, next, total"
            :total="totalLocationGroups"
            v-model:current-page="currentLocationPage"
            v-model:page-size="locationPageSize"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{
          langStore.t("closeButton")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { View, List } from "@element-plus/icons-vue";
import { useLanguageStore } from "../../../stores/language";
import { computed, ref } from "vue";

export default {
  name: "ProjectMDGroupTable",
  components: {
    View,
    List,
  },
  props: {
    allItems: {
      type: Array,
      required: true,
    },
  },
  emits: ["view-detail"],
  setup(props) {
    const langStore = useLanguageStore();
    // -- Grouping Level 1: Project Code --
    const currentPage = ref(1);
    const pageSize = ref(5);

    const groupedByProject = computed(() => {
      const groups = {};
      props.allItems.forEach((item) => {
        const pCode = item.project_code || "Unknown Project";
        if (!groups[pCode]) groups[pCode] = { project_code: pCode, items: [] };
        groups[pCode].items.push(item);
      });
      return Object.values(groups);
    });

    const paginatedProjectGroups = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      return groupedByProject.value.slice(start, start + pageSize.value);
    });
    const totalProjectGroups = computed(() => groupedByProject.value.length);

    // -- Grouping Level 2: MD (Cabinet No) --
    const mdPaginationState = ref({}); // { 'project_code': { currentPage: 1, pageSize: 5, total: 0 } }
    const getMDPaginationState = (projectCode) => {
      if (!mdPaginationState.value[projectCode]) {
        mdPaginationState.value[projectCode] = {
          currentPage: 1,
          pageSize: 10,
          total: 0,
        };
      }
      return mdPaginationState.value[projectCode];
    };

    const getGroupedMDByProjectRaw = (items) => {
      const groups = {};
      items.forEach((item) => {
        const mdCode = item.cabinet_no || "Unknown MD";
        if (!groups[mdCode]) groups[mdCode] = { cabinet_no: mdCode, items: [] };
        groups[mdCode].items.push(item);
      });
      return Object.values(groups);
    };

    const getGroupedMDByProject = (projectItems, projectCode) => {
      const allMDGroups = getGroupedMDByProjectRaw(projectItems);
      const state = getMDPaginationState(projectCode);

      state.total = allMDGroups.length;
      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      if (start >= state.total && state.currentPage > 1) {
        state.currentPage = 1;
        return allMDGroups.slice(0, state.pageSize);
      }
      return allMDGroups.slice(start, end);
    };

    const handleMDPageChange = (val, projectCode) => {
      getMDPaginationState(projectCode).currentPage = val;
    };

    const handleMDSizeChange = (val, projectCode) => {
      const state = getMDPaginationState(projectCode);
      state.pageSize = val;
      state.currentPage = 1; // Reset về trang 1 khi thay đổi kích thước
    };

    // -- Popup (Level 3 & 4)
    const dialogVisible = ref(false);
    const selectedMDItems = ref([]);
    const selectedMDCode = ref("");
    const selectedProjectCode = ref("");
    const filterText = ref("");
    const partNoFilterText = ref("");

    const currentLocationPage = ref(1);
    const locationPageSize = ref(10);

    const itemPaginationStateInDialog = ref({});

    const getLocationItemPaginationState = (locationCode) => {
      if (!itemPaginationStateInDialog.value[locationCode]) {
        itemPaginationStateInDialog.value[locationCode] = {
          currentPage: 1,
          pageSize: 5,
          total: 0,
        };
      }
      return itemPaginationStateInDialog.value[locationCode];
    };

    const getPaginatedLocationItems = (locationItems, locationCode) => {
      const state = getLocationItemPaginationState(locationCode);
      state.total = locationItems.length;
      const start = (state.currentPage - 1) * state.pageSize;
      const end = start + state.pageSize;

      return locationItems.slice(start, end);
    };

    const handleLocationItemPageChange = (val, locationCode) => {
      getLocationItemPaginationState(locationCode).currentPage = val;
    };

    const handleLocationItemSizeChange = (val, locationCode) => {
      const state = getLocationItemPaginationState(locationCode);
      state.pageSize = val;
      state.currentPage = 1;
    };

    const openDetailDialog = (mdRow, projectCode) => {
      selectedMDItems.value = mdRow.items;
      selectedMDCode.value = mdRow.cabinet_no;
      selectedProjectCode.value = projectCode;
      currentLocationPage.value = 1;
      filterText.value = "";
      partNoFilterText.value = "";
      dialogVisible.value = true;
      itemPaginationStateInDialog.value = {};
    };
    // Group item inside popup follow Location
    const groupedLocationInPopup = computed(() => {
      let items = selectedMDItems.value;
      const lowerLoc = filterText.value.toLowerCase();
      const lowerPartNo = partNoFilterText.value.toLowerCase();
      if (lowerLoc || lowerPartNo) {
        items = items.filter((i) => {
          const locationMatch = !lowerLoc || i.location?.toLowerCase().includes(lowerLoc);
          const partNoMatch = !lowerPartNo || i.part_no?.toLowerCase().includes(lowerPartNo);
          return locationMatch && partNoMatch;
        });
      }

      const groups = {};
      items.forEach((item) => {
        const loc = item.location || "Unknown Location";
        if (!groups[loc]) groups[loc] = { location: loc, items: [] };
        groups[loc].items.push(item);
      });
      return Object.values(groups);
    });

    const paginatedLocationGroups = computed(() => {
      const start = (currentLocationPage.value - 1) * locationPageSize.value;
      return groupedLocationInPopup.value.slice(start, start + locationPageSize.value);
    });
    const totalLocationGroups = computed(() => groupedLocationInPopup.value.length);

    const handleDialogClosed = () => {
      selectedMDItems.value = [];
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

    return {
      langStore,
      currentPage,
      pageSize,
      View,
      List,
      groupedByProject,
      paginatedProjectGroups,
      totalProjectGroups,
      getGroupedMDByProject,
      dialogVisible,
      selectedMDItems,
      selectedMDCode,
      selectedProjectCode,
      filterText,
      currentLocationPage,
      locationPageSize,
      openDetailDialog,
      groupedLocationInPopup,
      paginatedLocationGroups,
      totalLocationGroups,
      handleDialogClosed,
      getMDPaginationState,
      mdPaginationState,
      getGroupedMDByProjectRaw,
      handleMDPageChange,
      handleMDSizeChange,
      itemPaginationStateInDialog,
      getLocationItemPaginationState,
      getPaginatedLocationItems,
      handleLocationItemPageChange,
      handleLocationItemSizeChange,
      getInstallationStatusName,
      statusFormatter,
      partNoFilterText,
    };
  },
};
</script>
