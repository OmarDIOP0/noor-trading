import api from "./client";
import type { ApiResponse, Service, ServiceInput } from "@/types";

export const servicesApi = {
    getAll: () =>
        api.get<ApiResponse<Service[]>>("/api/services").then((r) => r.data.data ?? []),

    create: (body: ServiceInput) =>
        api.post<ApiResponse<Service>>("/api/services", body).then((r) => r.data.data!),

    update: (id: string, body: ServiceInput) =>
        api.put<ApiResponse<Service>>(`/api/services/${id}`, body).then((r) => r.data.data!),

    remove: (id: string) => api.delete(`/api/services/${id}`).then((r) => r.data),
};
