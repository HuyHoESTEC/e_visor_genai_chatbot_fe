<!-- <template>
  <div class="inventory-chart-container">
    <div class="chart-header">
      <div class="chart-controls">
        <el-select v-model="selectedWarehouse" placeholder="Tất cả kho" size="small" style="width: 120px; margin-right: 10px;">
          <el-option label="Tất cả kho" value="all" />
          </el-select>
        <el-select v-model="selectedMaterial" placeholder="Mã vật tư" size="small" style="width: 120px; margin-right: 10px;">
          <el-option label="Mã vật tư 1" value="material1" />
          <el-option label="Mã vật tư 2" value="material2" />
          <el-option label="Mã vật tư 3" value="material3" />
          </el-select>
        <el-radio-group v-model="timePeriod" size="small" @change="handleTimePeriodChange">
          <el-radio-button label="day">Ngày</el-radio-button>
          <el-radio-button label="week">Tuần</el-radio-button>
          <el-radio-button label="month">Tháng</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
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

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
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
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
]);

const props = defineProps({
  initialData: {
    type: Array,
    default: () => [
      { date: '2024-02-12', quantity: 90000, value: 50000 },
      { date: '2024-02-13', quantity: 40000, value: 5000 },
      { date: '2024-02-14', quantity: 55000, value: 70000 },
      { date: '2024-02-15', quantity: 95000, value: 45000 },
      { date: '2024-02-16', quantity: 35000, value: 40000 },
    ]
  }
});

const timeGrouping = ref('week');
const selectedWarehouse = ref('all');
const selectedMaterial = ref('material1');
const timePeriod = ref('week');
const chartData = ref(props.initialData);

const dataZoomValue = ref([0, 100]); 

const xAxisData = computed(() => chartData.value.map(item => item.date));
// Lấy dữ liệu cho cột (Số lượng)
const quantityData = computed(() => chartData.value.map(item => item.quantity));
// Lấy dữ liệu cho đường (Giá trị)
const valueData = computed(() => chartData.value.map(item => item.value));


const chartOption = computed(() => ({

  backgroundColor: '#fff',
  legend: {
    data: [
      { name: 'Số lượng', icon: 'rect' },
      { name: 'Giá trị (triệu đồng)', icon: 'line' }
    ],
    bottom: 0,
  },

  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' }
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

    {
      type: 'value',
      name: 'Giá trị (triệu đồng)',
      position: 'right',
      min: 0,
      axisLabel: {
        formatter: (value) => value.toLocaleString('en-US')
      },
      splitLine: { show: false } 
    }
  ],

  series: [
    {
      name: 'Số lượng',
      type: 'bar',
      data: quantityData.value,
      yAxisIndex: 0, 
      itemStyle: {
        color: '#ff8a00',
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: '50%'
    },
    {
      name: 'Giá trị (triệu đồng)',
      type: 'line',
      data: valueData.value,
      yAxisIndex: 1,
      itemStyle: {
        color: '#409eff' 
      },
      lineStyle: {
        width: 2.5
      },
      smooth: false, 
      symbol: 'circle',
      symbolSize: 8,
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


const dateRangeDisplay = computed(() => {
    if (xAxisData.value.length === 0) return '';
    
    const startIndex = Math.floor((dataZoomValue.value[0] / 100) * (xAxisData.value.length - 1));
    const endIndex = Math.floor((dataZoomValue.value[1] / 100) * (xAxisData.value.length - 1));

    const start = xAxisData.value[Math.min(startIndex, xAxisData.value.length - 1)];
    const end = xAxisData.value[Math.min(endIndex, xAxisData.value.length - 1)];
    
    return `${start || '...'} - ${end || '...'}`;
});

const sliderMarks = computed(() => {
    const marks = {};
    if (xAxisData.value.length > 0) {
        // Chỉ hiện thị mốc đầu và cuối
        marks[0] = xAxisData.value[0];
        marks[100] = xAxisData.value[xAxisData.value.length - 1];
    }
    return marks;
});

const setTimeGrouping = (group) => {
  timeGrouping.value = group;
  fetchChartData(group, selectedWarehouse.value, selectedMaterial.value);
};

const handleTimePeriodChange = (value) => {
    setTimeGrouping(value);
};

const handleSliderChange = (newRange) => {
  dataZoomValue.value = newRange;
};

const fetchChartData = (group, warehouse, material) => {
  console.log(`Fetching data for: ${group}, Warehouse: ${warehouse}, Material: ${material}`);
  
  if (group === 'day') {
    chartData.value = [
      { date: '2024-02-12', quantity: 90000, value: 50000 },
      { date: '2024-02-13', quantity: 40000, value: 5000 },
      { date: '2024-02-14', quantity: 55000, value: 70000 },
      { date: '2024-02-15', quantity: 95000, value: 45000 },
      { date: '2024-02-16', quantity: 35000, value: 40000 },
    ];
  } else if (group === 'week') {
    chartData.value = [
      { date: 'Tuần 1', quantity: 150000, value: 80000 },
      { date: 'Tuần 2', quantity: 120000, value: 55000 },
      { date: 'Tuần 3', quantity: 180000, value: 95000 },
      { date: 'Tuần 4', quantity: 110000, value: 40000 },
    ];
  } else if (group === 'month') {
    chartData.value = [
      { date: 'Tháng 1', quantity: 600000, value: 300000 },
      { date: 'Tháng 2', quantity: 450000, value: 200000 },
      { date: 'Tháng 3', quantity: 700000, value: 400000 },
    ];
  } else if (group === 'quarter') {
    chartData.value = [
      { date: 'Q1 2024', quantity: 1800000, value: 900000 },
      { date: 'Q2 2024', quantity: 1600000, value: 750000 },
    ];
  }

  dataZoomValue.value = [0, 100];
};

watch([selectedWarehouse, selectedMaterial], () => {
  fetchChartData(timeGrouping.value, selectedWarehouse.value, selectedMaterial.value);
});

onMounted(() => {
    fetchChartData(timeGrouping.value, selectedWarehouse.value, selectedMaterial.value);
});

</script>

<style scoped>
.inventory-chart-container {
  display: flex;
  flex-direction: column;
  height: 450px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 0 15px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
}

.chart-controls {
  display: flex;
  align-items: center;
}


.time-buttons .el-button {
    border-radius: 0;
    margin-left: 0;
}

.time-buttons .el-button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}
.time-buttons .el-button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

.chart {
  flex-grow: 1;
  min-height: 0;
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
    margin-right: 15px;
}
</style>
 -->

 <template>
  <div class="inventory-chart-container">
    <div class="chart-header">
      <div class="chart-controls">
        <el-select v-model="selectedWarehouse" placeholder="Tất cả kho" size="small" style="width: 120px; margin-right: 10px;">
          <el-option label="Tất cả kho" value="all" />
        </el-select>
        <el-select v-model="selectedMaterial" placeholder="Mã vật tư" size="small" style="width: 120px; margin-right: 10px;">
          <el-option label="Mã vật tư 1" value="material1" />
          <el-option label="Mã vật tư 2" value="material2" />
          <el-option label="Mã vật tư 3" value="material3" />
        </el-select>
        <el-radio-group v-model="timePeriod" size="small" @change="handleTimePeriodChange">
          <el-radio-button label="day">Ngày</el-radio-button>
          <el-radio-button label="week">Tuần</el-radio-button>
          <el-radio-button label="month">Tháng</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <v-chart class="chart" :option="chartOption" autoresize />
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
import { ref, computed, watch, onMounted } from 'vue';
import VChart from 'vue-echarts'; // Bỏ THEME_KEY nếu không dùng
import { use } from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
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
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
]);

export default {
    props: {
        initialData: {
            type: Array,
            default: () => [
                { date: '2024-02-12', quantity: 90000, value: 50000 },
                { date: '2024-02-13', quantity: 40000, value: 5000 },
                { date: '2024-02-14', quantity: 55000, value: 70000 },
                { date: '2024-02-15', quantity: 95000, value: 45000 },
                { date: '2024-02-16', quantity: 35000, value: 40000 },
            ]
        }
    },
    components: {
        VChart,
    },
    setup(props) {
  
        const timeGrouping = ref('week');
        const selectedWarehouse = ref('all');
        const selectedMaterial = ref('material1');
        const timePeriod = ref('week');
        const chartData = ref(props.initialData);
        const dataZoomValue = ref([0, 100]);

        // --- Computed ---
        const xAxisData = computed(() => chartData.value.map(item => item.date));
        const quantityData = computed(() => chartData.value.map(item => item.quantity));
        const valueData = computed(() => chartData.value.map(item => item.value));

        const chartOption = computed(() => ({
            backgroundColor: '#fff',
            legend: {
                data: [
                    { name: 'Số lượng', icon: 'rect' },
                    { name: 'Giá trị (triệu đồng)', icon: 'line' }
                ],
                bottom: 0,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
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
                {
                    type: 'value',
                    name: 'Giá trị (triệu đồng)',
                    position: 'right',
                    min: 0,
                    axisLabel: {
                        formatter: (value) => value.toLocaleString('en-US')
                    },
                    splitLine: { show: false }
                }
            ],
            series: [
                {
                    name: 'Số lượng',
                    type: 'bar',
                    data: quantityData.value,
                    yAxisIndex: 0,
                    itemStyle: {
                        color: '#ff8a00',
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '50%'
                },
                {
                    name: 'Giá trị (triệu đồng)',
                    type: 'line',
                    data: valueData.value,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: '#409eff'
                    },
                    lineStyle: {
                        width: 2.5
                    },
                    smooth: false,
                    symbol: 'circle',
                    symbolSize: 8,
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


        const dateRangeDisplay = computed(() => {
            if (xAxisData.value.length === 0) return '';

            const startIndex = Math.floor((dataZoomValue.value[0] / 100) * (xAxisData.value.length - 1));
            const endIndex = Math.floor((dataZoomValue.value[1] / 100) * (xAxisData.value.length - 1));

            const start = xAxisData.value[Math.min(startIndex, xAxisData.value.length - 1)];
            const end = xAxisData.value[Math.min(endIndex, xAxisData.value.length - 1)];

            return `${start || '...'} - ${end || '...'}`;
        });

        const sliderMarks = computed(() => {
            const marks = {};
            if (xAxisData.value.length > 0) {
                // Chỉ hiện thị mốc đầu và cuối
                marks[0] = xAxisData.value[0];
                marks[100] = xAxisData.value[xAxisData.value.length - 1];
            }
            return marks;
        });

        // --- Methods ---
        const fetchChartData = (group, warehouse, material) => {
            console.log(`Fetching data for: ${group}, Warehouse: ${warehouse}, Material: ${material}`);

            if (group === 'day') {
                chartData.value = [
                    { date: '2024-02-12', quantity: 90000, value: 50000 },
                    { date: '2024-02-13', quantity: 40000, value: 5000 },
                    { date: '2024-02-14', quantity: 55000, value: 70000 },
                    { date: '2024-02-15', quantity: 95000, value: 45000 },
                    { date: '2024-02-16', quantity: 35000, value: 40000 },
                ];
            } else if (group === 'week') {
                chartData.value = [
                    { date: 'Tuần 1', quantity: 150000, value: 80000 },
                    { date: 'Tuần 2', quantity: 120000, value: 55000 },
                    { date: 'Tuần 3', quantity: 180000, value: 95000 },
                    { date: 'Tuần 4', quantity: 110000, value: 40000 },
                ];
            } else if (group === 'month') {
                chartData.value = [
                    { date: 'Tháng 1', quantity: 600000, value: 300000 },
                    { date: 'Tháng 2', quantity: 450000, value: 200000 },
                    { date: 'Tháng 3', quantity: 700000, value: 400000 },
                ];
            } 
            
            dataZoomValue.value = [0, 100];
        };
        
        const setTimeGrouping = (group) => {
            timeGrouping.value = group;
            fetchChartData(group, selectedWarehouse.value, selectedMaterial.value);
        };

        const handleTimePeriodChange = (value) => {
            setTimeGrouping(value);
        };

        const handleSliderChange = (newRange) => {
            dataZoomValue.value = newRange;
        };

        // --- Watchers & Lifecycle Hooks ---
        watch([selectedWarehouse, selectedMaterial], () => {
            fetchChartData(timeGrouping.value, selectedWarehouse.value, selectedMaterial.value);
        });

        onMounted(() => {
            fetchChartData(timeGrouping.value, selectedWarehouse.value, selectedMaterial.value);
        });

        // 4. TRẢ VỀ DỮ LIỆU/HÀM ĐỂ SỬ DỤNG TRONG TEMPLATE
        return {
            selectedWarehouse,
            selectedMaterial,
            timePeriod,
            dataZoomValue,
            chartOption,
            dateRangeDisplay,
            sliderMarks,
            handleTimePeriodChange,
            handleSliderChange
        };
    }
};
</script>

<style scoped>
.inventory-chart-container {
  display: flex;
  flex-direction: column;
  height: 450px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 0 15px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
}

.chart-controls {
  display: flex;
  align-items: center;
}


.time-buttons .el-button {
    border-radius: 0;
    margin-left: 0;
}

.time-buttons .el-button:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}
.time-buttons .el-button:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}

.chart {
  flex-grow: 1;
  min-height: 0;
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
    margin-right: 15px;
}
</style>