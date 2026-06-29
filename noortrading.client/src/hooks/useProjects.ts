import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects.api";
import type { ProjectInput, ProjectsFilter, ImagePhase } from "@/types";

const KEY = "projects";

export function useProjects(filter: ProjectsFilter = {}) {
    return useQuery({
        queryKey: [KEY, filter],
        queryFn: () => projectsApi.getAll(filter),
    });
}

export function useProject(id: string | undefined) {
    return useQuery({
        queryKey: [KEY, id],
        queryFn: () => projectsApi.getById(id!),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ProjectInput) => projectsApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useUpdateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: ProjectInput }) => projectsApi.update(id, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => projectsApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useAddProjectImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, file, phase }: { id: string; file: File; phase?: ImagePhase }) => projectsApi.addImage(id, file, phase),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useDeleteProjectImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, imageId }: { id: string; imageId: string }) => projectsApi.deleteImage(id, imageId),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}

export function useSetProjectCover() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, imageId }: { id: string; imageId: string }) => projectsApi.setCover(id, imageId),
        onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
    });
}
