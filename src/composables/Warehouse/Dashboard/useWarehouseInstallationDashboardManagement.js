import { computed, onMounted, ref, watch } from "vue";
import { useLoadInstallationDashboard } from "./useLoadInstallationDashboard";

export function useWarehouseInstallationDashboardManagment() {
    const {
        tableData: allItemsFromComposable,
        installedData,
        notInstalledData,
        isLoading,
        errorVal,
        fetchTableDataInstallation
    } = useLoadInstallationDashboard();

    const allInstallationItems = computed(() => {
        const installedListItem = Array.isArray(installedData.value) ? installedData.value : [];
        const notInstalledListItem = Array.isArray(notInstalledData.value) ? notInstalledData.value : [];

        return [...installedListItem, ...notInstalledListItem];
    });

    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);
    const selectedProjectCode = ref(null);
    const selectedLocationCode = ref(null);
    const selectedStatus = ref(null);
    const selectedMd = ref(null);

    const filteredInstallationItems = computed(() => {
        let tempItems = allInstallationItems.value || [];
        // Lọc theo Seri
        if (selectedSeriNumber.value) {
            tempItems = tempItems.filter(item => item.seri_number === selectedSeriNumber.value);
        }

        // Lọc theo Status
        if (selectedStatus.value !== null && selectedStatus.value !== undefined) {
            tempItems = tempItems.filter(item => item.status === selectedStatus.value);
        }

        // Lọc theo Project Code
        if (selectedProjectCode.value) {
            tempItems = tempItems.filter(item => item.project_code === selectedProjectCode.value);
        }

        // Lọc theo MD (Cabinet No)
        if (selectedMd.value) {
            tempItems = tempItems.filter(item => item.cabinet_no === selectedMd.value);
        }

        return tempItems;
    });

    const currentPage = ref(1);
    const pageSize = ref(10);
    
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

    const emptyInstallationData = computed(() => {
        if (isLoading.value || errorVal.value) {
            return false;
        }

        return filteredInstallationItems.value.length === 0;
    });

    const uniqueSeriNumber = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const seriNumberItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const seriCode = item.seri_number;
            if (seriCode && !seriNumberItem.has(seriCode)) {
                seriNumberItem.set(seriCode, {
                    id: seriCode,
                    name: seriCode
                });
            }
        });

        return Array.from(seriNumberItem.values());
    });

    const uniqueBrand = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const brandItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const brandVal= item.origin;
            if (brandVal && !brandItem.has(brandVal)) {
                brandItem.set(brandVal, {
                    id: brandVal,
                    name: brandVal
                });
            }
        });

        return Array.from(brandItem.values());
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
        allInstallationItems.value.forEach((item) => {
            const productCode = item.part_no;
            if (productCode && !productCodeItem.has(productCode)) {
                productCodeItem.set(productCode, {
                    id: productCode,
                    name: productCode
                });
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
            productCodeOptions.value = [];
        }
    };

    const uniqueProjectCode = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const projectCodeItem = new Map();
        allInstallationItems.value.forEach((item) => {
            const projectCode = item.project_code;
            if (projectCode && !projectCodeItem.has(projectCode)) {
                projectCodeItem.set(projectCode, {
                    id: projectCode,
                    name: projectCode
                });
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
            productCodeOptions.value = [];
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
                locationItem.set(locationVal, {
                    id: locationVal,
                    name: locationVal
                })
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
            locationOptions.value = [];
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
                mdItem.set(mdVal, {
                    id: mdVal,
                    name: mdVal
                })
            }
        });

        return Array.from(mdItem.values());
    });

    const remoteSearchMD = (query) => {
        if (query) {
            loadingMD.value = true;
            setTimeout(() => {
                loadingMD.value = false;
                mdOptions.value = uniqueMD.value.filter((item) => {
                    return item.name.toLowerCase().includes(query.toLowerCase());
                })
            }, 200);
        } else {
            mdOptions.value = [];
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
                statusItem.set(statusVal, {
                    id: statusVal,
                    name: statusVal
                });
            }
        });

        return Array.from(statusItem.values());
    });

    const applyFilters = () => {
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

            const partNoList = partNoGroup.get(partNo);
            partNoList.items.push(item);
            partNoList.total_quantity += item.quantity || 0;
        });

        return Array.from(partNoGroup.values());
    };

    const totalPartNoItemsForPagination = computed(() => {
        return filteredInstallationItems.value.length;
    });

    const groupedIstallationStatus = computed(() => {
        if (!Array.isArray(filteredInstallationItems.value)) {
            return [];
        }

        const installationStatusGroup = new Map();
        filteredInstallationItems.value.forEach(item => {
            const statusVal = item.status;
            if (!installationStatusGroup.has(statusVal)) {
                installationStatusGroup.set(statusVal, {
                    status: statusVal,
                    items: [],
                    total_quantity: 0
                });
            }

            const installationStatusList = installationStatusGroup.get(statusVal);
            installationStatusList.items.push(item);
            installationStatusList.total_quantity += item.quantity || 0;
        });

        return Array.from(installationStatusGroup.values());
    });

    const groupedStatus = computed(() => {
        if (!Array.isArray(filteredInstallationItems.value)) {
            return [];
        }                
        const groups = new Map();
        filteredInstallationItems.value.forEach(item => {
            const Status = item.status;
            if (!groups.has(Status)) {
                groups.set(Status, {
                    status: Status,
                    items: [],
                    total_quantity: 0
                });
            }

            const group = groups.get(Status);
            group.items.push(item);
            group.total_quantity += item.quantity || 0;
        });
        return Array.from(groups.values());
    });

    const totalStatusForPagination = computed(() => {
        return filteredInstallationItems.value.length;
    });

    const fetchDataInstallationAndInitialize = async () => {
        await fetchTableDataInstallation();
    };

    watch(allItemsFromComposable, (newVal) => {
        if (newVal && newVal.length > 0) {
            // Cập nhật các danh sách gợi ý cho dropdown
            productCodeOptions.value = uniqueProductCode.value;
            projectCodeOptions.value = uniqueProjectCode.value;
            brandOptions.value = uniqueBrand.value;
            locationOptions.value = uniqueLocation.value;
            mdOptions.value = uniqueMD.value;

            // Xử lý dummyItems
            const itemsMap = new Map();
            allInstallationItems.value.forEach(item => {
                const itemId = item.id || item.part_no;
                if (itemId && !itemsMap.has(itemId)) {
                    itemsMap.set(itemId, { id: itemId, name: item.part_no });
                }
            });
            dummyItems.value = Array.from(itemsMap.values());
        }
    }, { immediate: true });

    onMounted(() => {
        fetchDataInstallationAndInitialize();
    });

    return {
        isLoading,
        errorVal,
        allInstallationItems,
        selectedSeriNumber,
        selectedProductCode,
        selectedProjectCode,
        selectedLocationCode,
        selectedStatus,
        selectedMd,
        filteredInstallationItems,
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
        emptyInstallationData,
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
        groupedIstallationStatus,
        groupedStatus,
        totalStatusForPagination,
        fetchDataInstallationAndInitialize,
        installedData,
        notInstalledData,
    }
}