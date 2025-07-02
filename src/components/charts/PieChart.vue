<template>
  <div class="chart-container">
    <h3>Biểu đồ tròn: Phân phối sản phẩm</h3>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Pie } from "vue-chartjs"; // Changed from Bar to Pie
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Added ArcElement for Pie Chart
  CategoryScale, // CategoryScale is not typically needed for Pie Charts, but doesn't hurt
  LinearScale, // LinearScale is not typically needed for Pie Charts, but doesn't hurt
} from "chart.js";
import { ref } from "vue";

export default {
  name: "PieChart", // Component name updated
  components: {
    Pie, // Registered Pie component
  },
  setup() {
    // Registered ArcElement, removed BarElement
    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

    const chartData = ref({
      labels: ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C", "Sản phẩm D"],
      datasets: [
        {
          backgroundColor: ["#4BC0C0", "#FFCD56", "#FF6384", "#36A2EB"],
          data: [300, 50, 100, 120], // Your data looks good for a Pie Chart!
        },
      ],
    });

    const chartOptions = ref({
      responsive: false, // Typically, Pie charts benefit from being responsive
      maintainAspectRatio: false,
    });

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style scoped>
.chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  max-width: 500px; /* Added max-width for better display of Pie Chart */
  margin-left: auto;
  margin-right: auto;
}

h3 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
}
</style>
