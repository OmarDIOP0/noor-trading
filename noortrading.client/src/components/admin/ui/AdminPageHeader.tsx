import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AdminIcon, type AdminIconColor } from "./AdminIcon";

interface Props {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: AdminIconColor;
    actions?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, icon, iconColor = "orange", actions }: Props) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
                {icon && <AdminIcon icon={icon} color={iconColor} size="lg" />}
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                        {title}
                    </h1>
                    {subtitle && <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 2 }}>{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
