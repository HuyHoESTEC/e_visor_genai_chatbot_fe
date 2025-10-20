<!-- <template>
  <div class="dual-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Lượng hàng giao dịch</h3>
      <div class="time-filter-group">
        <el-button 
          v-for="time in timeOptions" 
          :key="time.key" 
          :type="timeFilter === time.key ? 'primary' : ''" 
          size="small"
          @click="setTimeFilter(time.key)"
        >
          {{ time.label }}
        </el-button>
      </div>
    </div>
    <div ref="chartRef" class="dual-chart-body"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts'; 


const mockData = {
  dates: ['19/10/2025', '20/10/2025', '21/10/2025', '22/10/2025', '23/10/2025', '24/10/2025', '25/10/2025'],
  importQuantity: [950, 250, 500, 500, 900, 350, 500],
  exportQuantity: [850, 1050, 980, 400, 800, 700, 520],
  importValue: [40000000, 5000000, 20000000, 20000000, 40000000, 15000000, 20000000], 
  exportValue: [40000000, 42000000, 40000000, 16000000, 38000000, 28000000, 20800000], 
};

const COLORS = {
  importQty: '#409EFF', 
  exportQty: '#67C23A',  
  importValue: '#E6A23C',
  exportValue: '#B3E59B', 
};

export default {
  name: 'DualChart',
  props: {
    chartData: {
      type: Object,
      default: () => mockData,
    },
 
    isVisible: { 
        type: Boolean,
        default: true,
    }
  },
  setup(props) {
    const chartRef = ref(null);
    let myChart = null;
    const timeFilter = ref('week');
    const timeOptions = [
      { key: 'week', label: 'Tuần' },
      { key: 'month', label: 'Tháng' },
      { key: 'quarter', label: 'Quý' },
    ];

    const formatCurrency = (value) => {
      if (value === 0) return '0';
      return (value / 1000000).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' Tr';
    };
    
    const resizeChart = () => {
        if (myChart) {
            myChart.resize();
        }
    };

    const updateChart = (data) => {
      if (!chartRef.value) return;
      
      if (!myChart) {
        myChart = echarts.init(chartRef.value);
      }

      const option = {
        title: { show: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            let tooltip = params[0].name + '<br/>';
            params.forEach(item => {
              const seriesName = item.seriesName;
              let value = item.value;
              
              if (seriesName.includes('Giá trị')) {
                value = value.toLocaleString('vi-VN') + ' VND';
              } else {
                value = value.toLocaleString('vi-VN');
              }
              tooltip += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${seriesName}: ${value}<br/>`;
            });
            return tooltip;
          }
        },
        legend: {
          data: ['Số lượng nhập', 'Số lượng xuất', 'Giá trị nhập (Triệu)', 'Giá trị xuất (Triệu)'],
          bottom: 5,
          itemGap: 15, 
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '15%', 
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates,
            axisPointer: { type: 'shadow' },
            boundaryGap: true,
            axisLabel: {
                rotate: 30,
                interval: 0, 
            },
          }
        ],
        yAxis: [
      
          {
            type: 'value',
            name: 'Số lượng',
            min: 0,
            max: 1050, 
            interval: 250, 
            axisLabel: { formatter: '{value}' },
            nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0] },
            splitLine: { lineStyle: { type: 'dashed' } }
          },
     
          {
            type: 'value',
            name: 'Giá trị (Triệu VND)',
            min: 0,
            max: 42000000, 
            interval: 10000000, 
            axisLabel: {
                formatter: (value) => formatCurrency(value),
                color: '#909399', 
            },
            nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0] },
            splitLine: { show: false }
          }
        ],
        series: [
  
          {
            name: 'Số lượng nhập',
            type: 'bar',
            data: data.importQuantity,
            itemStyle: { color: COLORS.importQty }, 
            yAxisIndex: 0, 
          },

          {
            name: 'Số lượng xuất',
            type: 'bar',
            data: data.exportQuantity,
            itemStyle: { color: COLORS.exportQty }, 
            yAxisIndex: 0, 
            barGap: '0%', 
            barCategoryGap: '20%',
          },

          {
            name: 'Giá trị nhập (Triệu)',
            type: 'line',
            yAxisIndex: 1, 
            data: data.importValue,
            itemStyle: { color: COLORS.importValue }, 
            lineStyle: { width: 3 },
            symbol: 'circle', 
            symbolSize: 8,
            markLine: {
                silent: true,
                lineStyle: { type: 'solid', color: COLORS.importValue, width: 1.5 },
                data: [{ yAxis: 40000000 }] 
            }
          },


          {
            name: 'Giá trị xuất (Triệu)',
            type: 'line',
            yAxisIndex: 1, 
            data: data.exportValue,
            itemStyle: { color: COLORS.exportValue }, 
            lineStyle: { width: 3 },
            symbol: 'triangle', 
            symbolSize: 8,
          }
        ]
      };

      myChart.setOption(option, true);
      myChart.resize(); 
    };
    
    watch(() => props.isVisible, (newVal) => {
        if (newVal) {
            nextTick(() => {
                updateChart(props.chartData);
            });
        }
    });

    watch(() => props.chartData, (newData) => {
        if (props.isVisible) {
            updateChart(newData);
        }
    }, { immediate: true });

    onMounted(() => {
        if (props.isVisible) {
            updateChart(props.chartData);
        }
        window.addEventListener('resize', resizeChart);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeChart);
        if (myChart) {
            myChart.dispose();
        }
    });
    
    const setTimeFilter = (key) => {
        timeFilter.value = key;
        // Logic gọi API/lọc dữ liệu theo key (Tuần/Tháng/Quý)
    }

    return {
      chartRef,
      timeFilter,
      timeOptions,
      setTimeFilter
    };
  }
};
</script>

<style scoped>
.dual-chart-container {
  padding: 0; 
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 5px 15px; 
}

.chart-title {
  margin: 0;
  font-size: 1.4em; 
  font-weight: 700; 
  color: #303133; 
}

.time-filter-group {
    display: inline-flex;
    border-radius: 4px;
    overflow: hidden; 
}

.time-filter-group .el-button {
  margin-left: 0; 
  border-radius: 0;
  padding: 8px 15px; 
  border-left: none; 
}

.time-filter-group .el-button--primary {
    background-color: #409EFF !important;
    border-color: #409EFF !important;
    color: white !important;
}

.time-filter-group .el-button:not(.el-button--primary) {
    background-color: white;
    border: 1px solid #DCDFE6;
    color: #606266;
}
.time-filter-group .el-button:not(.el-button--primary):hover {
    color: #409EFF;
    border-color: #A0CFFF;
}
.time-filter-group .el-button:first-child {
    border-left: 1px solid #DCDFE6; 
}

.dual-chart-body {
  width: 100%;
  height: 400px; 
  padding-top: 15px; 
}
</style> -->

<template>
  <div class="dual-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Lượng hàng giao dịch</h3>
      <div class="time-filter-group">
        <el-button 
          v-for="time in timeOptions" 
          :key="time.key" 
          :type="timeFilter === time.key ? 'primary' : ''" 
          size="small"
          @click="setTimeFilter(time.key)"
        >
          {{ time.label }}
        </el-button>
      </div>
    </div>
    <div ref="chartRef" class="dual-chart-body"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts'; 


// Dữ liệu mẫu (Tuần)
const mockData = {
  dates: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7'],
  importQuantity: [950, 250, 500, 500, 900, 350, 500],
  exportQuantity: [850, 1050, 980, 400, 800, 700, 520],
  importValue: [40000000, 5000000, 20000000, 20000000, 40000000, 15000000, 20000000], 
  exportValue: [40000000, 42000000, 40000000, 16000000, 38000000, 28000000, 20800000], 
};

// Dữ liệu mẫu (Tháng)
const mockDataMonth = {
    dates: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4'],
    importQuantity: [5000, 3500, 4500, 7000],
    exportQuantity: [4000, 6000, 3000, 5500],
    importValue: [200000000, 150000000, 180000000, 300000000], 
    exportValue: [180000000, 250000000, 120000000, 250000000], 
};

// Dữ liệu mẫu (Quý)
const mockDataQuarter = {
    dates: ['Quý 1', 'Quý 2', 'Quý 3'],
    importQuantity: [25000, 30000, 45000],
    exportQuantity: [22000, 28000, 40000],
    importValue: [1200000000, 1500000000, 2200000000],
    exportValue: [1100000000, 1400000000, 2000000000],
};


const COLORS = {
  importQty: '#409EFF', 
  exportQty: '#67C23A',  
  importValue: '#E6A23C',
  exportValue: '#B3E59B', 
};

export default {
  name: 'DualChart',
  props: {
    chartData: {
      type: Object,
      default: () => mockData,
    },
    isVisible: { 
        type: Boolean,
        default: true,
    }
  },
  setup(props) {
    const chartRef = ref(null);
    let myChart = null;
    const timeFilter = ref('week');
    const timeOptions = [
      { key: 'week', label: 'Tuần' },
      { key: 'month', label: 'Tháng' },
      { key: 'quarter', label: 'Quý' },
    ];

    const formatCurrency = (value) => {
      if (value === 0) return '0';
      return (value / 1000000).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' Tr';
    };
    
    const resizeChart = () => {
        if (myChart) {
            myChart.resize();
        }
    };
    
    // Hàm lấy dữ liệu dựa trên bộ lọc thời gian
    const getDataByFilter = (filter) => {
        switch (filter) {
            case 'month':
                return mockDataMonth;
            case 'quarter':
                return mockDataQuarter;
            case 'week':
            default:
                return props.chartData; 
        }
    };


    const updateChart = (data) => {
      if (!chartRef.value) return;
      
      if (!myChart) {
        myChart = echarts.init(chartRef.value);
      }
      
      // LOGIC TÍNH TOÁN MAX ĐỘNG CHO TRỤC Y
      const maxQty = Math.max(...data.importQuantity, ...data.exportQuantity) * 1.2;
      const maxVal = Math.max(...data.importValue, ...data.exportValue) * 1.2;
      
      // Đặt interval động để trục Y không quá dày đặc
      const qtyInterval = maxQty > 10000 ? 10000 : (maxQty > 1000 ? 500 : 250);
      const valInterval = maxVal > 1000000000 ? 500000000 : (maxVal > 100000000 ? 50000000 : 10000000);


      const option = {
        title: { show: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            let tooltip = params[0].name + '<br/>';
            params.forEach(item => {
              const seriesName = item.seriesName;
              let value = item.value;
              
              if (seriesName.includes('Giá trị')) {
                value = value.toLocaleString('vi-VN') + ' VND';
              } else {
                value = value.toLocaleString('vi-VN');
              }
              tooltip += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${seriesName}: ${value}<br/>`;
            });
            return tooltip;
          }
        },
        legend: {
          data: ['Số lượng nhập', 'Số lượng xuất', 'Giá trị nhập (Triệu)', 'Giá trị xuất (Triệu)'],
          bottom: 5,
          itemGap: 15, 
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '15%', 
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates,
            axisPointer: { type: 'shadow' },
            boundaryGap: true,
            axisLabel: {
                rotate: 30,
                interval: 0, 
            },
          }
        ],
        yAxis: [
          // TRỤC Y 1: Số lượng (Trái)
          {
            type: 'value',
            name: 'Số lượng',
            min: 0,
            max: maxQty, 
            interval: qtyInterval, 
            axisLabel: { formatter: '{value}' },
            nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0] },
            splitLine: { lineStyle: { type: 'dashed' } }
          },
          // TRỤC Y 2: Giá trị (Phải)
          {
            type: 'value',
            name: 'Giá trị (Triệu VND)',
            min: 0,
            max: maxVal, 
            interval: valInterval, 
            axisLabel: {
                formatter: (value) => formatCurrency(value),
                color: '#909399', 
            },
            nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0] },
            splitLine: { show: false }
          }
        ],
        series: [
          // 1. Bar Chart - Số lượng nhập
          {
            name: 'Số lượng nhập',
            type: 'bar',
            data: data.importQuantity,
            itemStyle: { color: COLORS.importQty }, 
            yAxisIndex: 0, 
          },
          // 2. Bar Chart - Số lượng xuất
          {
            name: 'Số lượng xuất',
            type: 'bar',
            data: data.exportQuantity,
            itemStyle: { color: COLORS.exportQty }, 
            yAxisIndex: 0, 
            barGap: '0%', 
            barCategoryGap: '20%',
          },
          // 3. Line Chart - Giá trị nhập
          {
            name: 'Giá trị nhập (Triệu)',
            type: 'line',
            yAxisIndex: 1, 
            data: data.importValue,
            itemStyle: { color: COLORS.importValue }, 
            lineStyle: { width: 3 },
            symbol: 'circle', 
            symbolSize: 8,
            markLine: {
                silent: true,
                lineStyle: { type: 'solid', color: COLORS.importValue, width: 1.5 },
                data: [{ yAxis: 40000000 }] 
            }
          },
          // 4. Line Chart - Giá trị xuất
          {
            name: 'Giá trị xuất (Triệu)',
            type: 'line',
            yAxisIndex: 1, 
            data: data.exportValue,
            itemStyle: { color: COLORS.exportValue }, 
            lineStyle: { width: 3 },
            symbol: 'triangle', 
            symbolSize: 8,
          }
        ]
      };

      myChart.setOption(option, true);
      myChart.resize(); 
    };
    
    // Theo dõi prop isVisible để fix lỗi resize khi chuyển tab
    watch(() => props.isVisible, (newVal) => {
        if (newVal) {
            nextTick(() => {
                // Khi hiển thị lại, gọi lại dữ liệu đang được chọn
                updateChart(getDataByFilter(timeFilter.value)); 
            });
        }
    });

    // Theo dõi thay đổi dữ liệu từ prop ban đầu (cho tab mặc định)
    watch(() => props.chartData, (newData) => {
        if (props.isVisible && timeFilter.value === 'week') {
            updateChart(newData);
        }
    }, { immediate: true });

    onMounted(() => {
        if (props.isVisible) {
            updateChart(props.chartData);
        }
        window.addEventListener('resize', resizeChart);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', resizeChart);
        if (myChart) {
            myChart.dispose();
        }
    });
    
    const setTimeFilter = (key) => {
        timeFilter.value = key;
        const newData = getDataByFilter(key);
        if (props.isVisible) {
             updateChart(newData);
        }
    }

    return {
      chartRef,
      timeFilter,
      timeOptions,
      setTimeFilter
    };
  }
};
</script>

<style scoped>
/* CSS giữ nguyên */
.dual-chart-container {
  padding: 0; 
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 5px 15px; 
}

.chart-title {
  margin: 0;
  font-size: 1.4em; 
  font-weight: 700; 
  color: #303133; 
}

.time-filter-group {
    display: inline-flex;
    border-radius: 4px;
    overflow: hidden; 
}

.time-filter-group .el-button {
  margin-left: 0; 
  border-radius: 0;
  padding: 8px 15px; 
  border-left: none; 
}

.time-filter-group .el-button--primary {
    background-color: #409EFF !important;
    border-color: #409EFF !important;
    color: white !important;
}

.time-filter-group .el-button:not(.el-button--primary) {
    background-color: white;
    border: 1px solid #DCDFE6;
    color: #606266;
}
.time-filter-group .el-button:not(.el-button--primary):hover {
    color: #409EFF;
    border-color: #A0CFFF;
}
.time-filter-group .el-button:first-child {
    border-left: 1px solid #DCDFE6; 
}

.dual-chart-body {
  width: 100%;
  height: 400px; 
  padding-top: 15px; 
}
</style>