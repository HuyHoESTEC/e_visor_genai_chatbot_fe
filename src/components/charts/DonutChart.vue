<template>
  <div class="donut-chart-container">
    <div class="chart-header">
      <h3 class="chart-title">Thống kê Lắp đặt</h3>
      <p class="chart-subtitle">Theo danh mục sản phẩm</p>
    </div>
    <div v-if="!hasData" class="no-data-message">
      <p>Không có dữ liệu biểu đồ để hiển thị.</p>
    </div>
    <div v-else class="chart-body">
      <div class="chart-item">
        <v-chart class="echart" :option="installationChartOption" autoresize />
        <p class="chart-label">Đã Lắp Đặt</p>
      </div>

      <div class="chart-item">
        <v-chart class="echart" :option="notinstallationChartOption" autoresize />
        <p class="chart-label">Chưa Lắp Đặt</p>
      </div>>
    </div>
  </div>
</template>

<script>

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { computed } from 'vue';
import { Position } from '@element-plus/icons-vue';
import { toPadding } from 'chart.js/helpers';

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

export default {
  name: 'DonutChart',
  components: {
    VChart,
  },
  props: {
    installationDataFromInventory: {
      type: Object,
      default: () => ({
        not_installation_by_date: [],
        installation_by_date: [],
      })
    },
  },
  setup(props){
    const createDonutOption = (data, title, colors) => {
      
    const chartData = Array.isArray(data) && data.length > 0 ? data : [];
    const finalData = chartData.length > 0 ? chartData : [
      { value: 1, name: 'Không có dữ liệu', itemStyle: { color: '#ccc' }, tooltip: { show: false } }
    ];

    const totalValue = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
    const hasRealData = chartData.length > 0;
      
    
    return { 
        color: colors,    
        title: {
          text: title,
          subtext: totalValue.toString(), 
          left: 'center',
          top: '35%', 
          textStyle: {
            fontSize: 18,
            color: '#303133',
          },
          subtextStyle: {
            fontSize: 26,
            fontWeight: 'bold',
            color: '#1a1a1a',
          },
        },
        
        tooltip: {
          trigger: 'item',
          textStyle:{
            fontSize: 14
          },
          formatter: hasRealData ? '{a} <br/>{b}: {c} ({d}%)' : 'Không có dữ liệu',
        },
      
        legend: {
          orient: 'horizontal',
          bottom: 0,
          itemGap: 20,
          textStyle:{
            fontSize: 13,
            color: '#333'
          },
          data: hasRealData ? chartData.map(item => item.name) : [], 
        },
        
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['55%', '75%'], 
            center: ['50%', '45%'], 
            avoidLabelOverlap: true,
            data: finalData,
            label: {
              show: hasRealData,
              formatter: '{b}\n{d}%', 
              overflow: 'truncate',
              position: 'outside',
              textStyle:{
                fontSize: 13,
                fontWeight: 'blod',
                color: '#333'
              },
              padding: [0, 0, 0, 0],
            },
            labelLine: {
              show: hasRealData,
              length: 10,
              lineStyle: {
                  color: '#999'
              }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
          },
        ],
      };
    };

    const hasData = computed(() => {
      const data = props.installationDataFromInventory;
      if (!data) return false;
     
      const installed = data.installation_by_date;
      const notInstalled = data.not_installation_by_date;

      return (Array.isArray(installed) && installed.length > 0) || (Array.isArray(notInstalled) && notInstalled.length > 0);
    });
    
    const installationChartOption = computed(() => {
      const installedData = props.installationDataFromInventory.installation_by_date;
      
      return createDonutOption(
          installedData, 
          'Đã Lắp Đặt',
          ['#67C23A', '#909399'] 
      );
    });
    
    const notinstallationChartOption = computed(() => {
      const notInstalledData = props.installationDataFromInventory.not_installation_by_date;

      return createDonutOption(
          notInstalledData, 
          'Chưa Lắp Đặt',
          ['#F56C6C', '#909399'] 
      );
    });

    return {
      hasData,
      installationChartOption,
      notinstallationChartOption,
    };
  }
};
</script>

<style scoped>
.donut-chart-container {
  padding: 30px; 
  background-color: #ffffff;
  border-radius: 12px; 
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.08); 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
}

.chart-header {
  text-align: center;
  margin-bottom: 30px;
}

.chart-title {
  font-size: 1.8em; 
  color: #1a1a1a;
  margin: 0;
  font-weight: 600; 
}

.chart-subtitle {
  font-size: 1em;
  color: #6a6a6a;
  margin-top: 5px;
}

.chart-body {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap; 
  gap: 20px;
}

.chart-item {
  width: 45%; 
  max-width: 350px; 
  min-width: 280px; 
  margin: 0;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border-radius: 8px;
}

.chart-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.echart {
  width: 100%;
  height: 320px; 
}

.chart-label {
  font-weight: 700; 
  font-size: 1.1em;
  margin-top: 15px;
  color: #333333; 
}

.no-data-message {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-style: italic;
  font-size: 1.1em;
}

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