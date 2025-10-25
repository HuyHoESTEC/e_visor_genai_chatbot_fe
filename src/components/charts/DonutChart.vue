<template>
  <div class="chart-wrapper">
    <div class="donut-chart-container">
      <canvas ref="chartCanvas"></canvas>
      <div class="center-text">
        <div class="total-value">{{ formatNumber(totalValue) }}</div>
      </div>
    </div>
    
    <div class="legend">
      <ul>
        <li v-for="(label, index) in chartData.labels" :key="index">
          <span 
            class="color-box" 
            :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
          ></span>
          {{ label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default defineComponent({
  name: 'DonutChart',
  props: {
    inventoryData: {
      type: Array,
      required: true,
      default: () => ({ import: [], export: [], installation: [] })
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const chartData = computed(() => {
      const importQuantity = props.inventoryData.import || 0;
      const exportQuantity = props.inventoryData.export || 0;

      return {
        labels: [
          'Số lượng Nhập', 
          'Số lượng Xuất',
        ],
        datasets: [{
          data: [importQuantity, exportQuantity],
          backgroundColor: [
            '#007bff', 
            '#ff8c4a', 
          ],
          hoverOffset: 4,
          borderWidth: 0,
        }]
      };
    });
    
    const totalValue = computed(() => {
      const data = chartData.value.datasets[0].data;
      return data.reduce((sum, item) => sum + item, 0);
    });

    const formatNumber = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%', 
      animations: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: { weight: 'bold', size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
            boxPadding: 4,
            displayColors: true,          
            callbacks: {
              label: (context) => {
                let label = context.label || '';
                if (context.parsed !== null) {
                    const value = context.parsed;             
                    const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                    const percentage = total === 0 ? 0 : ((value / total) * 100).toFixed(2);
                    const formattedValue = formatNumber(value); 
                            label += `: ${formattedValue} (${percentage}%)`;
                }
                return label;
              }
            }
        }
      },
    };

    const renderChart = () => {
      if (!chartCanvas.value) return;

      if (chartInstance) {
        chartInstance.data.labels = chartData.value.labels;
        chartInstance.data.datasets = chartData.value.datasets;
        chartInstance.update();
      } else {
        const ctx = chartCanvas.value.getContext('2d');
        chartInstance = new ChartJS(ctx, {
          type: 'doughnut',
          data: chartData.value,
          options: chartOptions,
        });
      }
    };

    onMounted(renderChart);
    watch(chartData, renderChart, { deep: true });

    return {
      chartCanvas,
      chartData,
      totalValue,
      formatNumber,
    };
  }
});
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  align-items: center; 
  justify-content: center;
  gap: 20px;
  min-height: 280px; 
  padding: 10px;
}

.donut-chart-container {
  position: relative;
  height: 250px; 
  width: 250px; 
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  line-height: 1.2;
  color: #303133;
}

.total-value {
  font-size: 14px; 
  font-weight: bold;
  white-space: nowrap; 
}

.legend ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.legend li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9em;
  color: #606266;
}

.color-box {
  width: 14px;
  height: 14px;
  margin-right: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
</style>