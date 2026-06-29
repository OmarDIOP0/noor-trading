import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timelineApi } from "@/api/timeline.api";
import type { TimelineEntryInput } from "@/types";

const KEY = ["timeline"];

export function useTimeline() {
    return useQuery({ queryKey: KEY, queryFn: timelineApi.getAll });
}

export function useCreateTimelineEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: TimelineEntryInput) => timelineApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUpdateTimelineEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: TimelineEntryInput }) => timelineApi.update(id, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useDeleteTimelineEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => timelineApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
