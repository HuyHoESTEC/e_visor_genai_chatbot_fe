import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { getWarehouseDashboardApi } from "../../services/auth.service";
import { ElMessage } from "element-plus";


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
        total_import_product: 0,
        total_export_product: 0,
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

    const dualChartVal = ref ({
            day: {datetime_data: [], import_data: [], export_data: []},
            week: {datetime_data: [], import_data: [], export_data: []},
            month: {datetime_data: [], import_data: [], export_data: []},
            quarter: {datetime_data: [], import_data: [], export_data: []},
            year: {datetime_data: [], import_data: [], export_data: []},
    });

    const projectList = ref ({
        export: [],
        import: [],
        installation: [],
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

            const projectListPoint = response.data.list;
            const cardPoint = response.data.point;
            const piedChartPoint = response.data.chart;
            const dualChartPoint = response.data.chart.dual_chart;

            if (response.data.status === 'success') {
                // BIẾN ĐỘNG SỐ LƯỢNG
                inventoryChart.value = {
                    total_import_products: cardPoint.total_import_product,
                    total_export_products: cardPoint.total_export_product,
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
                 // THỐNG KÊ LẮP ĐẶT
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
                
                // Lượng hàng giao dịch
                dualChartVal.value = ({
                    day:{
                        datetime_data: dualChartPoint.day.datetime_data || [],
                        import_data: dualChartPoint.day.import_data || [],
                        export_data: dualChartPoint.day.export_data || [],
                    },
                    week:{
                        datetime_data: dualChartPoint.week.datetime_data || [],
                        import_data: dualChartPoint.week.import_data || [],
                        export_data: dualChartPoint.week.export_data || [],
                    },
                    month:{
                        datetime_data: dualChartPoint.month.datetime_data || [],
                        import_data: dualChartPoint.month.import_data || [],
                        export_data: dualChartPoint.month.export_data || [],
                    },
                    quarter:{
                        datetime_data: dualChartPoint.quarter.datetime_data || [],
                        import_data: dualChartPoint.quarter.import_data || [],
                        export_data: dualChartPoint.quarter.export_data || [],
                    },
                    year:{
                        datetime_data: dualChartPoint.year.datetime_data || [],
                        import_data: dualChartPoint.year.import_data || [],
                        export_data: dualChartPoint.year.export_data || [],
                    },
                })

                projectList.value = {
                        import: projectListPoint.import || [],
                        export: projectListPoint.export || [],
                        installation: projectListPoint.installation || [],
                }
                console.log("dualChartVal.value:", dualChartVal.value);

                importVal.value = cardPoint.total_import_product;
                exportVal.value = cardPoint.total_export_product;
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
        dualChartVal,
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