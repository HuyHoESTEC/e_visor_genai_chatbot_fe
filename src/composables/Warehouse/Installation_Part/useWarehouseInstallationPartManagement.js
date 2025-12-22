import { computed, onMounted, ref, watch } from "vue";
import { useLoadWarehouseInstallationPart } from "./useLoadWarehouseInstallationPart";

export function useWarehouseInstallationPartManagement() {
    const {
        tableData: allItemsFromComposable,
        isLoading,
        errorVal,
        fetchTableDataInstallation
    } = useLoadWarehouseInstallationPart();

    // Define a new ref to save data was fetched
    const allInstallationItems = ref([]);
    const filterdInstallationItems = ref([]);

    // State for filter tools
    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);
    const selectedImportDate = ref(null);
    const selectedProjectCode = ref(null);
    const selectedLocationCode = ref(null);
    const selectedExportId = ref(null);
    const selectedMd = ref(null);
    const selectedStatus = ref(null);

    // State for pagination
    const currentPage = ref(1);
    const pageSize = ref(10);

    // Dummy item for dialog
    const dummyItems = ref([]);
    
    const productCodeOptions = ref([]);
    const loadingProductCode = ref(false);

    const projectCodeOptions = ref([]);
    const loadingProjectCode = ref(false);

    const locationOptions = ref([]);
    const loadingLocation = ref(false);

    const brandOptions = ref([]);
    const loadingBrand = ref(false);

    const mdOptions = ref([]);
    const loadingMD = ref(false);

    // Empty data will be to show data status
    const emptyInstallationVal = computed(() => {
        if (isLoading.value || errorVal.value) {
            return false;
        }

        return filterdInstallationItems.value.length === 0;
    });

    // Define unique value for filter tools
    const uniqueSeriNumber = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }
        
        const itemSeriNum = new Map();
        allInstallationItems.value.forEach((item) => {
            const seriCode = item.seri_number;
            if (seriCode && !itemSeriNum.has(seriCode)) {
                itemSeriNum.set(seriCode, { id: seriCode, name: seriCode });
            }
        });

        return Array.from(itemSeriNum.values());
    });

    const uniqueBrand = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const brandItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const brandVal = item.origin;
            if (brandVal && !brandItem.has(brandVal)) {
                brandItem.set(brandVal, { id: brandVal, name: brandVal });
            }
        });
        return [...brandItem.values()];
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
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const productCodeItem = new Map();
        allInstallationItems.value.forEach((item) =>{
            const productCodeVal = item.part_no;
            if (productCodeVal && !productCodeItem.has(productCodeVal)) {
                productCodeItem.set(productCodeVal, { id: productCodeVal, name: productCodeVal });
            }
        });

        return Array.from(productCodeItem.values());
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
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const projectCodeItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const projectCodeVal = item.project_code;
            if (projectCodeVal && !projectCodeItem.has(projectCodeVal)) {
                projectCodeItem.set(projectCodeVal, { id: projectCodeVal, name: projectCodeVal });
            }
        });

        return Array.from(projectCodeItem.values());
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

    const uniqueLocation = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const locationItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const locationVal = item.location;
            if (locationVal && !locationItem.has(locationVal)) {
                locationItem.set(locationVal, { id: locationVal, name: locationVal });
            }
        });

        return Array.from(locationItem.values());
    });

    const remoteSearchLocation = (query) => {
        if (query) {
            loadingLocation.value = true;
            setTimeout(() => {
                loadingLocation.value = false;
                locationOptions.value = uniqueLocation.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            locationOptions.value = '';
        }
    };

    const uniqueMD = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const mdItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const mdVal = item.cabinet_no;
            if (mdVal && !mdItem.has(mdVal)) {
                mdItem.set(mdVal, { id: mdVal, name: mdVal })
            }
        });

        return Array.from(mdItem.values());
    });

    const remoteSearchMD = (query) => {
        if (query) {
            loadingMD.value = true;
            setTimeout(() => {
                loadingMD.value = false;
                mdOptions.value = uniqueMD.value.filter((item) =>{
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            mdOptions.value = '';
        }
    };

    const uniqueStatus = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }
        
        const statusItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const statusVal = item.status;
            if (statusVal !== null && statusVal !== undefined && !statusItem.has(statusVal)) {
                statusItem.set(statusVal, { id: statusVal, name: statusVal });
            }
        });
        console.log('status list:', Array.from(statusItem.values()));

        return Array.from(statusItem.values());
    });

    const applyFilters = () => {
        let tempItems = Array.isArray(allInstallationItems.value) ? [...allInstallationItems.value] : [];
        console.log('tempItems:' , tempItems);

        if (selectedProductCode.value) {
            tempItems = tempItems.filter(item => item.part_no === selectedProductCode.value);
        }

        if (selectedSeriNumber.value) {
            tempItems = tempItems.filter(item => item.seri_number === selectedSeriNumber.value);
        }

        if (selectedStatus.value !== null && selectedStatus.value !== undefined && selectedStatus.value !== "") {
            tempItems = tempItems.filter(item => item.status === selectedStatus.value);
        }

        if (selectedProjectCode.value) {
            tempItems = tempItems.filter(item => item.project_code === selectedProjectCode.value);
        }

        if (selectedLocationCode.value) {
            tempItems = tempItems.filter(item => item.location === selectedLocationCode.value);
        }

        if (selectedMd.value) {
            tempItems = tempItems.filter(item => item.cabinet_no === selectedMd.value);
        }

        filterdInstallationItems.value = tempItems;
        currentPage.value = 1;
    };

    const groupItemsByPartNo = (partNoItem) => {
        if (!Array.isArray(partNoItem)) {
            return [];
        }

        const partNoGroup = new Map();
        partNoItem.forEach(item => {
            const partNo = item.part_no || 'Chưa phân loại';
            if (!partNoGroup.has(partNo)) {
                partNoGroup.set(partNo, {
                    id: `${partNo}_${Date.now()}`,
                    part_no: partNo,
                    items: [],
                    total_quantity: 0
                });
            }

            const partNoItemGroup = partNoGroup.get(partNo);
            partNoItemGroup.items.push(item);
            partNoItemGroup.total_quantity += item.quantity || 0;
        });

        return Array.from(partNoGroup.values());
    };

    const totalPartNoItemsForPagination = computed(() => {
        return filterdInstallationItems.value.length;
    });

    const groupedInstallationStatus = computed(() => {
        if (!Array.isArray(filterdInstallationItems.value)) {
            return [];
        }

        const statusGroup = new Map();
        filterdInstallationItems.value.forEach(item => {
            const statusVal = item.status;
            if (!statusGroup.has(statusVal)) {
                statusGroup.set(statusVal, {
                    status: statusVal,
                    items: [],
                    total_quantity: 0
                });
            }
            const statusItemGroup = statusGroup.get(statusVal);
            statusItemGroup.items.push(item);
            statusItemGroup.total_quantity += item.quantity || 0;
        });
        
        return Array.from(statusGroup.values());
    });

    const groupedStatus = computed(() => {
        if (!Array.isArray(filterdInstallationItems.value)) {
            return [];
        }

        const statusGroups = new Map();
        filterdInstallationItems.value.forEach(item => {
            const statusVal = item.status;
            if (!statusGroups.has(statusVal)) {
                statusGroups.set(statusVal, {
                    status: statusVal,
                    items: [],
                    total_quantity: 0
                });
            }

            const statusGroup = statusGroups.get(statusVal);
            statusGroup.items.push(item);
            statusGroup.total_quantity += item.quantity || 0;
        });

        return Array.from(statusGroups.values());
    });

    const totalStatusForPagination = computed(() => {
        return filterdInstallationItems.value.length;
    });

    const fetchDataInstallationAndInitialize = async () => {
        await fetchTableDataInstallation();
    };

    watch(allItemsFromComposable, (newVal) => {
        if (newVal) {
            allInstallationItems.value = newVal;
            applyFilters();

            const items = new Map();
            allInstallationItems.value.forEach(item => {
                const itemId = item.id || item.part_no;
                if (itemId && !items.has(itemId)) {
                    items.set(itemId, { id: itemId, name: item.part_no });
                }
            });

            dummyItems.value = Array.from(items.values());
            productCodeOptions.value = uniqueProductCode.value;
            projectCodeOptions.value = uniqueProjectCode.value;
            brandOptions.value = uniqueBrand.value;
            locationOptions.value = uniqueLocation.value;
        } else {
            allInstallationItems.value = [];
            filterdInstallationItems.value = [];
            dummyItems.value = [];
        }
    }, { immediate: true });

    onMounted(() => {
        fetchDataInstallationAndInitialize();
    });

    return {
        // Import
        isLoading,
        errorVal,
        allInstallationItems,
        filterdInstallationItems,
        // Selected state
        selectedSeriNumber,
        selectedProductCode,
        selectedImportDate,
        selectedProjectCode,
        selectedLocationCode,
        selectedExportId,
        selectedMd,
        selectedStatus,
        currentPage,
        pageSize,
        dummyItems,
        productCodeOptions,
        loadingProductCode,
        projectCodeOptions,
        loadingProjectCode,
        locationOptions,
        loadingLocation,
        brandOptions,
        loadingBrand,
        mdOptions,
        loadingMD,
        // Function
        emptyInstallationVal,
        uniqueSeriNumber,
        uniqueBrand,
        remoteSearchBrand,
        uniqueProductCode,
        remoteSearchProductCode,
        uniqueProjectCode,
        remoteSearchProjectCode,
        uniqueLocation,
        remoteSearchLocation,
        uniqueMD,
        remoteSearchMD,
        uniqueStatus,
        applyFilters,
        groupItemsByPartNo,
        totalPartNoItemsForPagination,
        groupedInstallationStatus,
        groupedStatus,
        totalStatusForPagination,
        fetchDataInstallationAndInitialize,
    }
}