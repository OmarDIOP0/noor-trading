import api from "./client";
import type { ApiResponse, Profile, UpdateProfileRequest } from "@/types";

export const profileApi = {
    get: () => api.get<ApiResponse<Profile>>("/api/profile").then((r) => r.data.data!),

    update: (body: UpdateProfileRequest) =>
        api.put<ApiResponse<Profile>>("/api/profile", body).then((r) => r.data.data!),

    uploadPhoto: (file: File) => {
        const form = new FormData();
        form.append("photo", file);
        return api.post<ApiResponse<{ url: string }>>("/api/profile/photo", form, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data.data!.url);
    },
};
