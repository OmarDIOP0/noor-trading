import api from "./client";
import type { ApiResponse, AppSettings, UpdateSettingsRequest } from "@/types";

export const settingsApi = {
    get: () => api.get<ApiResponse<AppSettings>>("/api/settings").then((r) => r.data.data!),

    update: (body: UpdateSettingsRequest) =>
        api.put<ApiResponse<AppSettings>>("/api/settings", body).then((r) => r.data.data!),

    uploadLogo: (file: File) => {
        const form = new FormData();
        form.append("logo", file);
        return api.post<ApiResponse<{ url: string }>>("/api/settings/logo", form, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data.data!.url);
    },
};
