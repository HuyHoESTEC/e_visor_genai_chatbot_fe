import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization header
api.interceptors.request.use(
  // (config) => {
  //   const authStore = useAuthStore();
  //   if (authStore.token) {
  //     config.headers.Authorization = `Bearer ${authStore.token}`;
  //   }
  //   return config
  // },
  // (error) => {
  //   return Promise.reject(error);
  // }
  async (config) => {
    const authStore = useAuthStore();
    // Get current Firebase ID Token
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    } else if (authStore.token) {
      // Fallback if user does not already but store have a token from localStorage
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to resolve error 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  // (error) => {
  //   if (error.response && error.response.status === 401) {
  //     const authStore = useAuthStore();
  //     authStore.logout(); // Auto logout if token is invalid
  //     console.warn('Unauthorized: Logging out due to 401 response.');
  //   }
  //   return Promise.reject(error);
  // }
  async (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      // Nếu backend trả về 401, có thể token hết hạn hoặc không hợp lệ.
      // Forced logout.
      console.warn('Unauthorized: Logging out due to 401 response from backend.');
      await authStore.logout(); // Gọi logout Firebase
    }
    return Promise.reject(error);
  }
);

export default api;