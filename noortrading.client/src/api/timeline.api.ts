import api from "./client";
import type { ApiResponse, TimelineEntry, TimelineEntryInput } from "@/types";

export const timelineApi = {
    getAll: () =>
        api.get<ApiResponse<TimelineEntry[]>>("/api/timeline").then((r) => r.data.data ?? []),

    create: (body: TimelineEntryInput) =>
        api.post<ApiResponse<TimelineEntry>>("/api/timeline", body).then((r) => r.data.data!),

    update: (id: string, body: TimelineEntryInput) =>
        api.put<ApiResponse<TimelineEntry>>(`/api/timeline/${id}`, body).then((r) => r.data.data!),

    remove: (id: string) => api.delete(`/api/timeline/${id}`).then((r) => r.data),
};
