import api from "@/api/client";
import type { ApiResponse } from "@/types";
import type { PublicBundle, PublicProject } from "../types";

/** Lecture seule de la vitrine (endpoints anonymes /api/public/*). */
export const publicApi = {
    getBundle: () =>
        api.get<ApiResponse<PublicBundle>>("/api/public/bundle").then((r) => r.data.data!),

    getProjects: (category?: string) =>
        api.get<ApiResponse<PublicProject[]>>("/api/public/projects", { params: category ? { category } : {} })
            .then((r) => r.data.data ?? []),

    getProject: (id: string) =>
        api.get<ApiResponse<PublicProject>>(`/api/public/projects/${id}`).then((r) => r.data.data!),

    /** Tracking de visite — best-effort, n'interrompt jamais la navigation. */
    trackVisit: (page: string, source?: string, targetType?: "Home" | "Project" | "Service" | "Other", targetId?: string) =>
        api.post("/api/analytics/visit", {
            page, source: source || "direct", referrer: document.referrer || null,
            targetType: targetType ?? null, targetId: targetId ?? null,
        }).catch(() => { /* silencieux */ }),
};
