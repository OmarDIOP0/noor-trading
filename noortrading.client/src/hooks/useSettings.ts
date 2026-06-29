import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/api/settings.api";
import type { UpdateSettingsRequest } from "@/types";

const KEY = ["settings"];

export function useSettings() {
    return useQuery({ queryKey: KEY, queryFn: settingsApi.get, staleTime: 60_000 });
}

export function useUpdateSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateSettingsRequest) => settingsApi.update(body),
        onSuccess: (data) => qc.setQueryData(KEY, data),
    });
}

export function useUploadLogo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => settingsApi.uploadLogo(file),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
