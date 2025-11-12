<template>
  <div class="dual-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ langStore.t('dualChartTitle') }}</h3>
      <div class="header-controls">
        <el-button
          :class="{ 'is-active-btn': viewMode === 'table' }"
          size="small"
          @click="viewMode = viewMode === 'table' ? 'chart' : 'table'"
        >
          <i :class="viewMode === 'table' ? 'el-icon-data-board' : 'el-icon-list'"></i> 
          {{ viewMode === 'table' ? langStore.t('viewChartButton') : langStore.t('viewTableButton') }}
        </el-button>

        <div class="time-filter-group">
          <el-button
            v-for="time in timeOptions"
            :key="time.key"
            :class="{ 'is-active': timeFilter === time.key }"
            size="small"
            @click="setTimeFilter(time.key)"
          >
            {{ time.label }}
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'chart'" ref="chartRef" class="dual-chart-body"></div>

    <div v-if="viewMode === 'table'" class="dual-chart-body table-view">
        <div v-if="currentChartData.dates.length === 0" class="no-data-message">
            {{ langStore.t('noDataMessageTable') }}
        </div>
        <table v-else class="data-table">
            <thead>
                <tr>
                  <th>{{ langStore.t('timeColumnHeader') }} ({{ timeOptions.find(t => t.key === timeFilter).label }})</th>
                  <th>{{ langStore.t('importQuantityColumnHeader') }}</th>
                  <th>{{ langStore.t('exportQuantityColumnHeader') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(date, index) in currentChartData.dates" :key="index">
                    <td>{{ formatDate(date, timeFilter) }}</td>
                    <td class="text-right">{{ formatNumberWithComma(currentChartData.importQuantity[index]) }}</td>
                    <td class="text-right">{{ formatNumberWithComma(currentChartData.exportQuantity[index]) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import { useLanguageStore } from '../../stores/language';

const BASE_COLORS = {
  importQty: '#007AFF', 
  exportQty: '#34C759', 
  lightBlue: '#5AC8FA',
  lightGreen: '#30D158',
  shadow: 'rgba(0, 0, 0, 0.2)',
};

const createGradient = (colorStart, colorEnd) => {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: colorStart },
    { offset: 1, color: colorEnd }
  ]);
};

const COLORS = {
    importGradient: createGradient(BASE_COLORS.importQty, BASE_COLORS.lightBlue),
    exportGradient: createGradient(BASE_COLORS.exportQty, BASE_COLORS.lightGreen),
    axisLine: '#E0E0E0',
    splitLine: '#F0F0F0',
};

const formatLargeNumber = (value) => {
  if (value === null || value === undefined) return '';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString('vi-VN');
};

const formatNumberWithComma = (value) => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('vi-VN');
};

const formatDate = (dateStr, filter) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }

    switch (filter) {
      case 'day':
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      case 'week':
        return date.toLocaleDateString('vi-VN', { month: 'short' });
      case 'month':
        return date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
      case 'quarter':
      case 'year':
        return date.toLocaleDateString('vi-VN', { year: 'numeric' });
      default:
        return dateStr;
    }
  } catch (e) {
    return dateStr;
  }
};

const calculateNiceMax = (maxVal) => {
    if (maxVal <= 0) return { niceMax: 100, qtyInterval: 20 };
    const exponent = Math.floor(Math.log10(maxVal));
    const tenPower = Math.pow(10, exponent);
    const roughInterval = tenPower / 5;
    const niceMax = Math.ceil(maxVal / roughInterval) * roughInterval;
    const qtyInterval = niceMax / 5;
    if (niceMax === 0) return { niceMax: 100, qtyInterval: 20 };
    return { niceMax, qtyInterval };
};

export default {
  name: 'DualChart',
  props: {
    chartData: {
      type: Object,
      default: () => ({
        day: { datetime_data: [], import_data: [], export_data: [] },
        week: { datetime_data: [], import_data: [], export_data: [] },
        month: { datetime_data: [], import_data: [], export_data: [] },
        quarter: { datetime_data: [], import_data: [], export_data: [] },
        year: { datetime_data: [], import_data: [], export_data: [] },
      }),
    },
    isVisible: {
      type: Boolean,
      default: true,
    }
  },
  setup(props) {
    const chartRef = ref(null);
    let myChart = null;

    const timeFilter = ref('day');
    const viewMode = ref('chart'); 

    const langStore = useLanguageStore();

    const timeOptions = computed(() => [
      { key: 'day', label: langStore.t('dayFilterLabel') },
      { key: 'week', label: langStore.t('weekFilterLabel') },
      { key: 'month', label: langStore.t('monthFilterLabel') },
      { key: 'quarter', label: langStore.t('quarterFilterLabel') },
      { key: 'year', label: langStore.t('yearFilterLabel') },
    ]);

    const resizeChart = () => {
      if (myChart) {
        myChart.resize();
      }
    };

    const getChartDataByFilter = (filter) => {
      const quantityData = props.chartData[filter] || { datetime_data: [], import_data: [], export_data: [] };

      return {
        dates: quantityData.datetime_data || [],
        importQuantity: quantityData.import_data || [],
        exportQuantity: quantityData.export_data || [],
        filter: filter,
      };
    };

    const currentChartData = computed(() => {
      const languageTrigger = langStore.t('dualChartTitle');
      return getChartDataByFilter(timeFilter.value);
    });

    const updateChart = (data) => {
      if (!chartRef.value || !data || data.dates.length === 0 || viewMode.value === 'table') {
        if (myChart) myChart.dispose();
        myChart = null;
        return;
      }

      if (!myChart) {
        myChart = echarts.init(chartRef.value, null, { renderer: 'svg' });
      }

      const allQty = [...data.importQuantity, ...data.exportQuantity].filter(v => typeof v === 'number');
      const maxVal = allQty.length > 0 ? Math.max(...allQty) : 0;
      const { niceMax, qtyInterval } = calculateNiceMax(maxVal);

      const option = {
        animation: true,
        animationDuration: 1200, 
        animationEasing: 'bounceOut', 

        title: { show: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: { opacity: 0.1 }
          },
          formatter: (params) => {
            const formattedDate = formatDate(params[0].name, data.filter); 
            let tooltip = `<div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${formattedDate}</div>`;
            
            params.forEach(item => {
              let value = item.value.toLocaleString('vi-VN');

              tooltip += `
                <div style="display: flex; justify-content: space-between; align-items: center; line-height: 1.5; font-size: 13px;">
                  <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
                  ${item.seriesName}:
                  <span style="font-weight: bold; margin-left: 10px; color: ${item.color};">${value} (sp)</span>
                </div>
              `;
            });
            return tooltip;
          }
        },
        legend: {
          data: [langStore.t('importQuantityLegend'), langStore.t('exportQuantityLegend')],
          top: 10,
          right: '5%',
          itemGap: 25,
          icon: 'roundRect',
          textStyle: { color: '#303133', fontWeight: '500' }
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '10%', 
          top: '20%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates.map(date => formatDate(date, data.filter)), 
            axisPointer: { type: 'shadow' },
            boundaryGap: true,
            axisLabel: {
              rotate: data.dates.length > 7 ? 45 : 0, 
              interval: data.dates.length > 20 ? 'auto' : 0, 
              color: '#606266',
              fontSize: 11,
            },
            axisLine: { lineStyle: { color: COLORS.axisLine, width: 1 } }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: langStore.t('quantityYAxisName'),
            min: 0,
            max: niceMax,
            interval: qtyInterval, 
            axisLabel: {
              formatter: formatLargeNumber, 
              color: '#606266',
            },
            nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0], color: '#303133' },
            splitLine: { lineStyle: { type: 'dashed', color: COLORS.splitLine, opacity: 0.8 } },
            axisLine: { show: false }, 
            axisTick: { show: false }
          },
        ],
        series: [
          {
            name: langStore.t('importQuantityLegend'),
            type: 'bar',
            barGap: '0%',
            barCategoryGap: '25%',
            data: data.importQuantity,
            itemStyle: {
              color: COLORS.importGradient,
              borderRadius: [6, 6, 0, 0],
              opacity: 0.95
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: -5,
                shadowColor: BASE_COLORS.shadow,
                opacity: 1
              }
            },
            animationEasing: 'bounceOut', 
            yAxisIndex: 0,
          },
          {
            name: langStore.t('exportQuantityLegend'),
            type: 'bar',
            data: data.exportQuantity,
            itemStyle: {
              color: COLORS.exportGradient,
              borderRadius: [6, 6, 0, 0],
              opacity: 0.95
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: -5,
                shadowColor: BASE_COLORS.shadow,
                opacity: 1
              }
            },
            animationEasing: 'bounceOut',
            yAxisIndex: 0,
          },
        ]
      };

      myChart.setOption(option, true);
      myChart.resize();
    };

    watch([currentChartData, viewMode], ([newData]) => {
      if (props.isVisible && viewMode.value === 'chart') {
        updateChart(newData);
      } else if (viewMode.value === 'table') {
         if (myChart) myChart.dispose();
         myChart = null;
      }
    }, { deep: true, immediate: true });

    const setTimeFilter = (key) => {
      timeFilter.value = key;
    }

    watch(() => props.isVisible, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (viewMode.value === 'chart') {
             updateChart(currentChartData.value);
          }
        });
      }
    });

    onMounted(() => {
      window.addEventListener('resize', resizeChart);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeChart);
      if (myChart) {
        myChart.dispose();
      }
    });

    return {
      chartRef,
      timeFilter,
      timeOptions,
      viewMode, // Export viewMode
      setTimeFilter,
      formatDate, // Export formatDate để dùng trong bảng
      formatNumberWithComma, // Export formatNumberWithComma để dùng trong bảng
      langStore,
      currentChartData,
    };
  }
};
</script>

<style scoped>
.dual-chart-container {
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1); 
  background-color: #FFFFFF;
  transition: box-shadow 0.3s ease;
}

.dual-chart-container:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); 
}

.chart-header {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; 
  gap: 15px;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px; 
  border-bottom: 1px solid #EBEEF5;
}

.header-controls {
    display: flex;
    gap: 15px;
    align-items: center;
}

.chart-title {
  margin: 0;
  font-size: 1.4em;
  font-weight: 700;
  color: #303133;
}

.el-button {
    font-weight: 500;
}
.el-button.is-active-btn {
    background-color: #F2F6FC;
    color: #007AFF;
    border-color: #007AFF;
}

.time-filter-group {
  display: inline-flex;
  border-radius: 8px; 
  overflow: hidden;
  border: 1px solid #DCDFE6;
}

.time-filter-group .el-button {
  margin-left: 0 !important;
  border-radius: 0;
  padding: 6px 15px;
  border: none !important;
  color: #606266;
  background-color: white;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.time-filter-group .el-button.is-active {
  background-color: #007AFF !important; 
  color: white !important;
  font-weight: 600;
}

.time-filter-group .el-button:not(.is-active):hover {
  color: #007AFF;
  background-color: #F2F6FC;
}

.time-filter-group .el-button:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background-color: #DCDFE6;
}

.dual-chart-body {
  width: 100%;
  height: 480px; 
  padding: 15px;
}

.table-view {
    overflow-y: auto;
    padding: 20px 25px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: #303133;
}

.data-table th, .data-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #EBEEF5;
    text-align: left;
}

.data-table th {
    background-color: #F5F7FA;
    font-weight: 600;
    color: #606266;
    text-transform: uppercase;
    position: sticky;
    top: 0;
    z-index: 10;
}

.data-table tbody tr:hover {
    background-color: #F9F9FC;
}

.text-right {
    text-align: right;
    font-weight: 500;
}

.no-data-message {
    text-align: center;
    padding: 50px;
    color: #909399;
    font-size: 16px;
}
</style>