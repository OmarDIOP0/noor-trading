import type { LucideIcon } from "lucide-react";
import { AdminIcon, type AdminIconColor } from "@/components/admin/ui";

interface Props {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: AdminIconColor;
    accent?: string;          // couleur de la barre supérieure
    hint?: string;
}

export function StatCard({ label, value, icon, color = "orange", accent, hint }: Props) {
    return (
        <div className="admin-card admin-card-hover overflow-hidden">
            <div className="h-1 w-full" style={{ background: accent ?? "var(--orange)" }} />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-faint)" }}>
                        {label}
                    </p>
                    <AdminIcon icon={icon} color={color} size="md" />
                </div>
                <p className="count-anim" style={{ fontSize: 30, fontWeight: 800, color: "var(--ink)", lineHeight: 1.1 }}>
                    {value}
                </p>
                {hint && <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 6 }}>{hint}</p>}
            </div>
        </div>
    );
}
