
<template>
  <div class="chart-wrapper">
    <div class="donut-chart-container">
      <canvas ref="chartCanvas"></canvas>
      <div class="center-text">
        <div class="total-value">{{ formatCurrency(totalValue) }}</div>
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
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chartInstance = null;

    const chartData = computed(() => {
      const holdValue = props.inventoryData[0]?.value || 0;
      const exportableValue = props.inventoryData[1]?.value || 0;

      return {
        labels: [
          'Giá trị VT bị giữ (VNĐ)',
          'Giá trị VT có thể xuất (VNĐ)',
        ],
        datasets: [{
          data: [holdValue, exportableValue],
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
        return props.inventoryData.reduce((sum, item) => sum + item.value, 0);
    });

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
                    const formattedValue = new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        minimumFractionDigits: 0
                    }).format(value);                  
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
        chartInstance.data = chartData.value;
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


    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
      }).format(value);
    };

    onMounted(renderChart);
    watch(chartData, renderChart, { deep: true });

    return {
      chartCanvas,
      chartData,
      totalValue,
      formatCurrency,
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