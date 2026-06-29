import type { ReactNode } from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted";

const MAP: Record<BadgeVariant, string> = {
    success: "admin-badge admin-badge-success",
    warning: "admin-badge admin-badge-warning",
    danger: "admin-badge admin-badge-danger",
    info: "admin-badge admin-badge-info",
    muted: "admin-badge admin-badge-muted",
};

export function AdminBadge({ variant = "muted", children }: { variant?: BadgeVariant; children: ReactNode }) {
    return <span className={MAP[variant]}>{children}</span>;
}
