<template>
  <div class="summary-dashboard-container">
    <h2>Tổng quan Hiệu suất</h2>

    <div class="charts-grid">
      <BarChart />
      <PieChart />
      <LineChart />
      <CustomChart />
      <BarChart />
      <PieChart />
      <LineChart />
      <CustomChart />
    </div>
  </div>
</template>

<script>
import BarChart from "../../components/charts/BarChart.vue";
import PieChart from "../../components/charts/PieChart.vue";
import LineChart from "../../components/charts/LineChart.vue";
import CustomChart from "../../components/charts/CustomChart.vue";

export default {
  name: "SummaryDashboardPage",
  components: { BarChart, PieChart, LineChart, CustomChart },
};
</script>

<style scoped>
/* Add 'scoped' to prevent styles from affecting other components globally */
.summary-dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(
    100vh - var(--header-height, 60px) - var(--footer-height, 50px)
  ); /* Điều chỉnh theo chiều cao header/footer thực tế */
  box-sizing: border-box; /* Bao gồm padding và border vào tổng chiều cao */
  display: flex;
  flex-direction: column;
  /* height: calc(100vh - 60px); Removed this fixed height for better scrolling if content overflows */
  width: 100%;
}

h2 {
  color: #333;
  margin-bottom: 15px;
}

p {
  color: #666;
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  /*
    This is the key change:
    - grid-template-columns: repeat(2, 1fr); creates exactly 2 columns of equal width.
    - 1fr means "1 fraction of the available space", so each column takes half.
    - This ensures 2 charts per row and takes up "nearly full width".
  */
  grid-template-columns: repeat(2, 1fr);
  gap: 20px; /* Space between charts */
  width: 100%; /* Ensure the grid takes full available width */
  max-width: 1200px; /* Optional: set a max-width for the grid container itself if you don't want it to stretch infinitely wide on very large screens */
  margin: 0 auto; /* Center the grid if max-width is applied */
}

/* You might want to adjust the chart-container styles within each chart component
   to ensure they fill their grid cell properly.
   For example, if your BarChart/PieChart/LineChart/CustomChart components have a fixed width,
   they might not fill the 1fr available space. Ensure they are responsive.
   A common approach is to make sure their immediate container has:
   width: 100%;
   height: 100%; (if they should fill vertical space)
*/

/* Example adjustment for individual chart containers (if they are causing issues): */
/*
.chart-container {
    width: 100%;
    height: 400px; // Or whatever fixed height or aspect ratio you prefer for charts
    box-sizing: border-box;
    // Remove individual chart container max-width if they conflict with grid
    // max-width: none !important;
    // margin: 0 !important;
}
*/
</style>
