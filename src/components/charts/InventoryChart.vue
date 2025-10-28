<template>
  <div class="inventory-chart-container">
    <div class="chart-header">
      <div class="chart-controls">
        <el-select v-model="selectedWarehouse" placeholder="Chọn Kho Hàng" size="small" style="width: 150px; margin-right: 15px;">
          <el-option label="Tất cả Kho" value="all" />
          <el-option label="Kho A" value="A" />
          <el-option label="Kho B" value="B" />
        </el-select>
        <el-select v-model="selectedMaterial" placeholder="Chọn Vật Liệu" size="small" style="width: 150px; margin-right: 15px;">
          <el-option label="Vật liệu 1" value="material1" />
          <el-option label="Vật liệu 2" value="material2" />
        </el-select>

        <el-radio-group v-model="timePeriod" size="small" @change="handleTimePeriodChange">
          <el-radio-button label="day">Ngày</el-radio-button>
          <el-radio-button label="week">Tuần</el-radio-button>
          <el-radio-button label="month">Tháng</el-radio-button>
          <el-radio-button label="quarter">Qúy</el-radio-button>
          <el-radio-button label="year">Năm</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div v-if="isLoadingData" class="chart-loading-overlay">
        <div class="el-loading-spinner">
            <svg viewBox="25 25 50 50" class="circular">
                <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
            </svg>
        </div>
    </div>
    <v-chart v-else-if="isMounted" class="chart" :option="chartOption" autoresize />
    <div v-else class="chart-empty-state">
        Không có dữ liệu để hiển thị.
    </div>

    <div class="chart-footer">
      <el-slider
        v-model="dataZoomValue"
        range
        :min="0"
        :max="100"
        :marks="sliderMarks"
        @change="handleSliderChange"
        style="padding: 0 10px;"
      />
      <div class="date-range-display">
        {{ dateRangeDisplay }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([
    CanvasRenderer,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    DataZoomComponent,
]);

export default {
    props: {
        // Chú ý: Kiểu dữ liệu là Array vì API trả về [{ day: {...}, ... }]
        initialData: { 
            type: Array, 
            default: () => ([{}]) 
        },
        // Thêm prop để nhận trạng thái loading từ component cha
        loading: {
            type: Boolean,
            default: false
        }
    },
    components: {
        VChart,
    },
    setup(props) {
        // --- State ---
        const selectedWarehouse = ref('all');
        const selectedMaterial = ref('material1');
        const timePeriod = ref('week'); 
        
        // **LƯU TRỮ DỮ LIỆU TỪ PROPS:** Lấy phần tử đầu tiên của mảng props
        const allChartData = ref(props.initialData[0] || {}); 
        const dataZoomValue = ref([0, 100]);
        const isMounted = ref(false);
        const isLoadingData = computed(() => props.loading);

        // --- Computed Properties để lấy dữ liệu hiện tại ---
        const currentData = computed(() => {
            const period = timePeriod.value;
            // Trả về dữ liệu tương ứng với timePeriod hoặc mảng rỗng nếu không có
            return allChartData.value[period] || { datetime_data: [], import_data: [], export_data: [] };
        });

        const xAxisData = computed(() => currentData.value.datetime_data);
        const importData = computed(() => currentData.value.import_data);
        const exportData = computed(() => currentData.value.export_data);

        // Kiểm tra xem có dữ liệu để hiển thị không
        const hasData = computed(() => xAxisData.value.length > 0);

        // --- Hàm Tải Dữ liệu (Mô phỏng lại logic lọc) ---
        // Trong môi trường component, chúng ta chỉ cần đảm bảo cập nhật allChartData từ props
        const updateChartData = () => {
             // Lấy dữ liệu từ props và gán vào allChartData (nếu có)
            if (props.initialData && props.initialData.length > 0) {
                 allChartData.value = props.initialData[0]; 
            } else {
                 allChartData.value = {};
            }
            // Reset dataZoomValue về [0, 100] khi dữ liệu thay đổi
            dataZoomValue.value = [0, 100];
        };

        // --- Handlers ---
        const handleTimePeriodChange = (value) => {
            timePeriod.value = value;
            // Gọi lại updateChartData để reset dataZoom và đảm bảo dữ liệu được cập nhật
            updateChartData(); 
            
            // NOTE: Nếu logic API của bạn yêu cầu lọc theo timePeriod LẠI TỪ ĐẦU, 
            // bạn cần emit sự kiện lên component cha để cha gọi API mới.
            // Ví dụ: context.emit('time-period-change', value);
        };

        const handleSliderChange = (newRange) => {
            dataZoomValue.value = newRange;
        };

        // --- Chart Option ---
        const chartOption = computed(() => ({
            backgroundColor: '#fff',
            legend: {
                data: [
                    { name: 'Nhập kho', icon: 'rect' },
                    { name: 'Xuất kho', icon: 'rect' }
                ],
                bottom: 0,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    let res = `<div style="font-weight: bold;">${params[0].name}</div>`;
                    params.forEach(item => {
                        res += `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>`
                            + `${item.seriesName}: <b>${item.value.toLocaleString('en-US')}</b> <br/>`;
                    });
                    return res;
                }
            },
            grid: {
                left: '3%',
                right: '3%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: xAxisData.value,
                axisLabel: {
                    rotate: 0,
                    interval: 0,
                },
                axisLine: { show: true, lineStyle: { color: '#DCDFE6' } },
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Số lượng',
                    position: 'left',
                    min: 0,
                    axisLabel: {
                        formatter: (value) => value.toLocaleString('en-US')
                    },
                    splitLine: { show: true, lineStyle: { type: 'dashed', color: '#E4E7ED' } }
                },
            ],
            series: [
                {
                    name: 'Nhập kho',
                    type: 'bar',
                    data: importData.value,
                    yAxisIndex: 0,
                    itemStyle: {
                        color: '#ff8a00', // Màu cam
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '35%',
                },
                {
                    name: 'Xuất kho',
                    type: 'bar',
                    data: exportData.value,
                    yAxisIndex: 0,
                    itemStyle: {
                        color: '#409eff', // Màu xanh
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '35%',
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: dataZoomValue.value[0],
                    end: dataZoomValue.value[1]
                },
            ]
        }));


        // --- Computed Property cho Date Range Display ---
        const dateRangeDisplay = computed(() => {
            if (xAxisData.value.length === 0) return '';

            const dataLength = xAxisData.value.length;
            const startIndex = Math.max(0, Math.floor((dataZoomValue.value[0] / 100) * (dataLength - 1)));
            const endIndex = Math.min(dataLength - 1, Math.floor((dataZoomValue.value[1] / 100) * (dataLength - 1)));

            const start = xAxisData.value[startIndex];
            const end = xAxisData.value[endIndex];

            return `${start || '...'} - ${end || '...'}`;
        });

        // --- Computed Property cho Slider Marks ---
        const sliderMarks = computed(() => {
            const marks = {};
            if (xAxisData.value.length > 0) {
                marks[0] = xAxisData.value[0];
                marks[100] = xAxisData.value[xAxisData.value.length - 1];
            }
            return marks;
        });
        
        // --- Watchers ---
        // Lắng nghe sự thay đổi của props.initialData từ component cha
        watch(() => props.initialData, (newVal) => {
            updateChartData();
        }, { deep: true });
        
        // Lắng nghe sự thay đổi của các bộ lọc (Kho, Vật liệu)
        watch([selectedWarehouse, selectedMaterial], () => {
             // NOTE: Bạn cần emit sự kiện lên component cha để gọi API mới với bộ lọc này
             // Ví dụ: context.emit('filter-change', { warehouse: selectedWarehouse.value, material: selectedMaterial.value });
             // Trong ví dụ này, tôi chỉ mô phỏng lại việc cập nhật dữ liệu nếu cần
             updateChartData();
        });

        // --- Lifecycle Hooks ---
        onMounted(() => {
            updateChartData();
            nextTick(() => {
                isMounted.value = true;
            })
        });

        return {
            selectedWarehouse,
            selectedMaterial,
            timePeriod,
            dataZoomValue,
            chartOption,
            dateRangeDisplay,
            sliderMarks,
            handleTimePeriodChange,
            handleSliderChange,
            isMounted,
            isLoadingData,
            hasData
        };
    }
};
</script>

<style scoped>
.inventory-chart-container {
  display: flex;
  flex-direction: column;
  height: 450px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  position: relative; /* Quan trọng cho overlay loading */
}

.chart-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 15px 0 15px;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart {
  flex-grow: 1;
  min-height: 300px;
}

.chart-footer {
  padding: 10px 15px;
  background-color: #f0f2f5;
  border-radius: 0 0 4px 4px;
}

.date-range-display {
  text-align: center;
  margin-top: 5px;
  font-size: 12px;
  color: #606266;
}

.el-radio-group {
    display: flex;
}

/* Thêm style cho Loading và Empty State */
.chart-loading-overlay, .chart-empty-state {
    position: absolute;
    top: 50px; /* Dưới header */
    left: 0;
    right: 0;
    bottom: 50px; /* Trên footer */
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 10;
    font-size: 14px;
    color: #909399;
}

.el-loading-spinner {
    text-align: center;
    padding: 20px;
}

.circular {
    height: 42px;
    width: 42px;
    animation: loading-rotate 2s linear infinite;
}

.path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: #409eff;
    stroke-linecap: round;
}

@keyframes loading-rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes loading-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124px;
    }
}
</style>