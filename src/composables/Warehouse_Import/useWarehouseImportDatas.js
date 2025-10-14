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
    const selectedProjectCode = ref(null);
    const selectedBrand = ref(null);
    const selectedImportId = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Dummy item for dialog
    const dummyItems = ref([]);

    const productCodeOptions = ref([]);
    const loadingProductCode = ref(false);

    const projectCodeOptions = ref([]);
    const loadingProjectCode = ref(false);

    const importIdOptions = ref([]);
    const loadingImportId = ref(false);

    const brandOptions = ref([]);
    const loadingBrand = ref(false);

    const { extractDateOnly } = useDateFormat();

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

    const uniqueBrand = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }
        const itemBrand = new Map();
        allItemsImport.value.forEach((item) => {
            const brandVal = item.origin;
            if (brandVal && !itemBrand.has(brandVal)) {
                itemBrand.set(brandVal, {id: brandVal, name: brandVal });
            }
        });
        return Array.from(itemBrand.values());
    });

    const remoteSearchBrand = (query) => {
        if (query) {
            loadingBrand.value = true;
            setTimeout(() => {
                loadingBrand.value = false;
                brandOptions.value = uniqueBrand.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                });
            }, 200);
        } else {
            brandOptions.value = '';
        }
    };

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

    const uniqueProjectCode = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }

        const itemProjectCode = new Map();
        allItemsImport.value.forEach((item) => {
            const projectCode = item.project_code;
            if (projectCode && !itemProjectCode.has(projectCode)) {
                itemProjectCode.set(projectCode, { id: projectCode, name: projectCode })
            }
        });

        return Array.from(itemProjectCode.values());
    });

    const remoteSearchProjectCode = (query) => {
        if (query) { 
            loadingProjectCode.value = true;
            setTimeout(() => {
                loadingProjectCode.value = false;
                projectCodeOptions.value = uniqueProjectCode.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            projectCodeOptions.value = '';
        }
    };

    const uniqueImportId = computed(() => {
        if (!allItemsImport.value || allItemsImport.value.length === 0) {
            return [];
        }

        const itemImportId = new Map();
        allItemsImport.value.forEach((item) => {
            const importId = item.import_id;
            if (importId && !itemImportId.has(importId)) {
                itemImportId.set(importId, { id: importId, name: importId })
            }
        });

        return Array.from(itemImportId.values());
    });

    const remoteSearchImportId = (query) => {
        if (query) {
            loadingImportId.value = true;
            setTimeout(() => {
                loadingImportId.value = false;
                importIdOptions.value = uniqueImportId.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            importIdOptions.value = '';
        }
    };

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
                    const itemDateOnly = extractDateOnly(item.import_time);
                    return itemDateOnly === filterImportDate;
            });
        }

        if (selectedProjectCode.value) {
            const filterProjectCode = selectedProjectCode.value;
            tempItems = tempItems.filter(item => item.project_code === filterProjectCode);
        }

        if (selectedBrand.value) {
            const brandValue = selectedBrand.value;
            tempItems = tempItems.filter(item => item.origin === brandValue);
        }

        if (selectedImportId.value) {
            const importIdVal = selectedImportId.value;
            tempItems = tempItems.filter(item => item.import_id === importIdVal);
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
            productCodeOptions.value = uniqueProductCode.value;
            projectCodeOptions.value = uniqueProjectCode.value;
            importIdOptions.value = uniqueImportId.value;
            brandOptions.value = uniqueBrand.value;
        } else {
            allItemsImport.value = [];
            filteredItems.value = [];
            dummyItems.value = [];
        }
    }, { immediate: true });

    const groupedItems = computed(() => {
        if (!Array.isArray(filteredItems.value)) {
            return [];
        }

        const groups = new Map();
        filteredItems.value.forEach(item => {
            const projectCode = item.project_code || 'Chưa phân loại';
            if (!groups.has(projectCode)) {
                groups.set(projectCode, {
                    project_code: projectCode,
                    items: [],
                    total_quatity: 0
                });
            }

            const group = groups.get(projectCode);
            group.items.push(item);
            group.total_quatity += item.quantity || 0;
        });

        return Array.from(groups.values());
    });

    const totalItemsForPagination = computed(() => {
        return groupedItems.value.length;
    });

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
        selectedProjectCode,
        uniqueProjectCode,
        productCodeOptions,
        loadingProductCode,
        remoteSearchProductCode,
        groupedItems,
        totalItemsForPagination,
        projectCodeOptions,
        loadingProjectCode,
        remoteSearchProjectCode,
        selectedBrand,
        uniqueBrand,
        selectedImportId,
        uniqueImportId,
        importIdOptions,
        loadingImportId,
        remoteSearchImportId,
        brandOptions,
        loadingBrand,
        remoteSearchBrand,
    }
}