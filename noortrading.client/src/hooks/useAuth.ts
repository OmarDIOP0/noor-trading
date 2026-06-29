import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { ChangePasswordRequest } from "@/types";

export function useLogin() {
    const setSession = useAuthStore((s) => s.setSession);
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.login(email, password),
        onSuccess: (res) => setSession(res.accessToken, res.refreshToken, res.user),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (body: ChangePasswordRequest) => authApi.changePassword(body),
    });
}

export function useLogout() {
    const logout = useAuthStore((s) => s.logout);
    return () => {
        logout();
        window.location.href = "/admin/login";
    };
}
