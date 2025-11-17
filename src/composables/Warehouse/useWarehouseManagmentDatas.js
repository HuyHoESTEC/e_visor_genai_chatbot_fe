import { computed, onMounted, ref, watch } from "vue";
import { useLoadWarehouseItem } from "./useLoadWarehouseItem";
import { getWarehouseDashboardApi } from "../../services/auth.service";

export function useWarehouseManagementDatas(itemDataByDate) {
    const { tableData: allItemsFromComposable, isLoading, error, fetchTableData } = useLoadWarehouseItem();

    // Define a new ref to save data was fetched
    const allItems = ref([]);

    // This variable will contain filtered data, which needs to be a ref to be able to reassure the value
    const filteredItems = ref([]);

    const startAndEndDateVal = ref(null);

    // State for filter tools
    const selectedProductCode = ref(null);
    const selectedProductSeriNum = ref(null);
    const selectedEnteredDate = ref(null);
    const selectedBrand = ref(null);
    const selectedFilterDate = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Dummy item for dialog
    const dummyItems = ref([]);

    const productCodeOptions = ref([]);
    const loadingProductCode = ref(false);

    // EmptyData will be computed property to show data status
    const emptyData = computed(() => {
        if (isLoading.value || error.value) {
            return false;
        }

        return filteredItems.value.length === 0;
    })

    // Computed properties for all dropdown
    const uniqueProductCode = computed(() => {
        if (!allItems.value || allItems.value.length === 0) {
            return [];
        }
        const items = new Map();
        allItems.value.forEach((item) => {
            const ProductCode = item.part_no;
            if (ProductCode && !items.has(ProductCode)) {
                items.set(ProductCode, { id: ProductCode, name: ProductCode });
            }
        });
        
        return Array.from(items.values());
    });

    const uniqueProductSeriNum = computed(() => {
        if (!allItems.value || allItems.value.length === 0) {
            return [];
        }
        const itemSeriNum = new Map();
        allItems.value.forEach((item) => {
            const seriCode = item.seri_number;
            if (seriCode && !itemSeriNum.has(seriCode)) {
                itemSeriNum.set(seriCode, { id: seriCode, name: seriCode });
            }
        });
        return Array.from(itemSeriNum.values());
    });

    const uniqueBrand = computed(() => {
        if (!allItems.value || allItems.value.length === 0) {
            return [];
        }
        const itemBrand = new Map();
        allItems.value.forEach((item) => {
            const brandVal = item.origin;
            if (brandVal && !itemBrand.has(brandVal)) {
                itemBrand.set(brandVal, {id: brandVal, name: brandVal });
            }
        });
        return Array.from(itemBrand.values());
    });

    const remoteSearchProductCode = (query) => {
        if (query) {
            loadingProductCode.value = true;
            setTimeout(() => {
                loadingProductCode.value = false;
                productCodeOptions.value = uniqueProductCode.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                });
            }, 200);
        } else {
            productCodeOptions.value = '';
        }
    };

    // Function use filter and update filteredItems
    const applyFilters = () => {
        let tempItems = Array.isArray(allItems.value) ? [...allItems.value] : [];
        
        if (selectedProductCode.value) {
            const productCode = selectedProductCode.value;
            tempItems = tempItems.filter(item => item.part_no === productCode);
        }

        if (selectedProductSeriNum.value) {
            const seriCode = selectedProductSeriNum.value;
            tempItems = tempItems.filter(item => item.seri_number === seriCode);
        }
        
        if (selectedBrand.value) {
            const brandValue = selectedBrand.value;
            tempItems = tempItems.filter(item => item.origin === brandValue);
        }
        
        if (selectedEnteredDate.value) {
            const enteredDate = selectedEnteredDate.value;
            tempItems = tempItems.filter(item => item.time === enteredDate);
        }

        if (selectedFilterDate.value) {
            const dateValue = selectedFilterDate.value;
            tempItems = tempItems.filter(item => item.time === dateValue);
        }

        filteredItems.value = tempItems;
        currentPage.value = 1;
    };

    // PaginatedItems will be calculator based on filteredItems
    const paginatedItems = computed(() => {
        if (!Array.isArray(filteredItems.value)) {
            console.warn('filteredItems.value is not an array, returning empty array for pagination');
            return [];
        }
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        
        return filteredItems.value.slice(start, end);
    });

    // Function to load data and modify values
    const fetchDataAndInitialize = async () => {
        await fetchTableData();
    };

    const filteredDataByDate = async () => {
        const dateValue = selectedFilterDate.value;
        if (!dateValue) {
            ElMessage.warning("Vui lòng chọn ngày!");
            return;
        }
        const payload = {
            "request_id": `evisor-${Date.now()}`,
            "owner": loggedInUserId,
            "filter": {
                "part_no": null,
                "origin": null,
                "seri_number": null,
                "project_code": null,
                "datetime_import": dateValue
            },
            "pagination": 1,
            "page_size": 20
        };

        try {
            const response = await getWarehouseManagementApi(payload);
            if (response && response.data && Array.isArray(response.data)) {
                itemDataByDate.value = response.data;
            } else {
                itemDataByDate.value = [];
            }
        } catch (err) {
            const errorMessage = `Đã có lỗi trong quá trình tìm kiếm dữ liệu: ${err.message}`;
            ElMessage.error(errorMessage)
        }
    };

    watch(allItemsFromComposable, (newValue) => {
        if (newValue) {
            allItems.value = newValue;
            applyFilters();

            const items = new Map();
            allItems.value.forEach(item => {
                const itemId = item.id || item.product_name;
                if (itemId && !items.has(itemId)) {
                    items.set(itemId, { id: itemId, name: item.product_name });
                }
            });
            dummyItems.value = Array.from(items.values());
            productCodeOptions.value = uniqueProductCode.value;
        } else {
            allItems.value = [];
            filteredItems.value = [];
            dummyItems.value = [];
        }
    }, { immediate: true });

    watch(itemDataByDate, (newDateData) => {
        if (newDateData && Array.isArray(newDateData)) {
            allItems.value = newDateData;
            applyFilters();
            currentPage.value = 1;
            productCodeOptions.value = uniqueProductCode.value;
        } else if (newDateData === null) {
            allItems.value = [];
            filteredItems.value = [];
            currentPage.value = 1;
        }
    }, { immediate: false });

    const totalItemsForPagination = computed(() => {
        return groupedItems.value.length;
    });

    onMounted(() => {
        fetchDataAndInitialize();
    });

    const groupedItems = computed(() => {
        if (!Array.isArray(filteredItems.value)) {
            return [];
        }
        const groups = new Map();
        filteredItems.value.forEach(item => {
            const productCode = item.part_no || 'Chưa phân loại';
            if (!groups.has(productCode)) {
                groups.set(productCode, {
                    part_no: productCode,
                    items: [],
                    total_quantity_import: 0,
                    total_quantity_export: 0,
                    total_quantity_stock: 0,             
                });
            }
            const group = groups.get(productCode);
            group.items.push(item);
            group.total_quantity_import += item.quantity_import || 0;
            group.total_quantity_export += item.quantity_export || 0;
            group.total_quantity_stock += item.quantity_stock || 0;
        });
        return Array.from(groups.values());
    });

    const loadDashboardWithFilters = async (filterPayload = null) => {
        if (!filterPayload) {
          startAndEndDateVal.value = null;
    
          await fetchDataAndInitialize();
          return;
        }
    
        isLoading.value = true;
        try {
          const result = await getWarehouseDashboardApi(filterPayload);
          if (result && result.data && Array.isArray(result.data)) {
            allItems.value = result.data;
            applyFilters();
          } else {
            allItems.value = [];
            filteredItems.value = [];
          }
        } catch (err) {
          console.error("Error fetching filtered data:", err);
          allItems.value = [];
          filteredItems.value = [];
        } finally {
          isLoading.value = false;
          currentPage.value = 1;
        }
    };

    return {
        allItems,
        filteredItems,
        selectedProductCode,
        selectedProductSeriNum,
        selectedEnteredDate,
        currentPage,
        pageSize,
        dummyItems,
        emptyData,
        uniqueProductCode,
        uniqueProductSeriNum,
        applyFilters,
        paginatedItems,
        fetchDataAndInitialize,
        productCodeOptions,
        loadingProductCode,
        remoteSearchProductCode,
        selectedBrand,
        uniqueBrand,
        groupedItems,
        totalItemsForPagination,
        startAndEndDateVal,
        loadDashboardWithFilters,
        selectedFilterDate,
        filteredDataByDate,
    }
}