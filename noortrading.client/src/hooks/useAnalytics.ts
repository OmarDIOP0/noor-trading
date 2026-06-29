import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics.api";
import type { StatsRange } from "@/types";

export function useAnalyticsStats(range: StatsRange = "30d") {
    return useQuery({
        queryKey: ["analytics", range],
        queryFn: () => analyticsApi.getStats(range),
        staleTime: 30_000,
    });
}
