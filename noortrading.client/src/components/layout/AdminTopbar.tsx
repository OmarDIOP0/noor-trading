import { Menu, Moon, Sun, LogOut } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";

export function AdminTopbar() {
    const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
    const theme = useUiStore((s) => s.theme);
    const toggleTheme = useUiStore((s) => s.toggleTheme);
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();

    const initials = (user?.fullName || user?.email || "A").trim().charAt(0).toUpperCase();

    return (
        <header
            className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6"
            style={{
                height: 68,
                background: "color-mix(in srgb, var(--surface) 88%, transparent)",
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <button className="admin-btn-ghost lg:hidden" style={{ height: 38, width: 38, padding: 0 }} onClick={() => setSidebarOpen(true)} aria-label="Menu">
                <Menu size={20} />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                <button className="admin-btn-ghost" style={{ height: 38, width: 38, padding: 0 }} onClick={toggleTheme} aria-label="Thème">
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <div className="flex items-center gap-2.5 pl-2">
                    <div style={{ width: 36, height: 36, borderRadius: "9999px", background: "linear-gradient(135deg,#2563EB,#4F86F7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                        {initials}
                    </div>
                    <div className="hidden sm:block leading-tight">
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{user?.fullName || "Administrateur"}</p>
                        <p style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{user?.email}</p>
                    </div>
                </div>

                <button className="admin-btn-ghost" style={{ height: 38, width: 38, padding: 0 }} onClick={logout} aria-label="Déconnexion" title="Déconnexion">
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
