import { computed, onMounted, ref, watch } from "vue";
import { useLoadWarehouseImport } from "./useLoadWarehouseImport";
import { useDateFormat } from "../utils/useDateFormat";

export function useWarehouseImportDatas() {
    const { tableData: allItemsFromComposable, isLoading, error, fetchImportDataTable } = useLoadWarehouseImport();
    // Define a new ref to save data was fetched
    const allItemsImport = ref([]);
    const filteredItems = ref([]);

    // State for filter tools
    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);
    const selectedImportDate = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Dummy item for dialog
    const dummyItems = ref([]);

    const { formatDateTimeToDate } = useDateFormat();

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
            const seriCode = item.seri_number;
            if (seriCode && !itemSeriNumber.has(seriCode)) {
                itemSeriNumber.set(seriCode, { id: seriCode, name: seriCode });
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
            const productCode = item.part_no;
            if (productCode && !itemProductCode.has(productCode)) {
                itemProductCode.set(productCode, { id: productCode, name: productCode })
            }
        });

        return Array.from(itemProductCode.values());
    });

    const uniqueImportDate = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }

        const itemImportDate = new Map();
        allItemsImport.value.forEach((item) => {
            const fullDate = item.import_time;
            const importDateOnly = formatDateTimeToDate(fullDate);

            if (importDateOnly !== 'N/A' && !itemImportDate.has(importDateOnly)) {
                itemImportDate.set(importDateOnly, { id: importDateOnly, name: importDateOnly })
            }
        });

        return Array.from(itemImportDate.values());
    });

    // Function use filter and update filteredItems
    const applyFilters = () => {
        // Make sure that aLLItemsImport is array before copy
        let tempItems = Array.isArray(allItemsImport.value) ? [...allItemsImport.value] : [];

        if (selectedProductCode.value) {
            const filterCode = selectedProductCode.value;
            tempItems = tempItems.filter(item => item.part_no === filterCode);
        }

        if (selectedSeriNumber.value) {
            const filterSeri = selectedSeriNumber.value;
            tempItems = tempItems.filter(item => item.seri_number === filterSeri);
        }

        if (selectedImportDate.value) {
            const filterImportDate = selectedImportDate.value;
            tempItems = tempItems.filter(item => {
                    const itemDateOnly = formatDateTimeToDate(item.import_time);
                    return itemDateOnly === filterImportDate;
            });
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
        selectedImportDate,
        uniqueImportDate,
    }
}