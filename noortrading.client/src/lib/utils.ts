import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind en évitant les conflits. */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/** Construit une URL absolue à partir d'un chemin servi par le backend (/uploads/...). */
export function assetUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    return path.startsWith("/") ? path : `/${path}`;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

/** « il y a 3 jours » — distance relative simple en français. */
export function timeAgo(iso?: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso).getTime();
    if (isNaN(d)) return "—";
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return "à l'instant";
    const m = Math.floor(s / 60);
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h} h`;
    const days = Math.floor(h / 24);
    if (days < 30) return `il y a ${days} j`;
    return formatDate(iso);
}

export function formatNumber(n: number): string {
    return new Intl.NumberFormat("fr-FR").format(n);
}
