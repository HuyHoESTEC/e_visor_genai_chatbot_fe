import { computed, onMounted, ref, watch } from "vue";
import { useDateFormat } from "../utils/useDateFormat";
import { useLoadWarehouseExportNew } from "./useLoadWarehouseExportNew";

export function useWarehouseExportDatasNew() {
    const { tableData: allItemsFromComposable, isLoading, error, fetchImportDataTable } = useLoadWarehouseExportNew();
    // Define a new ref to save data was fetched
    const allItemsExport = ref([]);
    const filteredItems = ref([]);

    // State for filter tools
    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);
    const selectedExportDate = ref(null);
    const selectedProjectCode = ref(null);
    const selectedBrand = ref(null);
    const selectedExportId = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);    

    // Dummy item for dialog
    const dummyItems = ref([]);

    const productCodeOptions = ref([]);
    const loadingProductCode = ref(false);

    const projectCodeOptions = ref([]);
    const loadingProjectCode = ref(false);

    const exportIdOptions = ref([]);
    const loadingExportId = ref(false);

    const brandOptions = ref([]);
    const loadingBrand = ref(false);

    const seriOptions = ref([]);
    const loadingSeri= ref(false);

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
        if (!allItemsExport.value || allItemsExport.value.length === 0) {
            return [];
        }
        const itemSeriNumber = new Map();
        allItemsExport.value.forEach((item) => {
            const seriCode = item.seri_number;
            if (seriCode && !itemSeriNumber.has(seriCode)) {
                itemSeriNumber.set(seriCode, { id: seriCode, name: seriCode });
            }
        });

        return Array.from(itemSeriNumber.values());
    });

    const remoteSearchSeriNumber = (query) => {
        if (query) {
            loadingSeri.value = true;
            setTimeout(() => {
                loadingSeri.value = false;
                seriOptions.value = uniqueSeriNumber.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                });
            }, 200);
        } else {
            seriOptions.value = '';
        }
    };

    const uniqueBrand = computed(() => {
        if (!allItemsExport.value || allItemsExport.value.length === 0) {
            return [];
        }
        const itemBrand = new Map();
        allItemsExport.value.forEach((item) => {
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
        if (!allItemsExport.value || allItemsExport.value.length === 0) {
            return [];
        }

        const itemProductCode = new Map();
        allItemsExport.value.forEach((item) => {
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
        if (!allItemsExport.value || allItemsExport.value.length === 0) {
            return [];
        }

        const itemProjectCode = new Map();
        allItemsExport.value.forEach((item) => {
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

    const uniqueExportId = computed(() => {
        if (!allItemsExport.value || allItemsExport.value.length === 0) {
            return [];
        }

        const itemExportId = new Map();
        allItemsExport.value.forEach((item) => {
            const exportId = item.export_id;
            if (exportId && !itemExportId.has(exportId)) {
                itemExportId.set(exportId, { id: exportId, name: exportId })
            }
        });

        return Array.from(itemExportId.values());
    });

    const remoteSearchExportId = (query) => {
        if (query) {
            loadingExportId.value = true;
            setTimeout(() => {
                loadingExportId.value = false;
                exportIdOptions.value = uniqueExportId.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            exportIdOptions.value = '';
        }
    };

    // Function use filter and update filteredItems
    const applyFilters = () => {
        // Make sure that aLLItemsImport is array before copy
        let tempItems = Array.isArray(allItemsExport.value) ? [...allItemsExport.value] : [];

        if (selectedProductCode.value) {
            const filterCode = selectedProductCode.value;
            tempItems = tempItems.filter(item => item.part_no === filterCode);
        }

        if (selectedSeriNumber.value) {
            const filterSeri = selectedSeriNumber.value;
            tempItems = tempItems.filter(item => item.seri_number === filterSeri);
        }

        if (selectedExportDate.value) {
            const filterExportDate = selectedExportDate.value;
            tempItems = tempItems.filter(item => {
                    const itemDateOnly = extractDateOnly(item.export_time);
                    return itemDateOnly === filterExportDate;
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

        if (selectedExportId.value) {
            const exportIdVal = selectedExportId.value;
            tempItems = tempItems.filter(item => item.export_id === exportIdVal);
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
            allItemsExport.value = newValue;
            applyFilters();

            const items = new Map();
            allItemsExport.value.forEach(item => {
                const itemId = item.id || item.part_no;
                if (itemId && !items.has(itemId)) {
                    items.set(itemId, { id: itemId, name: item.part_no });
                }
            });
            dummyItems.value = Array.from(items.values());
            productCodeOptions.value = uniqueProductCode.value;
            projectCodeOptions.value = uniqueProjectCode.value;
            exportIdOptions.value = uniqueExportId.value;
            brandOptions.value = uniqueBrand.value;
            seriOptions.value = uniqueSeriNumber.value;
        } else {
            allItemsExport.value = [];
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
        allItemsExport,
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
        selectedExportDate,
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
        selectedExportId,
        uniqueExportId,
        exportIdOptions,
        loadingExportId,
        remoteSearchExportId,
        brandOptions,
        loadingBrand,
        remoteSearchBrand,
        seriOptions,
        loadingSeri,
        remoteSearchSeriNumber,
    }
}