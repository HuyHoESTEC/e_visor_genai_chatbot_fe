<template>
  <div class="dual-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Lượng Hàng Giao Dịch</h3> 
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
    <div ref="chartRef" class="dual-chart-body"></div>
  </div>
</template>=
<script>
import { ref, onMounted, watch, onBeforeUnmount, nextTick, computed } from 'vue';
import * as echarts from 'echarts'; 

// --- Cấu hình Màu sắc ---
const COLORS = {
  importQty: '#007AFF', // Xanh Dương (Blue) hiện đại
  exportQty: '#34C759', // Xanh Lá (Green) tươi tắn
};

// --- Hàm Định dạng Số Lớn Cho Trục Y (Giúp dễ đọc) ---
const formatLargeNumber = (value) => {
    // Định dạng số hàng nghìn/triệu (ví dụ: 1000 -> 1K)
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    // Định dạng số thông thường
    return value.toLocaleString('vi-VN'); 
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
    // Đặt mặc định là 'day' để khớp với dữ liệu ví dụ trong ảnh
    const timeFilter = ref('day'); 
    
    const timeOptions = [
      { key: 'day', label: 'Ngày' }, 
      { key: 'week', label: 'Tuần' },
      { key: 'month', label: 'Tháng' },
      { key: 'quarter', label: 'Quý' },
      { key: 'year', label: 'Năm' }, 
    ];
    
    // Hàm resize biểu đồ
    const resizeChart = () => {
        if (myChart) {
            myChart.resize();
        }
    };
    
    // Lấy dữ liệu theo bộ lọc thời gian hiện tại
    const getChartDataByFilter = (filter) => {
        const quantityData = props.chartData[filter] || { datetime_data: [], import_data: [], export_data: [] };

        return {
            dates: quantityData.datetime_data || [],
            importQuantity: quantityData.import_data || [],
            exportQuantity: quantityData.export_data || [],
        };
    };

    // Dữ liệu biểu đồ hiện tại (sử dụng computed để phản ứng với thay đổi filter)
    const currentChartData = computed(() => {
        return getChartDataByFilter(timeFilter.value);
    });

    // Hàm Cập nhật Biểu đồ (chứa tất cả cấu hình ECharts)
    const updateChart = (data) => {
      if (!chartRef.value || !data || data.dates.length === 0) {
        if (myChart) myChart.dispose();
        myChart = null;
        return;
      }
      
      if (!myChart) {
        myChart = echarts.init(chartRef.value);
      }
      
      // --- Logic tính toán Max và Interval cho Trục Y (Tối ưu hiển thị) ---
      const allQty = [...data.importQuantity, ...data.exportQuantity].filter(v => typeof v === 'number');
      const maxVal = allQty.length > 0 ? Math.max(...allQty) : 0;
      
      // Tính Max làm tròn lên 10% và bội số của 5 để trục Y đẹp hơn
      const niceMax = maxVal === 0 ? 100 : Math.ceil(maxVal * 1.1 / 5) * 5; 
      const qtyInterval = niceMax / 5 > 0 ? niceMax / 5 : 20; 
      
      const option = {
            // --- Animation & Hiệu ứng ---
            animation: true, 
            animationDuration: 1200, // Kéo dài thời gian animation
            animationEasing: 'cubicOut',

        title: { show: false },
        tooltip: {
          trigger: 'axis',
          axisPointer: { 
                type: 'shadow',
                shadowStyle: { 
                    opacity: 0.1 
                }
            },
            // --- Định dạng Tooltip chi tiết hơn ---
          formatter: (params) => {
            let tooltip = `<div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${params[0].name}</div>`;
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
          data: ['Số lượng nhập', 'Số lượng xuất'],
          top: 10, // Đặt Legend lên trên
          right: '5%',
          itemGap: 25, 
          icon: 'roundRect', // Icon Legend hình chữ nhật bo tròn
          textStyle: { color: '#303133' }
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '5%', 
          top: '20%', 
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: data.dates,
            axisPointer: { type: 'shadow' },
            boundaryGap: true,
            axisLabel: {
                rotate: 30, // Xoay chữ trục X nếu cần
                interval: 0, 
                color: '#606266', 
            },
          	axisLine: { lineStyle: { color: '#DCDFE6' } }
          }
        ],
        yAxis: [
          {
            type: 'value',
            // Tên trục Y rõ ràng hơn
            name: 'Số lượng', 
            min: 0,
            max: niceMax, 
            interval: qtyInterval, 
            axisLabel: { 
                // Định dạng số lớn (K, M) cho trục Y dễ đọc
                formatter: formatLargeNumber, 
                color: '#606266',
            },
          	nameTextStyle: { fontWeight: 'bold', padding: [0, 0, 10, 0], color: '#303133' },
          	splitLine: { lineStyle: { type: 'solid', color: '#EBEEF5', opacity: 0.6 } } 
          },
        ],
        series: [
          {
            name: 'Số lượng nhập',
            type: 'bar',
            barGap: '0%', 
            barCategoryGap: '20%',
            data: data.importQuantity, 
          	itemStyle: { 
                color: COLORS.importQty, 
                borderRadius: [5, 5, 0, 0], // Bo tròn góc trên cột
                opacity: 0.9
            }, 
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.3)', // Hiệu ứng đổ bóng khi hover
                    opacity: 1
                }
            },
            animationEasing: 'elasticOut', // Hiệu ứng bật nảy cho cột
            yAxisIndex: 0, 
          },
          {
            name: 'Số lượng xuất',
            type: 'bar',
            data: data.exportQuantity, 
          	itemStyle: { 
                color: COLORS.exportQty,
                borderRadius: [5, 5, 0, 0],
                opacity: 0.9
            }, 
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: 1
                }
            },
            animationEasing: 'elasticOut', 
            yAxisIndex: 0, 
          },
        ]
      };

      myChart.setOption(option, true);
      myChart.resize(); 
    };
    
    // Watcher: Cập nhật biểu đồ khi dữ liệu thay đổi
    watch(currentChartData, (newData) => {
        if (props.isVisible) {
            updateChart(newData);
        }
    }, { deep: true, immediate: true }); 

    const setTimeFilter = (key) => {
        timeFilter.value = key;
    }
    
    // Cập nhật khi component hiển thị (khi dùng trong tab/modal)
    watch(() => props.isVisible, (newVal) => {
        if (newVal) {
            nextTick(() => {
                updateChart(currentChartData.value); 
            });
        }
    });

    // Lifecycle: Xử lý resize cửa sổ
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
      setTimeFilter,
    };
  }
};
</script>

<style scoped>
/* --- Style Bổ sung để làm đẹp giao diện --- */
.dual-chart-container {
    padding: 0; 
    border-radius: 8px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Thêm đổ bóng nhẹ */
    background-color: #FFFFFF;
}

.chart-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px 10px 20px; 
    border-bottom: 1px solid #EBEEF5; 
}

.chart-title {
    margin: 0;
    font-size: 1.4em; 
    font-weight: 700; 
    color: #303133; 
}

/* --- Style cho nhóm nút lọc thời gian --- */
.time-filter-group {
    display: inline-flex;
    border-radius: 6px; 
    overflow: hidden; 
    border: 1px solid #DCDFE6; 
}

.time-filter-group .el-button {
    /* Style cơ bản */
    margin-left: 0 !important; 
    border-radius: 0;
    padding: 6px 15px; 
    border: none !important; 
    color: #606266;
    background-color: white;
    transition: all 0.2s ease-in-out; 
    position: relative;
}

/* Nút được chọn */
.time-filter-group .el-button.is-active {
    background-color: #007AFF !important; /* Màu xanh hiện đại */
    color: white !important;
    font-weight: bold;
}

/* Hover cho nút không được chọn */
.time-filter-group .el-button:not(.is-active):hover {
    color: #007AFF;
    background-color: #F2F6FC; 
}

/* Đường phân cách giữa các nút */
/* Dùng pseudo-element để tạo đường kẻ đứng đẹp mắt hơn */
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
    height: 450px; /* Tăng chiều cao để biểu đồ thoáng hơn */
    padding: 15px; 
}
</style>