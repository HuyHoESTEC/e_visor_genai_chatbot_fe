import { onMounted, ref } from "vue";
import { useAuthStore } from "../../stores/auth";
import { getWarehouseManagementApi } from "../../services/auth.service";


export function useLoadWarehouseItem() {
    const authStore = useAuthStore();
    const loggedInUserId = authStore.user?.id;

    // Table data, use ref to reactive
    const tableData = ref([]);
    const isLoading = ref(true); // Data loading status
    const error = ref(null);
    const itemInfo = ref({});

    // Get dashboard data
    const fetchTableData = async () => {
        isLoading.value = true;
        error.value = null;
        
        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
        };
        try {
            const response = await getWarehouseManagementApi(payload);
            if (Array.isArray(response.data)) {
                tableData.value = response.data;
            } else {
                console.warn('API did not return an array for tableData:', response.data);
                tableData.value = [];
            }
        } catch (e) {
            error.value = 'Lỗi khi tải dữ liệu:' + e.message;
            console.error("Lỗi khi tải dữ liệu:", e);
        } finally {
            isLoading.value = false;
        }
    };

    // Get item detail data
    const getItemDetail = async () => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            id: '1'
        };
        try {
            const response = await getGoodsInformationDetailApi(payload);
            if (Array.isArray(response.data)) {
                itemInfo.value = response.data;
            } else {
                console.warn('Item information not existed:', response.message);
                itemInfo.value = {};
            }
        } catch (e) {
            error.value = 'Lỗi khi lấy dữ liệu hàng hóa' + e.message;
            console.error("Lỗi khi lấy dữ liệu hàng hóa", e);
        } finally {
            isLoading.value = false;
        }
    };

    //Edit item detail data
    const editItemDetail = async (item) => {
        isLoading.value = true;
        error.value = null;

        const payload = {
            request_id: "evisor-" + Date.now(),
            owner: loggedInUserId,
            dml_action: "delete",
            form: {
                "id": item.id,
                "device_code": item.device_code,
                "series_number": item.series_number,
                "product_name": item.product_name,
                "date_time": item.date_time,
                "location": item.location,
                "description": item.description,
                "brand": item.brand,
                "origin": item.origin,
                "entered_by": loggedInUserId,
                "type": item.type,
                "quantity": item.quantity,
                "unit": item.unit,
                "status": item.status,
            }
        };
        try {
            const response = await updateGoodsInformationInTheWarehouseApi([payload]);
            if (Array.isArray(response.data)) {
                itemInfo.value = response.data;
            } else {
                console.warn('Item information not existed:', response.message);
                itemInfo.value = {};
            }
        } catch (e) {

        }
    };

    onMounted(() => {
        fetchTableData();
    })

    return {
        tableData,
        isLoading,
        error,
        fetchTableData,
        getItemDetail,
        editItemDetail,
    }
}