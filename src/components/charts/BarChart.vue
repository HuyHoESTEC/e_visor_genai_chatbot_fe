<template>
  <div class="chart-container">
    <h3>Biểu đồ cột: Doanh thu 6 tháng</h3>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { ref } from "vue";

export default {
  name: "BarChart",
  components: {
    Bar,
  },
  setup() {
    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

    const chartData = ref({
      labels: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ],
      datasets: [
        {
          label: "Doanh thu hàng tháng",
          backgroundColor: "#42A5F5",
          data: [65, 59, 80, 81, 56, 75, 81, 56, 75, 65, 25, 30],
        },
      ],
    });

    const chartOptions = ref({
      responsive: true, // <--- Set to true
      maintainAspectRatio: false, // <--- Keep as false
      plugins: {
        legend: {
          display: true,
          position: "top", // Common position
        },
        tooltip: {
          enabled: true,
        },
        title: {
          display: false, // Hiding Chart.js internal title if using h3 in template
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // Optional: Hide vertical grid lines
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true, // Optional: Show horizontal grid lines
          },
        },
      },
    });

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style scoped>
/* Added 'scoped' attribute - good practice for Vue components */
.chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  /* --- IMPORTANT CHANGES BELOW --- */
  width: 100%; /* Make sure the container takes up all available width */
  height: 400px; /* Define a fixed height for the chart container. Adjust as needed. */
  /* Or use a min-height if content varies */
  /* e.g., min-height: 300px; */

  /* Ensure no conflicting max-width from previous examples if this component is used in the grid */
  max-width: none !important; /* Override any max-width set by a parent grid cell */
  margin: 0 !important; /* Override any margins from a parent grid cell */
  box-sizing: border-box; /* Include padding in the total width/height */
}

h3 {
  text-align: center; /* Center the title */
  color: #333;
  margin-bottom: 15px;
}
</style>
