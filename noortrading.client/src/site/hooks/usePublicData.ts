import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../services/publicApi";

export function usePublicBundle() {
    return useQuery({ queryKey: ["public", "bundle"], queryFn: publicApi.getBundle, staleTime: 5 * 60_000 });
}

export function usePublicProjects(category?: string) {
    return useQuery({
        queryKey: ["public", "projects", category ?? "all"],
        queryFn: () => publicApi.getProjects(category),
        staleTime: 5 * 60_000,
    });
}

export function usePublicProject(id: string | undefined) {
    return useQuery({
        queryKey: ["public", "project", id],
        queryFn: () => publicApi.getProject(id!),
        enabled: !!id,
    });
}
