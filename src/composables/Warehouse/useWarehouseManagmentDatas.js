import { computed, onMounted, ref, watch } from "vue";
import { useLoadWarehouseItem } from "./useLoadWarehouseItem";

export function useWarehouseManagementDatas() {
    const { tableData: allItemsFromComposable, isLoading, error, fetchTableData } = useLoadWarehouseItem();

    // Define a new ref to save data was fetched
    const allItems = ref([]);

    // This variable will contain filtered data, which needs to be a ref to be able to reassure the value
    const filteredItems = ref([]);

    // State for filter tools
    const selectedProductCode = ref(null);
    const selectedProductSeriNum = ref(null);
    const selectedEnteredDate = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Dummy item for dialog
    const dummyItems = ref([]);

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
            const itemId = item.id || item.part_no;
            if (itemId && !items.has(itemId)) {
                items.set(itemId, { id: itemId, name: item.part_no });
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
            const seriId = item.seri_number;
            if (seriId && !itemSeriNum.has(seriId)) {
                itemSeriNum.set(seriId, { id: seriId, name: item.seri_number });
            }
        });
        return Array.from(itemSeriNum.values());
    });

    // Function use filter and update filteredItems
    const applyFilters = () => {
        let tempItems = [...allItems.value];
        
        if (selectedProductCode.value) {
            tempItems = tempItems.filter(item => (item.id === selectedProductCode.value || item.product_name === selectedProductCode.value));
        }

        if (selectedProductSeriNum.value) {
            tempItems = tempItems.filter(item => item.series_number === selectedProductSeriNum.value);
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
        } else {
            allItems.value = [];
            filteredItems.value = [];
            dummyItems.value = [];
        }
    }, { immediate: true });

    onMounted(() => {
        fetchDataAndInitialize();
    });

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
    }
}