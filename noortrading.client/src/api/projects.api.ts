import api from "./client";
import type { ApiResponse, Paged, Project, ProjectImage, ProjectInput, ProjectsFilter, ImagePhase } from "@/types";

export const projectsApi = {
    getAll: (filter: ProjectsFilter = {}) =>
        api.get<ApiResponse<Paged<Project>>>("/api/projects", { params: filter })
            .then((r) => r.data.data!),

    getById: (id: string) =>
        api.get<ApiResponse<Project>>(`/api/projects/${id}`).then((r) => r.data.data!),

    create: (body: ProjectInput) =>
        api.post<ApiResponse<Project>>("/api/projects", body).then((r) => r.data.data!),

    update: (id: string, body: ProjectInput) =>
        api.put<ApiResponse<Project>>(`/api/projects/${id}`, body).then((r) => r.data.data!),

    remove: (id: string) => api.delete(`/api/projects/${id}`).then((r) => r.data),

    addImage: (id: string, file: File, phase: ImagePhase = "Apres") => {
        const form = new FormData();
        form.append("photo", file);
        form.append("phase", phase);
        return api.post<ApiResponse<ProjectImage>>(`/api/projects/${id}/images`, form, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data.data!);
    },

    deleteImage: (id: string, imageId: string) =>
        api.delete(`/api/projects/${id}/images/${imageId}`).then((r) => r.data),

    setCover: (id: string, imageId: string) =>
        api.put(`/api/projects/${id}/images/${imageId}/cover`).then((r) => r.data),
};
