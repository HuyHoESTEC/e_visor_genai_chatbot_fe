import { computed, onMounted, reactive, ref, watch } from "vue";
import { useLoadWarehouseInstallationPart } from "./useLoadWarehouseInstallationPart";

export function useWarehouseInstallationPartManagement() {
    const {
        tableData: allItemsFromComposable,
        isLoading,
        errorVal,
        fetchTableDataInstallation,
    } = useLoadWarehouseInstallationPart();
    // --- STATE MANAGEMENT ---
    const allInstallationItems = ref([]);
    const filterdInstallationItems = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const dummyItems = ref([]);
    // Gộp các giá trị filter vào 1 object reactive để dễ quản lý
    const filters = reactive({
        seri_number: null,
        part_no: null,
        project_code: null,
        location: null,
        cabinet_no: null,
        status: null,
        origin: null,
    });
    // Gộp các options và trạng thái loading của dropdown
    // const options = reactive({
    //     productCode: {
    //         data: [],
    //         loading: false
    //     },
    //     projectCode: {
    //         data: [],
    //         loading: false
    //     },
    //     location: {
    //         data: [],
    //         loading: false
    //     },
    //     brand: {
    //         data: [],
    //         loading: false
    //     },
    //     md: {
    //         data: [],
    //         loading: false
    //     }
    // });

    const dropdownOptions = reactive({
        brand: [],
        productCode: [],
        projectCode: [],
        location: [],
        md: [],
    });

    const loadings = reactive({
        brand: false,
        productCode: false,
        projectCode: false,
        location: false,
        md: false,
    });
    // 1. Hàm dùng chung để lấy danh sách duy nhất từ mảng theo key
    const getUniqueEntries = (data, key) => {
        if (!data || data.length === 0) return [];
        const map = new Map();
        data.forEach(item => {
            const val = item[key];
            if (val !== null && val !== undefined && !map.has(val)) {
                map.set(val, {
                    id: val,
                    name: val
                });
            }
        });
        return Array.from(map.values());
    };
    // 2. Hàm dùng chung cho Remote Search
    const performRemoteSearch = (query, sourceComputed, key) => {
        if (!query) {
            dropdownOptions[key] = sourceComputed.value;
            return;
        }
        loadings[key] = true;
        setTimeout(() => {
            dropdownOptions[key] = sourceComputed.value.filter(item => item.name.toString().toLowerCase().includes(query.toLowerCase()));
            loadings[key] = false;
        }, 200);
    };
    // 3. Hàm dùng chung để gom nhóm dữ liệu
    const groupDataBy = (data, key) => {
        if (!Array.isArray(data)) return [];
        const groups = new Map();
        data.forEach(item => {
            const groupVal = item[key] || 'Chưa phân loại';
            if (!groups.has(groupVal)) {
                groups.set(groupVal, {
                    [key]: groupVal,
                    items: [],
                    total_quantity: 0
                });
            }
            const group = groups.get(groupVal);
            group.items.push(item);
            group.total_quantity += (item.quantity || 0);
        });
        return Array.from(groups.values());
    };
    // --- COMPUTED PROPERTIES ---
    const uniqueSeriNumber = computed(() => getUniqueEntries(allInstallationItems.value, 'seri_number'));
    const uniqueBrand = computed(() => getUniqueEntries(allInstallationItems.value, 'origin'));
    const uniqueProductCode = computed(() => getUniqueEntries(allInstallationItems.value, 'product_code'));
    const uniqueProjectCode = computed(() => getUniqueEntries(allInstallationItems.value, 'project_code'));
    const uniqueLocation = computed(() => getUniqueEntries(allInstallationItems.value, 'location'));
    const uniqueMD = computed(() => getUniqueEntries(allInstallationItems.value, 'cabinet_no'));
    const uniqueStatus = computed(() => getUniqueEntries(allInstallationItems.value, 'status'));

    const emptyInstallationVal = computed(() => !isLoading.value && !errorVal.value && filterdInstallationItems.value.length === 0);
    // --- SEARCH ACTIONS ---
    const remoteSearchBrand = (q) => performRemoteSearch(q, uniqueBrand, 'brand');
    const remoteSearchProductCode = (q) => performRemoteSearch(q, uniqueProductCode, 'productCode');
    const remoteSearchProjectCode = (q) => performRemoteSearch(q, uniqueProjectCode, 'projectCode');
    const remoteSearchLocation = (q) => performRemoteSearch(q, uniqueLocation, 'location');
    const remoteSearchMD = (q) => performRemoteSearch(q, uniqueMD, 'md');
    // --- FILTER LOGIC ---
    const applyFilters = () => {
        let temp = [...allInstallationItems.value];
        // Map giữa key trong filters và key trong item dữ liệu
        const filterMapping = {
            part_no: filters.part_no,
            seri_number: filters.seri_number,
            project_code: filters.project_code,
            location: filters.location,
            cabinet_no: filters.cabinet_no,
            status: filters.status
        };

        Object.keys(filterMapping).forEach(key => {
            const filterVal = filterMapping[key];
            if (filterVal !== null && filterVal !== undefined && filterVal !== "") {
                temp = temp.filter(item => item[key] === filterVal);
            }
        });

        filterdInstallationItems.value = temp;
        currentPage.value = 1;
    };
    // --- GROUPING ---
    const groupItemsByPartNo = (items) => groupDataBy(items, 'part_no');
    const groupedStatus = computed(() => groupDataBy(filterdInstallationItems.value, 'status'));

    const totalPartNoItemsForPagination = computed(() => filterdInstallationItems.value.length);
    const fetchDataInstallationAndInitialize = () => {
        fetchTableDataInstallation();
    };

    watch(allItemsFromComposable, (newVal) => {
        if (newVal) {
            allInstallationItems.value = newVal;
            applyFilters();
            // Khởi tạo dummy items (nếu cần cho UI)
            dummyItems.value = getUniqueEntries(newVal, 'part_no');
            // Reset options mặc định
            dropdownOptions.productCode = uniqueProductCode.value;
            dropdownOptions.projectCode = uniqueProjectCode.value;
            dropdownOptions.brand = uniqueBrand.value;
            dropdownOptions.location = uniqueLocation.value;
        } else {
            allInstallationItems.value = [];
            filterdInstallationItems.value = [];
        }
    }, { immediate: true });

    onMounted(fetchTableDataInstallation);

    return {
        isLoading,
        errorVal,
        allInstallationItems,
        filterdInstallationItems,
        filters,
        dropdownOptions,
        currentPage,
        pageSize,
        dummyItems,
        uniqueSeriNumber,
        uniqueBrand,
        uniqueProductCode,
        uniqueProjectCode,
        uniqueLocation,
        uniqueMD,
        uniqueStatus,
        emptyInstallationVal,
        remoteSearchBrand,
        remoteSearchProductCode,
        remoteSearchProjectCode,
        remoteSearchMD,
        remoteSearchLocation,
        applyFilters,
        groupItemsByPartNo,
        groupedStatus,
        totalPartNoItemsForPagination,
        fetchDataInstallationAndInitialize,
    };
}