import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface UiState {
    theme: Theme;
    sidebarOpen: boolean;     // drawer mobile
    toggleTheme: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set, get) => ({
            theme: "light",
            sidebarOpen: false,
            toggleTheme: () => {
                const next: Theme = get().theme === "light" ? "dark" : "light";
                applyTheme(next);
                set({ theme: next });
            },
            setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        }),
        {
            name: "noortrading-ui",
            onRehydrateStorage: () => (state) => {
                if (state) applyTheme(state.theme);
            },
        }
    )
);

export function applyTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme);
}
