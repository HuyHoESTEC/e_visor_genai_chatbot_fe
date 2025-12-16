import { computed, onMounted, ref, watch } from "vue";
import { useDateFormat } from "../utils/useDateFormat";
import { useLoadWarehouseInstallation } from "./useLoadWarehouseInstallation.js";

export function useWarehouseInstallationManagement() {
    const { tableData: allItemsFromComposable, installedData, notInstalledData, isLoading, error, fetchTableDataInstallation } = useLoadWarehouseInstallation();
    // Define a new ref to save data was fetched
    const allInstallationItems = computed(() => {
        const installed = Array.isArray(installedData.value) ? installedData.value : [];
        const notInstalled = Array.isArray(notInstalledData.value) ? notInstalledData.value : [];
        return [...installed, ...notInstalled];
    });

    const countInstalled = computed(() => installedData.value?.length || 0);
    const countNotInstalled = computed(() => notInstalledData.value?.length || 0);

    // State for filter tools 
    const selectedSeriNumber = ref(null);
    const selectedProductCode = ref(null);
    const selectedImportDate = ref(null);
    const selectedProjectCode = ref(null);
    const selectedLocationCode = ref(null);
    const selectedExportId = ref(null);
    const selectedStatus = ref(null);
    const selectedMD = ref(null);

    const filteredInstallationItems = computed(() => {
        let tempItems = allInstallationItems.value || [];
        if (selectedProductCode.value) {
            tempItems = tempItems.filter(item => item.part_no === selectedProductCode.value);
        }
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

        // Lọc theo MD (Cabinet No) - KIỂM TRA TÊN TRƯỜNG cabinet_no CÓ ĐÚNG KHÔNG
        if (selectedMD.value) {
            tempItems = tempItems.filter(item => item.cabinet_no === selectedMD.value);
        }

        return tempItems;
    });

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

    const exportIdOptions = ref([]);
    const loadingExportId = ref(false);

    const brandOptions = ref([]);
    const loadingBrand = ref(false);

    const mdOptions = ref([]);
    const loadingMD = ref(false);

    const { extractDateOnly } = useDateFormat();

    // EmptyData will be computed property to show data status
    const emptyInstallationData = computed(() => {
        if (isLoading.value || error.value) {
            return false;
        }

        return filteredInstallationItems.value.length === 0;
    })

    // Computed properties for project code dropdown
    const uniqueSeriNumber = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }
        const itemSeriNumber = new Map();
        allInstallationItems.value.forEach((item) => {
            const seriCode = item.seri_number;
            if (seriCode && !itemSeriNumber.has(seriCode)) {
                itemSeriNumber.set(seriCode, { id: seriCode, name: seriCode });
            }
        });

        return Array.from(itemSeriNumber.values());
    });

    const uniqueBrand = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }
        const itemBrand = new Map();
        allInstallationItems.value.forEach((item) => {
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
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const itemProductCode = new Map();
        allInstallationItems.value.forEach((item) => {
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
            productCodeOptions.value = [];
        }
    };
    
    const uniqueProjectCode = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const itemProjectCode = new Map();
        allInstallationItems.value.forEach((item) => {
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
            projectCodeOptions.value = [];
        }
    };

    const uniqueLocation = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const itemLocation = new Map();
        allInstallationItems.value.forEach((item) => {
            const locationVal = item.location;
            if (locationVal && !itemLocation.has(locationVal)) {
                itemLocation.set(locationVal, { id: locationVal, name: locationVal })
            }
        });

        return Array.from(itemLocation.values());
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

        const itemMdVal = new Map();
        allInstallationItems.value.forEach((item) => {
            const mdVal = item.cabinet_no;
            if (mdVal && !itemMdVal.has(mdVal)) {
                itemMdVal.set(mdVal, { id: mdVal, name: mdVal })
            }
        });

        return Array.from(itemMdVal.values());
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

    const uniqueExportId = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }

        const itemExportId = new Map();
        allInstallationItems.value.forEach((item) => {
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

    const uniqueStatus = computed(() => {
        if (!allInstallationItems.value || allInstallationItems.value.length === 0) {
            return [];
        }
        const itemStatus = new Map();
        allInstallationItems.value.forEach((item) => {
            const statusVal = item.status;
            if (statusVal !== null && statusVal !== undefined && !itemStatus.has(statusVal)) {
                itemStatus.set(statusVal, { id: statusVal, name: statusVal });
            }
        });
        
        return Array.from(itemStatus.values());
    });

    // Function use filter and update filteredInstallationItems
    const applyFilters = () => {
        // let tempItems = Array.isArray(allInstallationItems.value) ? [...allInstallationItems.value] : [];

        // if (selectedProductCode.value) {
        //     tempItems = tempItems.filter(item => item.part_no === selectedProductCode.value);
        // }

        // if (selectedSeriNumber.value) {
        //     tempItems = tempItems.filter(item => item.seri_number === selectedSeriNumber.value);
        // }

        // if (selectedStatus.value !== null && selectedStatus.value !== undefined) {
        //     tempItems = tempItems.filter(item => item.status === selectedStatus.value);        
        // }

        // // if (selectedImportDate.value) {
        // //     const filterImportDate = selectedImportDate.value;
        // //     tempItems = tempItems.filter(item => {
        // //             const itemDateOnly = extractDateOnly(item.export_time);
        // //             return itemDateOnly === filterImportDate;
        // //     });
        // // }

        // if (selectedProjectCode.value) {
        //     const filterProjectCode = selectedProjectCode.value;
        //     tempItems = tempItems.filter(item => item.project_code === filterProjectCode);
        // }

        // if (selectedLocationCode.value) {
        //     const locationCodeVal = selectedLocationCode.value;
        //     tempItems = tempItems.filter(item => item.location === locationCodeVal);
        // }

        // if (selectedExportId.value) {
        //     const exportIdVal = selectedExportId.value;
        //     tempItems = tempItems.filter(item => item.export_id === exportIdVal);
        // }

        // if (selectedMD.value) {
        //     const mdVal = selectedMD.value;
        //     tempItems = tempItems.filter(item => item.cabinet_no === mdVal);
        // }

        // filteredInstallationItems.value = tempItems;
        currentPage.value = 1;
    };

    // const groupItemsByPartNo = computed(() => {
    //     if (!Array.isArray(filteredInstallationItems.value)) {
    //         return [];
    //     }        
    //     console.log("filteredInstallationItems.value:",filteredInstallationItems.value);
    //     const groups = new Map();
    //     filteredInstallationItems.value.forEach(item => {
    //         const PartNo = item.part_no;
    //         if (!groups.has(PartNo)) {
    //             groups.set(PartNo, {
    //                 part_no: PartNo,
    //                 items: [],
    //                 total_quantity: 0
    //             });
    //         }

    //         const group = groups.get(PartNo);
    //         group.items.push(item);
    //         group.total_quantity += item.quantity || 0;
    //     });
    //     return Array.from(groups.values());
    // });

    const groupItemsByPartNo = (partnoItems) => {
        if (!Array.isArray(partnoItems)) {
            return [];
        }
        const groups = new Map();
        partnoItems.forEach(item => { 
            const partNo = item.part_no || 'Chưa phân loại';
            if (!groups.has(partNo)) {
                groups.set(partNo, {
                    id: `${partNo}_${Date.now()}`, 
                    part_no: partNo,
                    items: [],
                    total_quantity: 0
                });
            }

            const group = groups.get(partNo);
            group.items.push(item);
            group.total_quantity += item.quantity || 0;
        });

        return Array.from(groups.values());
    };

    const totalPartNoItemsForPagination = computed(() => {
        return groupItemsByPartNo.value.length
    })

    const groupedInstallationStatus = computed(() => {
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
        return groupedStatus.value.length
    })    
    // Function to load data and modify values
    const fetchDataInstallationAndInitialize = async () => {
        await fetchTableDataInstallation();
    };

    watch(allItemsFromComposable, (newValue) => {
    if (newValue && newValue.length > 0) {
        // Cập nhật các danh sách gợi ý cho dropdown
        productCodeOptions.value = uniqueProductCode.value;
        projectCodeOptions.value = uniqueProjectCode.value;
        exportIdOptions.value = uniqueExportId.value;
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
        allInstallationItems,
        filteredInstallationItems,
        selectedProductCode,
        selectedSeriNumber,
        selectedStatus,
        currentPage,
        pageSize,
        dummyItems,
        emptyInstallationData,
        uniqueProductCode,
        uniqueSeriNumber,
        applyFilters,
        fetchDataInstallationAndInitialize,
        selectedImportDate,
        selectedProjectCode,
        uniqueProjectCode,
        productCodeOptions,
        loadingProductCode,
        remoteSearchProductCode,
        groupedInstallationStatus,
        totalStatusForPagination,
        projectCodeOptions,
        loadingProjectCode,
        remoteSearchProjectCode,
        selectedExportId,
        selectedStatus,
        exportIdOptions,
        loadingExportId,
        remoteSearchExportId,
        remoteSearchLocation,
        brandOptions,
        loadingBrand,
        remoteSearchBrand,
        locationOptions,
        loadingLocation,
        uniqueLocation,
        uniqueStatus,
        selectedLocationCode,
        selectedMD,
        remoteSearchMD,
        loadingMD,
        mdOptions,
        fetchTableDataInstallation,
        groupedStatus,
        totalStatusForPagination,
        groupItemsByPartNo,
        totalPartNoItemsForPagination,
        installedData,
        notInstalledData,
        countInstalled,
        countNotInstalled,
    }
}