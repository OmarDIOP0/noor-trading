import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AdminIcon, type AdminIconColor } from "@/components/admin/ui";

interface Props {
    icon: LucideIcon;
    title: string;
    description?: string;
    iconColor?: AdminIconColor;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, iconColor = "slate", action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-14 px-6">
            <AdminIcon icon={icon} color={iconColor} size="lg" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginTop: 16 }}>{title}</h3>
            {description && (
                <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6, maxWidth: 380 }}>{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
