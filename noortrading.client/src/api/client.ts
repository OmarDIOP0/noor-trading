import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Request : attache le Bearer token ────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response : refresh auto sur 401 + message d'erreur normalisé ─────────────
let isRefreshing = false;
let pending: Array<(token: string) => void> = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        if (status === 401 && original && !original._retry) {
            const { refreshToken, logout, setTokens } = useAuthStore.getState();
            if (!refreshToken) {
                logout();
                redirectToLogin();
                return Promise.reject(normalize(error));
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pending.push((token) => {
                        if (original.headers) (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                        resolve(api(original));
                    });
                    setTimeout(() => reject(normalize(error)), 10000);
                });
            }

            original._retry = true;
            isRefreshing = true;
            try {
                const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
                const tokens = data.data ?? data;
                setTokens(tokens.accessToken, tokens.refreshToken);
                pending.forEach((cb) => cb(tokens.accessToken));
                pending = [];
                if (original.headers) (original.headers as Record<string, string>).Authorization = `Bearer ${tokens.accessToken}`;
                return api(original);
            } catch (refreshError) {
                pending = [];
                useAuthStore.getState().logout();
                redirectToLogin();
                return Promise.reject(normalize(refreshError));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(normalize(error));
    }
);

function redirectToLogin() {
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
    }
}

/** Renvoie une Error dont le message provient de l'enveloppe API. */
function normalize(error: unknown): Error {
    const e = error as { response?: { data?: { message?: string; errors?: string[] } }; message?: string };
    const msg =
        e.response?.data?.message ??
        e.response?.data?.errors?.[0] ??
        e.message ??
        "Une erreur est survenue";
    return new Error(msg);
}

export default api;
