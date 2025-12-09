<template>
  <div class="inventory-balance-chart-container">
    <div class="chart-header">
      <h3>Biểu đồ Cân bằng Tồn kho Lũy tiến 📈</h3>
      <p class="chart-subtitle">Theo dõi sự thay đổi tồn kho ròng (Nhập - Xuất) theo thời gian.</p>
    </div>
    <div v-if="isLoading" class="loading-state">
      <el-skeleton animated />
      <el-skeleton :rows="4" animated />
    </div>
    <v-chart
      v-else-if="chartOptions.xAxis.data && chartOptions.xAxis.data.length > 0"
      class="inventory-chart"
      :option="chartOptions"
      autoresize
    />
    <div v-else class="no-data-state">
      Không có dữ liệu hiển thị trong khoảng thời gian này.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import VChart from 'vue-echarts';

const props = defineProps({
  inventoryChart: {
    type: Object,
    required: true,
  },
  dualChartVal: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
  // THÊM: Prop cho Tồn kho ban đầu để tính giá trị lũy tiến
  initialStock: {
    type: Number,
    default: 0,
  }
});

/**
 * Tính toán dữ liệu Nhập, Xuất và đặc biệt là Tồn kho Lũy tiến (balanceData).
 */
const preparedData = computed(() => {
  // Mặc định sử dụng dữ liệu theo ngày ('day')
  const periodData = props.dualChartVal.day; 

  const dates = periodData?.datetime_data || [];
  const importData = periodData?.import_data || [];
  const exportData = periodData?.export_data || [];
  
  // 1. Tính toán Dữ liệu Tồn kho Lũy tiến (Cumulative Stock Balance)
  let currentBalance = props.initialStock;
  const balanceData = [];

  for (let i = 0; i < dates.length; i++) {
    const dailyImport = importData[i] || 0;
    const dailyExport = exportData[i] || 0;
    
    // Tồn kho ròng = Tồn kho trước đó + Nhập - Xuất
    currentBalance = currentBalance + dailyImport - dailyExport;
    balanceData.push(currentBalance);
  }

  return { dates, importData, exportData, balanceData };
});

const chartOptions = computed(() => {
  const data = preparedData.value;
  
  // Cấu hình series cho 3 loại dữ liệu: Nhập (Bar), Xuất (Bar), Tồn kho Lũy tiến (Line)
  const seriesConfig = [
    {
      name: 'Nhập kho (Import)',
      type: 'bar',
      data: data.importData,
      yAxisIndex: 0, // Sử dụng Trục Y thứ nhất
      itemStyle: { color: '#2c2c6a' }, // Màu Xanh Đậm
      barGap: '30%', // Cột cách nhau
      tooltip: { valueFormatter: (value) => value + ' sản phẩm' }
    },
    {
      name: 'Xuất kho (Export)',
      type: 'bar',
      data: data.exportData,
      yAxisIndex: 0, // Sử dụng Trục Y thứ nhất
      itemStyle: { color: '#f56c6c' }, // Màu Đỏ/Hồng
      tooltip: { valueFormatter: (value) => value + ' sản phẩm' }
    },
    {
      name: 'Tồn kho Lũy tiến',
      type: 'line', // Biểu đồ đường
      data: data.balanceData,
      yAxisIndex: 1, // SỬ DỤNG TRỤC Y THỨ HAI
      itemStyle: { color: '#409eff' }, // Màu Xanh Dương Nhạt
      lineStyle: { width: 3 },
      symbol: 'circle',
      symbolSize: 8,
      tooltip: { valueFormatter: (value) => value + ' sản phẩm' }
    }
  ];

  // Cấu hình 2 trục Y
  const yAxisConfig = [
    {
      type: 'value',
      name: 'Nhập/Xuất (Số lượng)',
      min: 0,
      position: 'left',
      axisLabel: { formatter: '{value}' },
      splitLine: { show: true }
    },
    {
      type: 'value',
      name: 'Tồn kho Lũy tiến', // Trục Y cho Biểu đồ Đường
      min: Math.min(0, ...data.balanceData), // Đảm bảo hiển thị số âm nếu có
      position: 'right',
      axisLabel: { formatter: '{value}' },
      splitLine: { show: false } // Không hiển thị lưới ngang cho trục này để tránh rối
    }
  ];

  return {
    grid: {
      left: '3%',
      right: '4%', // Cần nhiều khoảng trống hơn cho trục Y thứ 2
      bottom: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // Hàm formatter có thể được đơn giản hóa vì đã dùng valueFormatter ở series
    },
    legend: {
      data: ['Nhập kho (Import)', 'Xuất kho (Export)', 'Tồn kho Lũy tiến'],
      bottom: '1%'
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLabel: {
        rotate: 30, 
        interval: 'auto',
        // Định dạng ngày có thể cần tùy chỉnh thêm tùy vào định dạng dữ liệu
      }
    },
    yAxis: yAxisConfig,
    series: seriesConfig
  };
});
</script>

<style scoped>
/* Giữ nguyên style hoặc đổi tên class container cho phù hợp */
.inventory-balance-chart-container {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inventory-chart {
  height: 400px; 
  min-height: 350px;
  width: 100%;
  flex-grow: 1;
}

.chart-header {
  margin-bottom: 15px;
  text-align: center;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.chart-subtitle {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 0.9em;
}

.loading-state, .no-data-state {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 400px;
  color: #909399;
}
</style>