<template>
  <div class="chart-container">
    <h3>Biểu đồ đường: Lượng truy cập Website</h3>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { ref } from "vue";
export default {
  name: "LineChart",
  components: {
    Line,
  },
  setup() {
    ChartJS.register(
      Title,
      Tooltip,
      Legend,
      LineElement,
      CategoryScale,
      LinearScale,
      PointElement
    );

    const chartData = ref({
      labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6", "Tuần 7"],
      datasets: [
        {
          label: "Lượng truy cập Website",
          backgroundColor: "#26C6DA",
          borderColor: "#26C6DA",
          data: [1000, 1200, 900, 1500, 1100, 1300, 1600], // Dữ liệu giả
          fill: false,
        },
      ],
    });

    const chartOptions = ref({
      responsive: false,
      maintainAspectRatio: false,
    });

    return {
      chartData,
      chartOptions,
    };
  },
};
</script>

<style>
.chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
</style>
