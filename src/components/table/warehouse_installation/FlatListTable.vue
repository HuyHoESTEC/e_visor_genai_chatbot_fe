<template>
  <div class="flat-list-container">
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%; height: calc(100vh - 321px)"
      class="items-table"
      @selection-change="$emit('selection-change', $event)"
    >
      <template #empty>
        <div v-if="emptyData" class="empty-data-message">
          <el-empty :description="langStore.t('NoData')" />
        </div>
      </template>

      <el-table-column type="selection" width="55" />
      <el-table-column
        prop="higher_lever_function"
        :label="langStore.t('tableHigherLeverFunction')"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="location"
        :label="langStore.t('tableHeaderLocation')"
        width="120"
      />
      <el-table-column prop="dt" :label="langStore.t('tableDT')" width="100" />
      <el-table-column
        prop="quantity"
        :label="langStore.t('tableHeaderQuantity')"
        width="100"
      />
      <el-table-column
        prop="description"
        :label="langStore.t('tableHeaderDescription')"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="part_no"
        :label="langStore.t('tableHeaderPartNo')"
        width="150"
      />
      <el-table-column
        prop="seri_number"
        :label="langStore.t('tableHeaderSeriNumber')"
        width="150"
      />
      <el-table-column
        prop="status"
        :label="langStore.t('statusLabel')"
        width="120"
        :formatter="statusFormatter"
      />
      <el-table-column
        prop="manufacturer"
        :label="langStore.t('tableHeaderManufacturer')"
        width="150"
      />

      <el-table-column
        fixed="right"
        :label="langStore.t('tableHeaderAction')"
        width="150"
      >
        <template #default="{ row }">
          <el-button
            type="success"
            size="small"
            :icon="View"
            circle
            plain
            v-on:click="$emit('view-detail', row)"
          />
          <el-button
            type="primary"
            size="small"
            :icon="EditPen"
            circle
            plain
            @click="$emit('edit-item', row)"
          />
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            circle
            plain
            @click="$emit('delete-item', row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next, sizes, total"
      :total="totalItems"
      v-model:current-page="localCurrentPage"
      v-model:page-size="localPageSize"
      :page-sizes="[5, 10, 20, 50, 100]"
      class="pagination-controls"
    />
  </div>
</template>

<script>
import { Delete, EditPen, View } from "@element-plus/icons-vue";
import { useLanguageStore } from "../../../stores/language";
import { computed } from "vue";

export default {
  name: "FlatListTable",
  components: {
    View,
    EditPen,
    Delete,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    emptyData: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 5,
    },
    statusFormatter: {
      type: Function,
      default: () => "",
    },
  },
  emits: [
    "update:currentPage",
    "update:pageSize",
    "view-detail",
    "edit-item",
    "delete-item",
    "selection-change",
  ],
  setup(props, { emit }) {
    const langStore = useLanguageStore();
    // Wrapper for v-model pagination
    const localCurrentPage = computed({
      get: () => props.currentPage,
      set: (val) => emit("update:currentPage", val),
    });

    const localPageSize = computed({
      get: () => props.pageSize,
      set: (val) => emit("update:pageSize", val),
    });
    // Calculate data for the current page (if pagination client-side) or use props.data directly if server-side
    const tableData = computed(() => {
      const start = (props.currentPage - 1) * props.pageSize;
      return props.data.slice(start, start + props.pageSize);
    });

    return {
      View,
      EditPen,
      Delete,
      langStore,
      localCurrentPage,
      localPageSize,
      tableData,
    };
  },
};
</script>
