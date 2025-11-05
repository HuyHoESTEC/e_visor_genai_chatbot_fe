<template>
  <div ref="chartContainer" class="pie-chart-container"></div>
</template>

<script>
import { toLineHeight } from 'chart.js/helpers';
import * as echarts from 'echarts';
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useLanguageStore } from '../../stores/language';

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
      default: 'BIẾN ĐỘNG SỐ LƯỢNG (%)', 
    },
  },

  setup(props) {
    const langStore = useLanguageStore();
    const t = (key) => langStore.t(key);

    const chartContainer = ref(null);
    let myChart = null;

    const COLORS = {
      IMPORT: ['#04A25F', '#58D68D'], 
      EXPORT: ['#E74C3C', '#F1948A'], 
      NO_DATA: '#ccc',
      TEXT_COLOR: '#333333',
      SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)', 
      IMPORT_TEXT: '#00703C',
      EXPORT_TEXT: '#B03A2E',
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

      const subtextImport = `${t('chartImportLabel')}: ${importVal.toLocaleString()}`;
      const subtextExport = `${t('chartExportLabel')}: ${exportVal.toLocaleString()}`;
      const totalSubtext = `${subtextImport} | ${subtextExport}`;

      const rawChartData = [
        { 
          value: importVal, 
          name: t('chartImportLabel'), 
          label: { align: 'left', position: 'outside' },
          itemStyle: { color: createGradient(COLORS.IMPORT), shadowBlur: 8, shadowColor: COLORS.SHADOW_COLOR, shadowOffsetX: 0, shadowOffsetY: 5 }
        },
        { 
          value: exportVal, 
          name: t('chartExportLabel'),
          label: { align: 'left', position: 'outside' },
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
              title: { 
                fontSize: 18, 
                top: '2%',
                subtext: totalSubtext.replace('\n', ' | '),
                subtextStyle: { fontSize: 16, top: '2%', left: 'center', fontWeight:'bold' }
              },
              legend: {
                data: ['Xuất Kho', 'Nhập Kho'], 
                left: 'center', top: 'bottom', orient: 'horizontal', itemGap: 10, 
                fontSize: 18,
              },
              series: [{
                radius: ['30%', '50%'], center: ['50%', '45%'], 
                label: { 
                  fontSize: 16,
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
                  fontSize: 16,
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
          subtext: totalSubtext,
          subtextStyle: {
            import:{
              color: COLORS.IMPORT_TEXT,
              fontWeight: 'bold',
              fontSize: 18,
            },
            export:{
              color: COLORS.EXPORT_TEXT,
              fontWeight: 'bold',
              fontSize: 18,
            }
          },
          textStyle: {
            color: COLORS.TEXT_COLOR, 
            fontSize: 24, 
            LineHeight: 30,
            fontWeight: 'bold', 
            textShadowBlur: 0, 
            textShadowColor: 'rgba(0, 0, 0, 0.0)', 
            fontFamily: 'sans-serif',
            align:'left' 
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
            fontWeight: 'normal',
            fontFamily: 'sans-serif',
            fontSize: 14 
          }
        },

        series: [
          {
            name: 'Số Lượng',
            type: 'pie',
            radius: ['50%', '75%'], 
            center: ['50%', '45%'], 
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
              formatter: hasData ? '{b}\n{c} ({d}%)' : '{a}',
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
              length: 20,
              length2: 20,
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
      langStore,
    };
  },
});
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 500px;
  max-height: 80vh; 
  min-height: 400px;
}
@media(max-width: 768px){
  .pie-chart-container{
    height: 350px;
  }
}
</style>