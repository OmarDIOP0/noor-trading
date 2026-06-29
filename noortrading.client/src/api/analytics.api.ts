import api from "./client";
import type { ApiResponse, AnalyticsStats, StatsRange } from "@/types";

export const analyticsApi = {
    getStats: (range: StatsRange = "30d") =>
        api.get<ApiResponse<AnalyticsStats>>("/api/analytics/stats", { params: { range } })
            .then((r) => r.data.data!),

    /** Appelé par la page PUBLIQUE (pas l'admin). Best-effort, n'échoue jamais bruyamment. */
    trackVisit: (page: string, source?: string, targetType?: string, targetId?: string) =>
        api.post("/api/analytics/visit", { page, source, targetType, targetId })
            .catch(() => { /* silencieux : ne pas perturber la navigation */ }),
};
