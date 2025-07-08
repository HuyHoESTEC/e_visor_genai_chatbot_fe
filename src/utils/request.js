import axios from "axios";
import authHeader from "../services/auth-header";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
});

api.interceptors.request.use((config) => {
    const headers = authHeader();
    if (headers.Authorization) {
        config.headers = headers;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;