import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profile.api";
import type { UpdateProfileRequest } from "@/types";

const KEY = ["profile"];

export function useProfile() {
    return useQuery({ queryKey: KEY, queryFn: profileApi.get });
}

export function useUpdateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateProfileRequest) => profileApi.update(body),
        onSuccess: (data) => qc.setQueryData(KEY, data),
    });
}

export function useUploadProfilePhoto() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file: File) => profileApi.uploadPhoto(file),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
