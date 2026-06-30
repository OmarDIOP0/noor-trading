import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../services/publicApi";

// Tolérance au démarrage : en F5, le backend .NET peut ne pas être prêt
// (migrations/seed) quand le site charge → 502 transitoires du proxy Vite.
// On réessaie avec back-off plutôt que d'afficher une erreur.
const STARTUP_RESILIENT = {
    retry: 5,
    retryDelay: (attempt: number) => Math.min(800 * 2 ** attempt, 4000),
    staleTime: 5 * 60_000,
} as const;

export function usePublicBundle() {
    return useQuery({ queryKey: ["public", "bundle"], queryFn: publicApi.getBundle, ...STARTUP_RESILIENT });
}

export function usePublicProjects(category?: string) {
    return useQuery({
        queryKey: ["public", "projects", category ?? "all"],
        queryFn: () => publicApi.getProjects(category),
        ...STARTUP_RESILIENT,
    });
}

export function usePublicProject(id: string | undefined) {
    return useQuery({
        queryKey: ["public", "project", id],
        queryFn: () => publicApi.getProject(id!),
        enabled: !!id,
        ...STARTUP_RESILIENT,
    });
}
