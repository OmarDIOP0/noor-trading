import api from "./client";
import type { ApiResponse, AuthResult, AdminUser, ChangePasswordRequest } from "@/types";

export const authApi = {
    login: (email: string, password: string) =>
        api.post<ApiResponse<AuthResult>>("/api/auth/login", { email, password })
            .then((r) => r.data.data!),

    me: () => api.get<ApiResponse<AdminUser>>("/api/auth/me").then((r) => r.data.data!),

    changePassword: (body: ChangePasswordRequest) =>
        api.post<ApiResponse<null>>("/api/auth/change-password", body).then((r) => r.data),
};
