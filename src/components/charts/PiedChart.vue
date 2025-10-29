<template>
  <div ref="chartContainer" class="pie-chart-container"></div>
</template>

<script>
import * as echarts from 'echarts';
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'PiedChart',
  props: {
    piedChart: {
      type: Object,
      required: true,
      default: () => ({
        import_quantity: [],
        export_quantity: [],
      }),
    },
    titleText: {
      type: String,
      default: 'BIẾN ĐỘNG SỐ LƯỢNG', 
    },
  },

  setup(props) {
    const chartContainer = ref(null);
    let myChart = null;

    const COLORS = {
      // Xanh cho Nhập Kho (IMPORT)
      IMPORT: ['#04A25F', '#58D68D'], 
      // Đỏ cho Xuất Kho (EXPORT)
      EXPORT: ['#E74C3C', '#F1948A'], 
      NO_DATA: '#ccc',
      TEXT_COLOR: '#333333',
      SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)', 
    };

    const createGradient = (colors) => {
      return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: colors[0] }, 
        { offset: 1, color: colors[1] }
      ]);
    };

    const getChartOptions = (data) => {

      const importVal = Number(data?.import_quantity) || 0;
      const exportVal = Number(data?.export_quantity) || 0;

      const rawChartData = [
        { 
          value: importVal, 
          name: 'Nhập Kho', 
          itemStyle: { color: createGradient(COLORS.IMPORT), shadowBlur: 8, shadowColor: COLORS.SHADOW_COLOR, shadowOffsetX: 0, shadowOffsetY: 5 }
        },
        { 
          value: exportVal, 
          name: 'Xuất Kho',
          itemStyle: { color: createGradient(COLORS.EXPORT), shadowBlur: 8, shadowColor: COLORS.SHADOW_COLOR, shadowOffsetX: 0, shadowOffsetY: 5 }
        },
      ];

      const chartData = rawChartData.filter(item => item.value > 0);
      const hasData = chartData.length > 0;

      const finalChartData = hasData ? chartData : [
          {
              value: 1, 
              name: 'Không có dữ liệu',
              itemStyle: { color: COLORS.NO_DATA },
              tooltip: { show: false }, 
              label: { 
                  show: true, formatter: 'KHÔNG CÓ DỮ LIỆU', color: COLORS.TEXT_COLOR,
                  fontSize: 18, 
                  // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản (light)
                  fontWeight: 'light' 
              }
          }
      ];
      
      const legendDataNames = hasData 
        ? ['Xuất Kho', 'Nhập Kho'] 
        : [];

      return {
        media: [
          {
            query: { maxWidth: 768 },
            option: {
              title: { fontSize: 18, top: '2%' },
              legend: {
                data: ['Xuất Kho', 'Nhập Kho'], 
                left: 'center', top: 'bottom', orient: 'horizontal', itemGap: 10, 
                // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
                fontSize: 12,
              },
              series: [{
                radius: ['40%', '65%'], center: ['50%', '45%'], 
                label: { 
                    // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
                    fontSize: 12,
                },
                labelLine: { length: 8, length2: 8 }
              }]
            }
          },
          {
            query: { maxWidth: 480 },
            option: {
              title: { fontSize: 16 },
              legend: { fontSize: 10, itemWidth: 10, itemHeight: 10 },
              series: [{
                radius: ['35%', '60%'], center: ['50%', '45%'],
                label: { 
                    // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
                    fontSize: 10,
                },
                labelLine: { length: 5, length2: 5 }
              }]
            }
          }
        ],

        title: {
          text: props.titleText.toUpperCase(), 
          left: 'center',
          top: '5%', 
          textStyle: {
            color: COLORS.TEXT_COLOR, 
            fontSize: 24, 
            // Giữ lại 'bold' cho tiêu đề theo yêu cầu trước
            fontWeight: 'bold', 
            textShadowBlur: 0, 
            textShadowColor: 'rgba(0, 0, 0, 0.0)', 
            // ✨ ĐÃ CẬP NHẬT: Thêm fontFamily để sử dụng font chữ sans-serif đơn giản
            fontFamily: 'sans-serif' 
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: hasData ? '{a} <br/>{b}: {c} ({d}%)' : 'Không có dữ liệu',
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderColor: COLORS.TEXT_COLOR,
          borderWidth: 1,
          textStyle: {
            color: COLORS.TEXT_COLOR,
            // ✨ ĐÃ CẬP NHẬT: Đảm bảo font chữ đơn giản
            fontWeight: 'normal',
            fontFamily: 'sans-serif',
            fontSize: 14 
          }
        },

        legend: hasData ? {
          data: legendDataNames, 
          left: 'center', 
          top: 'bottom', 
          padding: [10, 0, 10, 0], 
          itemGap: 20, 
          textStyle: {
            color: COLORS.TEXT_COLOR, 
            fontSize: 16, 
            // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
            fontWeight: 'normal', 
            fontFamily: 'sans-serif',
          },
          icon: 'circle', 
        } : { show: false }, 

        series: [
          {
            name: 'Số Lượng',
            type: 'pie',
            radius: ['50%', '75%'], 
            center: ['50%', '50%'], 
            avoidLabelOverlap: false,
            data: finalChartData,
            
            animation: hasData,
            animationType: 'scale',
            animationEasing: 'cubicOut', 
            animationDuration: 1000,
            
            itemStyle: {
              borderColor: '#ffffff', 
              borderWidth: 2, 
              borderRadius: 8,
            },

            label: {
              show: hasData, 
              position: 'outside',
              formatter: hasData ? '{b}\n{d}%' : '{a}', 
              // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
              fontWeight: 'normal',
              fontFamily: 'sans-serif',
              fontSize: 16, 
              color: COLORS.TEXT_COLOR, 
              textShadowBlur: 0, 
              alignTo: 'labelLine',
              bleed: 4, 
            },
            
            labelLine: {
              show: hasData,
              length: 15,
              length2: 15,
              lineStyle: {
                color: COLORS.TEXT_COLOR,
                width: 1
              }
            },

            emphasis: {
              itemStyle: {
                shadowBlur: 12, 
                shadowOffsetX: 0,
                shadowColor: COLORS.SHADOW_COLOR, 
                borderColor: '#FFD700', 
                borderWidth: 4,
              },
              label: {
                show: true,
                fontSize: 18,
                // ✨ ĐÃ CẬP NHẬT: Font chữ đơn giản
                fontWeight: 'bold', 
                fontFamily: 'sans-serif',
              }
            }
          }
        ]
      };
    };

    const initChart = () => {
      if (chartContainer.value) {
        myChart = echarts.init(chartContainer.value, null, { renderer: 'svg' }); 
        myChart.setOption(getChartOptions(props.piedChart));
        window.addEventListener('resize', resizeChart);
      }
    };
    
    const updateChart = (newData) => {
      if (myChart) {
        myChart.setOption(getChartOptions(newData), true); 
      }
    };

    const resizeChart = () => {
      if (myChart) {
        myChart.resize();
      }
    };

    watch(() => props.piedChart, (newVal) => {
      if (newVal) {
        updateChart(newVal);
      }
    }, { deep: true }); 

    onMounted(() => {
      initChart();
    });

    onBeforeUnmount(() => {
      if (myChart) {
        window.removeEventListener('resize', resizeChart);
        myChart.dispose();
      }
    });

    return {
      chartContainer,
    };
  },
});
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  max-height: 80vh; 
  min-height: 350px;
}
@media(max-width: 768px){
  .pie-chart-container{
    height: 300px;
  }
}
</style>