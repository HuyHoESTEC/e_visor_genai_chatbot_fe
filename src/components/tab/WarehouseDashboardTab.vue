<template>
  <div class="dashboard-content">
    <div class="header-filters">
      <el-date-picker
        :model-value="dateRange"
        @update:model-value="$emit('update:dateRange', $event)"
        type="daterange"
        range-separator="To"
        :start-placeholder="langStore.t('startDatePlaceholder')"
        :end-placeholder="langStore.t('endDatePlaceholder')"
      />
      <el-button
        type="primary"
        @click="$emit('filter')"
        class="add-task-button"
        :icon="Filter"
      />
    </div>

    <div class="metric-cards">
      <div class="metric-card">
        <div class="metric-icon metric-icon-import">
          <el-icon><ShoppingCart /></el-icon>
        </div>
        <div class="metric-data">
          <div class="metric-value">{{ importVal }}</div>
          <div class="metric-label">{{ langStore.t("importQuantityMetric") }}</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon metric-icon-transfer">
          <el-icon><Van /></el-icon>
        </div>
        <div class="metric-data">
          <div class="metric-value">{{ installationVal }}</div>
          <div class="metric-label">Số lượng xuất kho</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon metric-icon-export">
          <el-icon><Tickets /></el-icon>
        </div>
        <div class="metric-data">
          <div class="metric-value">{{ totalPO }}</div>
          <div class="metric-label">{{ langStore.t("totalPOMetric") }}</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon metric-icon-request">
          <el-icon><Files /></el-icon>
        </div>
        <div class="metric-data">
          <div class="metric-value">{{ totalProject }}</div>
          <div class="metric-label">{{ langStore.t("totalProjectMetric") }}</div>
        </div>
      </div>
    </div>

    <div class="charts-and-tables">
      <div class="right-column">
        <el-card style="height: 100%" class="transaction-chard-card">
          <PiedChart
            :key="langStore.currentLanguage"
            :pied-chart="piedChart"
            :title-text="langStore.t('quantityFluctuationChartTitle')"
          />
        </el-card>
      </div>

      <div class="right-column">
        <el-card class="transaction-chart-card">
          <DualChart 
            :chart-data="dualChartVal" 
            :is-visible="isVisible" 
        />
        </el-card>
      </div>

      <div class="left-column">
        <el-card>
          <DonutChart
            :installation-data-from-inventory="donutData"
            :isLoading="isLoading"
            :langStore="langStore"
            class="mb-4"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { Files, Filter, ShoppingCart, Tickets, Van } from "@element-plus/icons-vue";
import DualChart from "../charts/DualChart.vue";
import DonutChart from "../charts/DonutChart.vue";
import PiedChart from "../charts/PiedChart.vue";

export default {
  name: "WarehouseDashboardTab",
  components: {
    ShoppingCart,
    Van,
    Tickets,
    Files,
    Filter,
    PiedChart,
    DualChart,
    DonutChart,
  },
  props: {
    langStore: {
      type: Object,
      required: true,
    },
    dateRange: {
      type: Array,
      default: () => [],
    },
    importVal: [Number, String],
    installationVal: [Number, String],
    totalPO: [Number, String],
    totalProject: [Number, String],
    piedChart: Object,
    dualChartVal: Object,
    donutData: Object,
    isLoading: Boolean,
    isVisible: Boolean,
  },
  emits: ["update:dateRange", "filter"],
  setup() {
    return {
      ShoppingCart,
      Van,
      Tickets,
      Files,
      Filter,
    };
  },
};
</script>

<style>
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
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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
.metric-icon-import {
  background-color: #2c2c6a;
}
.metric-icon-export {
  background-color: #67c23a;
}
.metric-icon-request {
  background-color: #e6a23c;
}
.metric-icon-transfer {
  background-color: #f56c6c;
}
.metric-value {
  font-size: 2em;
  font-weight: bold;
}
.metric-label {
  font-size: 14px;
  color: #909399;
  margin-top: 2px;
  word-wrap: break-word;
}
.charts-and-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  gap: 20px;
  margin: 0 auto;
}
.transaction-chart-card {
  width: 100%;
}
.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
  min-width: 0;
}
.el-card {
  width: 100%;
  min-height: 300px;
}

@media (max-width: 1200px) {
  .charts-and-tables {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 1000px) {
  .metric-cards {
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }
  .metric-card {
    width: 48%;
    max-width: 300px;
  }
}
@media (max-width: 600px) {
  .metric-cards {
    flex-direction: column;
    align-items: center;
  }
  .metric-card {
    width: 100%;
    max-width: none;
  }
}
</style>
