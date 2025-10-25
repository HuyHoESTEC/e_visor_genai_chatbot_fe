import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { getWarehouseDashboardApi } from "../../services/auth.service";
import { ElMessage } from "element-plus";

export function useLoadWarehouseChart(langStore, startAndEndDateVal, loadDashboardWithFilters) {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    const isLoading = ref(true);
    const error = ref(null);

    const inventoryChart = ref({
        total_products: 0,
        import_by_date: 0,
        export_by_date: 0,
        not_installation_by_date: 0,
        total_PO: 0,
        total_projects: 0,
    });

    const donutChart = ref({
        import: [],
        export: [],
        installation: [],
    });
    
    const dualCharts = ref({
        pie_chart:{
            import_quantity: 0,
            export_quantity: 0,
        },
        bar_chart: {
            day: {datetime_data: [], import_data: [], export_data: []},
            week: {datetime_data: [], import_data: [], export_data: []},
            month: {datetime_data: [], import_data: [], export_data: []},
            quarter: {datetime_data: [], import_data: [], export_data: []},
            year: {datetime_data: [], import_data: [], export_data: []},
        }
    });
    const fetchDashboardData = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "dashboard-" + Date.now(),
            owner: loggedInUserId,
            filter: {
                datetime_start: null,
                datetime_end: null,
            }
        };
        try {
            const response = await getWarehouseDashboardApi(payload);
            const chartPoint = response.point;
            if (response.status === 'success'&& response.point) {
                inventoryChart.value = {
                    total_products: chartPoint.total_products,
                    import_by_date: chartPoint.import_by_date,
                    export_by_date: chartPoint.export_by_date,
                    not_installation_by_date: chartPoint.not_installation_by_date,
                    total_PO: chartPoint.total_PO,
                    total_projects: chartPoint.total_projects,
                }
                
                
                donutChart.value = response.list;
                dualCharts.value = response.chart;
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
        donutChart,
        dualCharts,
        isLoading,
        error,
        fetchDashboardData,
        filterByDateAction,
    }
}