import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT;

export const mergeFilesApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/POD_TimeTracker_Merge`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        if (axios.isCancel(err)) {
            throw new Error("Yêu cầu API ghép nối đã bị hủy.");
        }
        // Resolve error from Server or Network
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`API ghép nối lỗi:: ${errorMessage}`);
    }
};

export const getDownloadUrlApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/POD_TimeTracker_Download`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data && response.data.url) {
            return response.data.url;
        }

        if (typeof response.data === "string" && response.data.startsWith('http')) {
            return response.data;
        }
        
    } catch (err) {
        if (axios.isCancel(err)) {
            throw new Error("Yêu cầu API lấy URL tải xuống đã bị hủy bỏ.");
        }
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định khi lấy URL tải xuống";
        throw new Error(`API lấy URL tải xuống lỗi: ${errorMessage}`);
    }
};

export const loginApi = async (payload, signal) => {
    const response = await axios.post(`${API_BASE_URL}/Login`, payload, {
        signal,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export const logoutApi = async (payload, signal) => {
    const response = await axios.post(`${API_BASE_URL}/Logout`, payload, {
        signal,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export const fileUploadApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/POD_TimeTracker_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}
// -----Change Password API-----
export const changePassword = async (payload, signal) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/ChangePassword`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}
// -----Work Management Uploading API-----
export const loadWorkManagementKHTCApi = async (payload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WorkManagement_View`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const filterWorkManagementKHTCByDateApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WorkManagement_View`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const uploadWorkManagementKHTCApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WorkManagement_Processing`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}
// -----Work Management API-----
export const actionFormWorkManagementKHTCApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WorkManagement_DML`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const uploadWorkManagementDocumentApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WorkManagement_Document_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (err) {
        if (axios.isCancel(err)) {
            throw new Error("Yêu cầu API tải tài liệu đã bị hủy.");
        }
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định khi tải tài liệu";
        throw new Error(`API tải tài liệu lỗi: ${errorMessage}`);
    }
}

export const getDocumentByUserIdApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/GetDocumentByUserId`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        if (axios.isCancel(err)) {
            throw new Error("Yêu cầu API lấy tài liệu theo user_id đã bị hủy.");
        }
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định khi lấy tài liệu theo user_id";
        throw new Error(`API lấy tài liệu theo user_id lỗi: ${errorMessage}`);
    }
}
// -----Warehouse Management API-----
export const getWarehouseManagementApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseStatistical_View`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (e) {
        if (axios.isCancel(e)) {
            throw new Error("Yêu cầu API lấy tài liệu đã bị hủy.");
        }
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định khi lấy tài liệu";
        throw new Error(`API lấy tài liệu lỗi: ${errorMessage}`);
    }
}

export const updateDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseStatistical_DML`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (e) {
        if (axios.isCancel(e)) {
            throw new Error("Yêu cầu API cập nhật thông tin đã bị hủy");
        }
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`Lỗi API cập nhật thông tin: ${errorMessage}`);
    }
}

export const uploadDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseStatistical_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const loadingImportDataWarehouse = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_View`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (e) {
        if (axios.isCancel(e)) {
            throw new Error("Yêu cầu API lấy thông tin nhập hàng đã bị hủy");
        }
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`Lỗi API lấy thông tin nhập hàng: ${errorMessage}`);
    }
}

export const uploadImportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const updateImportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_DML`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const deleteImportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_DML`,
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const exportToFileForImportApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_Download`, 
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const loadingExportDataWarehouse = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_View`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (e) {
        if (axios.isCancel(e)) {
            throw new Error("Yêu cầu API lấy thông tin nhập hàng đã bị hủy");
        }
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`Lỗi API lấy thông tin nhập hàng: ${errorMessage}`);
    }
}

export const uploadExportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const updateExportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_DML`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const createExportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_DML`, payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const deleteExportDataWarehouseApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_DML`,
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const exportToFileForExportApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseImportExport_Download`, 
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const getWarehouseDashboardApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseStatistical_Dashboard`, 
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const loadingWarehouseInstallationApi = async (payload, signal) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_View`,
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};

export const uploadInstallationApi = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_Upload`, payload, {
            signal,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const filterInstallaitonDataApi = async (payload, signal) => {
    try{
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_View`,
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
}

export const downloadInstallationFile = async (payload, signal) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/WS/WarehouseInstallation_Download`, 
        payload, {
            signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Lỗi không xác định";
        throw new Error(`${errorMessage}`);
    }
};