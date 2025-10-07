import { computed, onMounted, ref, watch } from "vue";
import { useLoadWarehouseImport } from "./useLoadWarehouseImport";

export function useWarehouseImportDatas() {
    const { tableData: allItemsFromComposable, isLoading, error, fetchImportDataTable } = useLoadWarehouseImport();
    // Define a new ref to save data was fetched
    const allItemsImport = ref([]);
    const filteredItems = ref([]);

    // State for filter tools
    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);

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

    // Computed properties for project code dropdown
    const uniqueSeriNumber = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }
        const itemSeriNumber = new Map();
        allItemsImport.value.forEach((item) => {
            const seriId = item.id;
            if (seriId && !itemSeriNumber.has(seriId)) {
                itemSeriNumber.set(seriId, { id: seriId, name: item.seri_number });
            }
        });

        return Array.from(itemSeriNumber.values());
    });

    const uniqueProductCode = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }

        const itemProductCode = new Map();
        allItemsImport.value.forEach((item) => {
            const productId = item.id;
            if (productId && !itemProductCode.has(productId)) {
                itemProductCode.set(productId, { id: productId, name: item.part_no })
            }
        });

        return Array.from(itemProductCode.values());
    });

    // Function use filter and update filteredItems
    const applyFilters = () => {
        let tempItems = [...allItemsImport.value];

        if (selectedProductCode.value) {
            tempItems = tempItems.filter(item => (item.id === selectedProductCode.value || item.part_no === selectedProductCode.value));
        }

        if (selectedSeriNumber.value) {
            tempItems = tempItems.filter(item => item.id === selectedSeriNumber.value || item.seri_number === selectedSeriNumber.value);
        }

        filteredItems.value = tempItems;
        currentPage.value = 1;
    };

    // PaginatedItems will be calculator based on filterdItems
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
        await fetchImportDataTable();
    };

    watch(allItemsFromComposable, (newValue) => {
        if (newValue) {
            allItemsImport.value = newValue;
            applyFilters();

            const items = new Map();
            allItemsImport.value.forEach(item => {
                const itemId = item.id || item.part_no;
                if (itemId && !items.has(itemId)) {
                    items.set(itemId, { id: itemId, name: item.part_no });
                }
            });
            dummyItems.value = Array.from(items.values());
        } else {
            allItemsImport.value = [];
            filteredItems.value = [];
            dummyItems.value = [];
        }
    }, { immediate: true });

    onMounted(() => {
        fetchDataAndInitialize();
    });

    return {
        allItemsImport,
        filteredItems,
        selectedProductCode,
        selectedSeriNumber,
        currentPage,
        pageSize,
        dummyItems,
        emptyData,
        uniqueProductCode,
        uniqueSeriNumber,
        applyFilters,
        paginatedItems,
        fetchDataAndInitialize,
    }
}