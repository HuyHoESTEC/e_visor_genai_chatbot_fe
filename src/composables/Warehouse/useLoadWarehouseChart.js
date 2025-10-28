import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { getWarehouseDashboardApi } from "../../services/auth.service";
import { ElMessage } from "element-plus";
import BarChart from "../../components/charts/BarChart.vue";


export function useLoadWarehouseChart(langStore, startAndEndDateVal, loadDashboardWithFilters) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const isLoading = ref(true);
    const error = ref(null);

    const importVal = ref(null);
    const exportVal = ref(null);
    const totalPO = ref(null);
    const totalProject = ref(null);


    const inventoryChart = ref({
        total_products: 0,
        import_by_date: 0,
        export_by_date: 0,
        not_installation_by_date: 0,
        installation_by_date:0,
        total_PO: 0,
        total_projects: 0,
    });

    const piedChart = ref({
        import_quantity: [],
        export_quantity: [],
    });

    const donutData = ref({
        not_installation_by_date: [],
        installation_by_date: [],
    })

    const barChart = ref ({
            day: {datetime_data: [], import_data: [], export_data: []},
            week: {datetime_data: [], import_data: [], export_data: []},
            month: {datetime_data: [], import_data: [], export_data: []},
            quarter: {datetime_data: [], import_data: [], export_data: []},
            year: {datetime_data: [], import_data: [], export_data: []},
    });

    const currentTimestamp = new Date();

    const fetchDashboardData = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            filter: {
                datetime_start: currentTimestamp.toISOString(),
                datetime_end: currentTimestamp.toISOString(),
            }
        };
        try {
            const response = await getWarehouseDashboardApi(payload);

            // const chartPoint = response.data.list;
            const cardPoint = response.data.point;
            const piedChartPoint = response.data.chart;
            const barChartPoint = response.data.chart.bar_chart;

            if (response.data.status === 'success') {
                inventoryChart.value = {
                    total_products: cardPoint.total_products,
                    import_by_date: cardPoint.import_by_date,
                    export_by_date: cardPoint.export_by_date,
                    not_installation_by_date: cardPoint.not_installation_by_date,
                    installation_by_date: cardPoint.installation_by_date,
                    total_PO: cardPoint.total_PO,
                    total_projects: cardPoint.total_projects,
                }     
                
                piedChart.value = {   
                    import_quantity: piedChartPoint.pie_chart.import_quantity || 0, 
                    export_quantity: piedChartPoint.pie_chart.export_quantity || 0, 
                }

                donutData.value = ({
                    installation_by_date: [
                        { 
                            value: cardPoint.installation_by_date || 0, 
                            name: langStore.t('Installed') || 'Đã lắp đặt' 
                        }
                    ],
                    not_installation_by_date: [
                        { 
                            value: cardPoint.not_installation_by_date || 0, 
                            name: langStore.t('NotInstalled') || 'Chưa lắp đặt' 
                        }
                    ]
                });    
                
                barChart.value = [{
                    day:{
                        datetime_data: barChartPoint.day.datetime_data || [],
                        import_data: barChartPoint.day.import_data || [],
                        export_data: barChartPoint.day.export_data || [],
                    },
                    week:{
                        datetime_data: barChartPoint.week.datetime_data || [],
                        import_data: barChartPoint.week.import_data || [],
                        export_data: barChartPoint.week.export_data || [],
                    },
                    month:{
                        datetime_data: barChartPoint.month.datetime_data || [],
                        import_data: barChartPoint.month.import_data || [],
                        export_data: barChartPoint.month.export_data || [],
                    },
                    quarter:{
                        datetime_data: barChartPoint.quarter.datetime_data || [],
                        import_data: barChartPoint.quarter.import_data || [],
                        export_data: barChartPoint.quarter.export_data || [],
                    },
                    year:{
                        datetime_data: barChartPoint.year.datetime_data || [],
                        import_data: barChartPoint.year.import_data || [],
                        export_data: barChartPoint.year.export_data || [],
                    },
                }]  

                importVal.value = cardPoint.import_by_date;
                exportVal.value = cardPoint.export_by_date;
                totalPO.value = cardPoint.total_PO;
                totalProject.value = cardPoint.total_project;
               
            } else {
                console.warn('API did not return an array for tableData:', response);
            }
        } catch (e) {
            error.value = 'Lỗi khi tải dữ liệu:' + e.message;
            console.error("Lỗi khi tải dữ liệu:", e);
        } finally {
            isLoading.value = false;
        }
    }

    const filterByDateAction = async () => {
        if (startAndEndDateVal.value && startAndEndDateVal.value.length === 2) {
            const [startDate, endDate] = startAndEndDateVal.value;
            const filterPayload = {
                'request_id': `evisor-1234567890${Date.now()}`,
                'owner': loggedInUserId,
                filter: {
                    'datetime_start': startDate,
                    'datetime_end': endDate,
                },
                pagination: 1,
                page_size: 999 
            };
            loadDashboardWithFilters(filterPayload);
            ElMessage.success(langStore.t('FilterApplied'));
        } else if (startAndEndDateVal.value === null || startAndEndDateVal.value === '') {
            loadDashboardWithFilters(null);
            ElMessage.info(langStore.t('DateFilterRemoved'));
        } else {
            ElMessage.warning(langStore.t('PleaseSelectAValidDateRange.'));
        }
    }

    onMounted(() => {
        fetchDashboardData();
    })
    
    return{
        inventoryChart,
        donutData,
        piedChart,
        barChart,
        isLoading,
        error,
        fetchDashboardData,
        filterByDateAction,
        exportVal,
        importVal,
        totalPO,
        totalProject,
    }
}