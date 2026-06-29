import { NavLink } from "react-router-dom";
import { LayoutDashboard, UserRound, HardHat, Building2, Route, Settings, HardHat as Logo, X } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useUiStore } from "@/stores/ui.store";
import { assetUrl } from "@/lib/utils";

const NAV = [
    { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
    { to: "/admin/profil", label: "Profil", icon: UserRound },
    { to: "/admin/services", label: "Services", icon: HardHat },
    { to: "/admin/projets", label: "Réalisations", icon: Building2 },
    { to: "/admin/parcours", label: "Parcours", icon: Route },
    { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
    const { data: settings } = useSettings();
    const { sidebarOpen, setSidebarOpen } = useUiStore();

    const content = (
        <aside
            className="flex flex-col h-full"
            style={{ width: 256, background: "var(--surface)", borderRight: "1px solid var(--border)" }}
        >
            {/* Marque */}
            <div className="flex items-center justify-between gap-2 px-5" style={{ height: 68, borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2.5 min-w-0">
                    {settings?.logoUrl ? (
                        <img src={assetUrl(settings.logoUrl)} alt="" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#EA5B0C,#F7873E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(234,91,12,0.4)" }}>
                            <Logo size={18} color="#fff" />
                        </div>
                    )}
                    <span className="truncate" style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
                        {settings?.appName ?? "NoorTrading"}
                    </span>
                </div>
                <button className="admin-btn-ghost lg:hidden" style={{ height: 34, width: 34, padding: 0 }} onClick={() => setSidebarOpen(false)} aria-label="Fermer">
                    <X size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {NAV.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setSidebarOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                        style={({ isActive }) => ({
                            background: isActive ? "var(--hover)" : "transparent",
                            color: isActive ? "var(--orange)" : "var(--ink-soft)",
                            fontWeight: isActive ? 700 : 600,
                            fontSize: 14.5,
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={19} style={{ color: isActive ? "var(--orange)" : "var(--ink-faint)" }} />
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, color: "var(--ink-faint)" }}>NoorTrading · Admin</p>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block sticky top-0 h-screen flex-shrink-0">{content}</div>

            {/* Mobile drawer */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0" style={{ background: "rgba(20,32,43,0.45)" }} onClick={() => setSidebarOpen(false)} />
                    <div className="relative h-full">{content}</div>
                </div>
            )}
        </>
    );
}
