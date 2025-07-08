import { useAuthStore } from "../stores/auth";

export default function authHeader() {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
        return { Authorization: `Bearer ${token}` };
    } else {
        return {};
    }
}