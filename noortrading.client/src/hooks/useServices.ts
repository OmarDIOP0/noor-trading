import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/api/services.api";
import type { ServiceInput } from "@/types";

const KEY = ["services"];

export function useServices() {
    return useQuery({ queryKey: KEY, queryFn: servicesApi.getAll });
}

export function useCreateService() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ServiceInput) => servicesApi.create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useUpdateService() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: ServiceInput }) => servicesApi.update(id, body),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}

export function useDeleteService() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => servicesApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
}
