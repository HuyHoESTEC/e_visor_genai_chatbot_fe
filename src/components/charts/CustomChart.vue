<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Tiến độ sản xuất thành phẩm</h3>
      <button class="menu-button">&#9776;</button>
    </div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from "vue-chartjs"; // We'll use Bar as the base chart type
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement, // For the bars
  LineElement, // For the line
  PointElement, // For points on the line
  CategoryScale, // For the X-axis (dates)
  LinearScale, // For both Y-axes
} from "chart.js";
import { ref } from "vue";

export default {
  name: "ProductionProgressChart", // More descriptive name
  components: {
    Bar, // Registering Bar component
  },
  setup() {
    ChartJS.register(
      Title,
      Tooltip,
      Legend,
      BarElement,
      LineElement,
      PointElement,
      CategoryScale,
      LinearScale
    );

    const chartData = ref({
      labels: ["2024-02-01", "2024-02-02", "2024-02-03"], // Dates from the image
      datasets: [
        {
          type: "bar", // Explicitly set type to bar
          label: "Sản phẩm đã sản xuất",
          backgroundColor: "#42A5F5", // Blue color from image
          data: [500, 400, 600], // Example data from image
          yAxisID: "y", // Assign to the first Y-axis
        },
        {
          type: "bar", // Explicitly set type to bar
          label: "Thành phẩm chưa sản xuất",
          backgroundColor: "#5CB85C", // Green color from image
          data: [200, 180, 220], // Example data from image
          yAxisID: "y", // Assign to the first Y-axis
        },
        {
          type: "line", // Explicitly set type to line
          label: "Kế hoạch",
          borderColor: "#A9A9A9", // Grey color from image
          borderWidth: 2,
          fill: false,
          data: [600, 630, 650], // Example data from image
          yAxisID: "y1", // Assign to the second Y-axis
          tension: 0.3, // Makes the line slightly curved
          pointRadius: 0, // No points on the line as per image
        },
      ],
    });

    const chartOptions = ref({
      responsive: false,
      maintainAspectRatio: false,
      interaction: {
        mode: "index", // Enable interaction for all datasets based on index
        intersect: false, // Tooltip shows for nearest element, not just direct intersect
      },
      plugins: {
        title: {
          display: false, // Title handled by h3 in template
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          callbacks: {
            title: function (tooltipItems) {
              return `Ngày: ${tooltipItems[0].label}`; // Custom title for tooltip
            },
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            },
          },
          // Custom tooltip background and border for exact match to image
          backgroundColor: "rgba(255,255,255,0.9)",
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          titleColor: "#333",
          bodyColor: "#555",
          footerColor: "#555",
          caretSize: 0, // No caret
          cornerRadius: 4,
          padding: 10,
          displayColors: true, // Show color box next to label
        },
        legend: {
          display: true,
          position: "bottom", // Position legend at the bottom
          labels: {
            boxWidth: 12, // Smaller color boxes
            padding: 20,
          },
        },
      },
      scales: {
        x: {
          stacked: true, // Stack the bar charts
          grid: {
            display: false, // Hide vertical grid lines
          },
          ticks: {
            color: "#666",
          },
        },
        y: {
          type: "linear",
          position: "left",
          stacked: true, // Stack the bar charts on this axis
          title: {
            display: false, // Hide y-axis title
          },
          grid: {
            drawOnChartArea: true, // Show horizontal grid lines
            color: "rgba(0,0,0,0.05)",
          },
          ticks: {
            beginAtZero: true,
            max: 600, // Max value for the left y-axis
            stepSize: 100, // Step size for the left y-axis
            color: "#666",
          },
        },
        y1: {
          // Second Y-axis for the line data
          type: "linear",
          position: "right",
          grid: {
            drawOnChartArea: false, // Hide grid lines for this axis
          },
          title: {
            display: false, // Hide y-axis title
          },
          ticks: {
            beginAtZero: false, // Or adjust as needed based on your data range for 'Kế hoạch'
            min: 600, // Min value for the right y-axis
            max: 650, // Max value for the right y-axis
            stepSize: 10, // Step size for the right y-axis
            color: "#666",
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
.chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  /* Adjust size for better visualization of combined chart */
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  position: relative; /* For header positioning */
  max-height: fit-content;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

h3 {
  text-align: left; /* Align title left as in image */
  color: #333;
  margin: 0; /* Remove default margin */
  font-size: 1.5em; /* Adjust font size if needed */
}

.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
}
</style>
