import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/types";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AdminUser | null;
    isAuthenticated: boolean;
    setSession: (accessToken: string, refreshToken: string, user: AdminUser) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: AdminUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            setSession: (accessToken, refreshToken, user) =>
                set({ accessToken, refreshToken, user, isAuthenticated: true }),
            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),
            setUser: (user) => set({ user }),
            logout: () =>
                set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
        }),
        { name: "noortrading-auth" }
    )
);
