import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

export type AdminIconColor = "orange" | "steel" | "amber" | "slate" | "green" | "red";
export type AdminIconSize = "sm" | "md" | "lg";

// Palette « glow » BTP : dégradé + halo lumineux + reflet interne
const COLORS: Record<AdminIconColor, { from: string; to: string; glow: string }> = {
    orange: { from: "#EA5B0C", to: "#F7873E", glow: "rgba(234,91,12,0.45)" },
    steel:  { from: "#2563EB", to: "#4F86F7", glow: "rgba(37,99,235,0.42)" },
    amber:  { from: "#D9870B", to: "#F5A623", glow: "rgba(245,166,35,0.42)" },
    slate:  { from: "#334155", to: "#5B6B7F", glow: "rgba(51,65,85,0.40)" },
    green:  { from: "#0E9F6E", to: "#1FC487", glow: "rgba(14,159,110,0.40)" },
    red:    { from: "#DC2626", to: "#F05252", glow: "rgba(220,38,38,0.40)" },
};

const SIZES: Record<AdminIconSize, { box: number; icon: number; radius: number }> = {
    sm: { box: 36, icon: 16, radius: 11 },
    md: { box: 48, icon: 22, radius: 13 },
    lg: { box: 60, icon: 28, radius: 16 },
};

interface Props {
    icon: LucideIcon;
    color?: AdminIconColor;
    size?: AdminIconSize;
    className?: string;
    style?: CSSProperties;
}

export function AdminIcon({ icon: Icon, color = "orange", size = "md", className, style }: Props) {
    const c = COLORS[color];
    const s = SIZES[size];
    return (
        <div
            className={className}
            style={{
                width: s.box,
                height: s.box,
                borderRadius: s.radius,
                background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                boxShadow: `0 4px 14px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                ...style,
            }}
        >
            <Icon style={{ width: s.icon, height: s.icon, color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.22))" }} />
        </div>
    );
}
