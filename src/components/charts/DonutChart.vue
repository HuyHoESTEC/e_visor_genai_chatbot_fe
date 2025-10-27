<!-- <template>
  <el-row :gutter="20">
    <el-col :span="8">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>📊 {{ langStore.t('Thống kê Nhập hàng') || 'Thống kê Nhập hàng' }}</span>
          </div>
        </template>
        <div v-loading="isLoading" class="chart-container">
          <v-chart :option="importChartOption" autoresize class="echart-instance" />
        </div>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>📦 {{ langStore.t('Thống kê Xuất hàng') || 'Thống kê Xuất hàng' }}</span>
          </div>
        </template>
        <div v-loading="isLoading" class="chart-container">
          <v-chart :option="exportChartOption" autoresize class="echart-instance" />
        </div>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>🛠️ {{ langStore.t('Thống kê Lắp đặt') || 'Thống kê Lắp đặt' }}</span>
          </div>
        </template>
        <div v-loading="isLoading" class="chart-container">
          <v-chart :option="installationChartOption" autoresize class="echart-instance" />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed, watch } from 'vue'; 
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';

import { TitleComponent, TooltipComponent, LegendComponent, GraphicComponent } from 'echarts/components'; 

import { useLoadWarehouseChart } from '../../composables/Warehouse/useLoadWarehouseChart'; 

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GraphicComponent, // Đã thêm
]);


export default defineComponent({
  name: 'DonutChart',
  components: {
    VChart,
  },
  props: {
    langStore: {
      type: Object,
      required: true,
    },
    startAndEndDateVal: {
      type: Object, // ref
      required: true,
    },
    loadDashboardWithFilters: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
  
    const {
      donutChart,
      isLoading,
      fetchDashboardData,
    } = useLoadWarehouseChart(
      props.langStore,
      props.startAndEndDateVal,
      props.loadDashboardWithFilters
    );

    const transformData = (data) => {
      if (!Array.isArray(data)) return [];

      return data.map(item => ({
        name: item.project_code || props.langStore.t('UnknownCategory'),
        value: item.total_quantity || 0
      }));
    };

    const createDonutChartOption = (data, titleKey, isPreformatted = false) => {
      const chartTitle = props.langStore.t(titleKey) || titleKey;
      const formattedData = isPreformatted ? data : transformData(data);

      const totalValue = formattedData.reduce((sum, item) => sum + item.value, 0);

  
      if (totalValue === 0) {
        return {
          title: { show: false }, 
       
          graphic: { 
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: props.langStore.t('NoData') || 'Không có dữ liệu',
              fill: '#909399', 
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          series: [
            {
              type: 'pie',
              radius: ['45%', '65%'], 
              center: ['50%', '55%'], 
              data: [{ value: 1, name: 'NoDataPlaceholder' }],
              color: ['#F2F6FC'],
              label: { show: false },
              emphasis: { scale: false }
            },
          ],
          tooltip: { show: false },
          legend: { show: false },
        };
      }
      
      return {
        graphic: { show: false }, 
        color: COLOR_PALETTE,
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const formattedValue = params.value.toLocaleString('vi-VN');
            return `${params.marker} ${params.name}<br/>**${formattedValue}** (${params.percent}%)`;
          },
          textStyle: {
            fontSize: 13,
            fontWeight: 'bold',
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          borderColor: '#ebeef5', 
          borderWidth: 1,
          extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);' 
        },
        legend: {
          orient: 'vertical',
          left: '2%', 
          top: 'center', 
          data: formattedData.map(item => item.name),
          itemGap: 10,
          itemWidth: 10, 
          itemHeight: 10, 
          textStyle: {
            color: '#606266',
            fontSize: 12,
            padding: [0, 0, 0, 5]
          },
        },
        series: [
          {
            name: chartTitle,
            type: 'pie',
            radius: ['50%', '75%'], 
            center: ['65%', '50%'], 
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 5, 
              borderColor: '#fff',
              borderWidth: 2,
            },
            emphasis: {
              scale: true,
              scaleSize: 10,
              itemStyle: {
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b|{b}}\n{d|{d}%}', 
              padding: [0, -40, 20, -40],
              rich: {
                b: {
                  fontSize: 13,
                  color: '#303133',
                  lineHeight: 20
                },
                d: {
                  fontSize: 12,
                  color: '#909399'
                }
              }
            },
            labelLine: {
              show: true,
              length: 15,
              length2: 40,
              smooth: 0.2,
              lineStyle: {
                width: 1,
                color: '#DCDFE6' 
              }
            },
            data: formattedData,
          },
         
          {
            type: 'pie',
            radius: ['0%', '50%'],
            center: ['65%', '50%'],
            label: {
              show: true,
              position: 'center',
              formatter: `{total|${totalValue.toLocaleString('vi-VN')}} \n {title|${props.langStore.t('Total') || 'Tổng'}}`,
              rich: {
                total: {
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#303133',
                  lineHeight: 35
                },
                title: {
                  fontSize: 14,
                  color: '#909399'
                }
              }
            },
            data: [{ value: totalValue, name: 'Total Placeholder' }],
            silent: true,
            itemStyle: {
              color: 'transparent'
            },
            tooltip: { show: false },
          }
        ],
      };
    };



    const importChartOption = computed(() =>
      createDonutChartOption(donutChart.value.import, 'Import')
    );

    const exportChartOption = computed(() =>
      createDonutChartOption(donutChart.value.export, 'Export')
    );

    const installationChartOption = computed(() =>
      createDonutChartOption(donutChart.value.installation, 'Installation', true)
    );

  
    watch(
      () => props.startAndEndDateVal ? props.startAndEndDateVal.value : null, 
      (newVal, oldVal) => {
        const isFilterChanged = JSON.stringify(newVal) !== JSON.stringify(oldVal);
        if (isFilterChanged) {
            fetchDashboardData(); 
        }
      },
      { deep: true }
    );


    return {
      donutChart,
      isLoading,
      importChartOption,
      exportChartOption,
      installationChartOption,
      langStore: props.langStore,
    };
  }
});
</script>

<style scoped>

.chart-card {
  min-height: 400px;

  transition: all 0.3s ease-in-out; 

  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05); 
}


.chart-card:hover {
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.1); 
  transform: translateY(-2px); 
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-bottom: 5px; 

  border-bottom: 1px solid #EBEEF5; 
  margin-bottom: 15px; 
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  display: flex;
  align-items: center;
}


.card-header span::before {
  margin-right: 8px;
}

.chart-container {
  height: 300px; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.echart-instance {
  width: 100%;
  height: 100%;
}
</style> -->
<template>
  <div class="donut-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Thống kê Nhập/Xuất/Lắp đặt</h3>
      <p class="chart-subtitle">Theo danh mục sản phẩm</p>
    </div>
    <div v-if="!hasData" class="no-data-message">
      <p>Không có dữ liệu biểu đồ để hiển thị.</p>
    </div>
    <div v-else class="chart-body">
      <div class="chart-item">
        <v-chart class="echart" :option="importChartOption" autoresize />
        <p class="chart-label">Nhập kho</p>
      </div>

      <div class="chart-item">
        <v-chart class="echart" :option="exportChartOption" autoresize />
        <p class="chart-label">Xuất kho</p>
      </div>

      <div class="chart-item">
        <v-chart class="echart" :option="installationChartOption" autoresize />
        <p class="chart-label">Lắp đặt</p>
      </div>
    </div>
  </div>
</template>

<script>
// Giả định bạn đã cài đặt ECharts: npm install echarts vue-echarts
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

// Đăng ký các module cần thiết
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

export default {
  // Sử dụng cấu trúc export default cho component
  name: 'DonutChart',
  components: {
    VChart,
  },
  props: {
    // Nhận dữ liệu donutChart từ useLoadWarehouseChart
    donutChartData: {
      type: Object,
      required: true,
      default: () => ({
        import: [],
        export: [],
        installation: [],
      }),
    },
  },
  computed: {
    // Kiểm tra xem có dữ liệu nào để hiển thị không
    hasData() {
      return (
        this.donutChartData.import.length > 0 ||
        this.donutChartData.export.length > 0 ||
        this.donutChartData.installation.length > 0
      );
    },

    // --- Options cho từng biểu đồ ---
    importChartOption() {
      return this.createDonutOption(
        this.donutChartData.import,
        'Nhập kho',
        ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'] // Màu sắc tùy chỉnh
      );
    },
    exportChartOption() {
      return this.createDonutOption(
        this.donutChartData.export,
        'Xuất kho',
        ['#F56C6C', '#E6A23C', '#909399', '#409EFF', '#67C23A']
      );
    },
    installationChartOption() {
      // Dữ liệu lắp đặt có cấu trúc hơi khác, cần xử lý để đảm bảo phù hợp
      const installationData = this.donutChartData.installation.filter(item => item.value > 0);
      return this.createDonutOption(
        installationData,
        'Lắp đặt',
        ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399']
      );
    },
  },
  methods: {
    /**
     * Hàm tạo cấu hình biểu đồ Donut Chart chung
     * @param {Array} data - Dữ liệu dạng [{ name: '...', value: '...' }]
     * @param {String} title - Tiêu đề phụ (sub-title)
     * @param {Array} colors - Mảng màu sắc cho biểu đồ
     * @returns {Object} Cấu hình ECharts option
     */
    createDonutOption(data, title, colors) {
      // Tính tổng giá trị để hiển thị ở trung tâm
      const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

      return {
        // Cấu hình màu sắc
        color: colors,
        // Tiêu đề: Hiển thị Tổng giá trị ở giữa
        title: {
          text: title,
          subtext: totalValue.toString(), // Tổng giá trị
          left: 'center',
          top: '35%', // Đặt ở giữa biểu đồ
          textStyle: {
            fontSize: 14,
            color: '#303133',
          },
          subtextStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#606266',
          },
        },
        // Tooltip (hiển thị khi di chuột)
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        // Legend (chú thích)
        legend: {
          orient: 'horizontal',
          bottom: 'bottom',
          data: data.map(item => item.name), // Lấy tên từ dữ liệu
        },
        // Cấu hình Series (Biểu đồ chính)
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['50%', '70%'], // Tạo hiệu ứng Donut
            center: ['50%', '45%'], // Đặt vị trí biểu đồ
            avoidLabelOverlap: true,
            label: {
              show: true,
              formatter: '{b}\n{d}%', // Hiển thị tên và %
              overflow: 'truncate',
            },
            labelLine: {
              show: true,
              length: 5, // Chiều dài đường dẫn
            },
            data: data,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.donut-chart-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  text-align: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.5em;
  color: #303133;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.9em;
  color: #909399;
  margin-top: 5px;
}

.chart-body {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
}

.chart-item {
  width: 30%; /* Chiếm khoảng 1/3, có thể điều chỉnh */
  min-width: 250px; /* Đảm bảo kích thước tối thiểu */
  margin: 10px;
  text-align: center;
}

.echart {
  width: 100%;
  height: 300px; /* Chiều cao cố định cho biểu đồ */
}

.chart-label {
  font-weight: bold;
  margin-top: 10px;
  color: #606266;
}

.no-data-message {
  text-align: center;
  padding: 50px 0;
  color: #909399;
  font-style: italic;
}

/* Media query cho thiết bị di động */
@media (max-width: 768px) {
  .chart-body {
    flex-direction: column;
    align-items: center;
  }
  .chart-item {
    width: 90%;
    margin: 15px 0;
  }
}
</style>