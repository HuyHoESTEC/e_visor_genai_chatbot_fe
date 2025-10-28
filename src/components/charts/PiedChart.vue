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
      default: 'Tỷ Lệ Nhập/Xuất Kho',
    },
  },

  setup(props) {
    const chartContainer = ref(null);
    let myChart = null;

    const COLORS = {
      IMPORT: ['#1785FF', '#62B6FF'],
      EXPORT: ['#00B894', '#55efc4'], 
      NO_DATA: '#ccc',
      TEXT_COLOR: '#333333', 
      SHADOW_COLOR: 'rgba(0, 0, 0, 0.5)',
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
          itemStyle: { 
            color: createGradient(COLORS.IMPORT),
            shadowBlur: 15, 
            shadowColor: COLORS.SHADOW_COLOR,
            shadowOffsetX: 0,
            shadowOffsetY: 5,
          }
        },
        { 
          value: exportVal, 
          name: 'Xuất Kho',
          itemStyle: { 
            color: createGradient(COLORS.EXPORT),
            shadowBlur: 15,
            shadowColor: COLORS.SHADOW_COLOR,
            shadowOffsetX: 0,
            shadowOffsetY: 5,
          }
        },
      ];

      const chartData = rawChartData.filter(item => item.value > 0);
      const hasData = chartData.length > 0;

      // Xử lý trường hợp không có dữ liệu
      const finalChartData = hasData ? chartData : [
          {
              value: 1, 
              name: 'Không có dữ liệu',
              itemStyle: { color: COLORS.NO_DATA },
              tooltip: { show: false }, 
              label: { 
                  show: true, 
                  formatter: 'KHÔNG CÓ DỮ LIỆU',
                  color: COLORS.TEXT_COLOR,
                  fontSize: 18, 
                  fontWeight: 'bold' 
              }
          }
      ];

      return {
        // **Bỏ backgroundColor để sử dụng nền trắng mặc định**
        
        title: {
          text: props.titleText.toUpperCase(), 
          left: 'center',
          top: '3%',
          textStyle: {
            color: COLORS.TEXT_COLOR, // Màu tối cho nền trắng
            fontSize: 24, 
            fontWeight: '900',
            // Bỏ hiệu ứng glow, thay bằng text shadow nhẹ màu tối
            textShadowBlur: 2,
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: hasData ? '{a} <br/>{b}: {c} ({d}%)' : 'Không có dữ liệu',
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Nền tooltip sáng
          borderColor: COLORS.TEXT_COLOR,
          borderWidth: 1,
          textStyle: {
            color: COLORS.TEXT_COLOR,
            fontSize: 14 
          }
        },

        // Chú thích (Legend)
        legend: hasData ? {
          orient: 'vertical',
          left: '5%',
          top: 'center',
          textStyle: {
            color: COLORS.TEXT_COLOR, // Màu tối cho nền trắng
            fontSize: 16, 
            fontWeight: 'bold'
          },
          icon: 'circle', 
        } : { show: false }, 

        series: [
          {
            name: 'Số Lượng',
            type: 'pie',
            radius: ['50%', '75%'], 
            center: ['55%', '50%'], 
            avoidLabelOverlap: false,
            data: finalChartData,
            
            animation: hasData,
            animationType: 'scale',
            animationEasing: 'cubicOut', 
            animationDuration: 1000,
            
            // Viền màu nhạt hơn (hoặc bỏ viền) để phù hợp nền trắng
            itemStyle: {
              borderColor: '#f0f0f0', // Viền xám nhạt
              borderWidth: 1, 
              borderRadius: 8,
            },

            // Nhãn dữ liệu
            label: {
              show: hasData, 
              position: 'outside',
              formatter: hasData ? '{b}\n{d}%' : '{a}', 
              fontWeight: 'bold',
              fontSize: 16, // Giữ kích thước lớn
              color: COLORS.TEXT_COLOR, // Màu tối
              textShadowBlur: 0, // Bỏ text shadow
            },
            
            // Đường kết nối nhãn
            labelLine: {
              show: hasData,
              length: 15,
              length2: 15,
              lineStyle: {
                color: COLORS.TEXT_COLOR,
                width: 1
              }
            },
            
            // Hiệu ứng khi di chuột vào (emphasis)
            emphasis: {
              itemStyle: {
                shadowBlur: 20, 
                shadowOffsetX: 0,
                shadowColor: COLORS.SHADOW_COLOR, // Shadow tối
                borderColor: '#FFC300', // Viền nổi bật
                borderWidth: 4,
              },
              label: {
                show: true,
                fontSize: 18,
                fontWeight: '900',
              }
            }
          }
        ]
      };
    };

    const initChart = () => {
      if (chartContainer.value) {
        // Sử dụng 'canvas' cho hiệu ứng đổ bóng mượt mà
        myChart = echarts.init(chartContainer.value, null, { renderer: 'canvas' }); 
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
  height: 450px; 
  min-height: 350px;
  /* Đảm bảo không có nền khác áp đặt lên đây nếu bạn không muốn */
}
</style>