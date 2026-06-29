import { useState } from "react";
import { useForm } from "react-hook-form";
import { HardHat, Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/useServices";
import { AdminPageHeader, AdminModal, AdminBadge, AdminIcon, AdminConfirmDialog } from "@/components/admin/ui";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SERVICE_ICON_NAMES, getServiceIcon } from "@/lib/serviceIcons";
import type { Service, ServiceInput, ServiceDomain } from "@/types";

const DOMAIN_LABEL: Record<ServiceDomain, string> = {
    GenieCivil: "Génie Civil",
    Decoration: "Décoration",
    Both: "Les deux",
};

export default function Services() {
    const { data: services, isLoading } = useServices();
    const create = useCreateService();
    const update = useUpdateService();
    const remove = useDeleteService();

    const [editing, setEditing] = useState<Service | null | undefined>(undefined); // undefined=closed, null=new
    const [toDelete, setToDelete] = useState<Service | null>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ServiceInput>();
    const iconValue = watch("icon");

    function openNew() {
        reset({ title: "", shortDescription: "", icon: "HardHat", domain: "GenieCivil", displayOrder: (services?.length ?? 0) + 1, isActive: true });
        setEditing(null);
    }
    function openEdit(s: Service) {
        reset({ title: s.title, shortDescription: s.shortDescription, icon: s.icon, domain: s.domain, displayOrder: s.displayOrder, isActive: s.isActive });
        setEditing(s);
    }

    async function onSubmit(values: ServiceInput) {
        try {
            if (editing) await update.mutateAsync({ id: editing.id, body: values });
            else await create.mutateAsync(values);
            toast.success(editing ? "Service mis à jour." : "Service créé.");
            setEditing(undefined);
        } catch (e) {
            toast.error((e as Error).message);
        }
    }

    async function confirmDelete() {
        if (!toDelete) return;
        try {
            await remove.mutateAsync(toDelete.id);
            toast.success("Service supprimé.");
            setToDelete(null);
        } catch (e) {
            toast.error((e as Error).message);
        }
    }

    if (isLoading) return <LoadingSkeleton variant="page" />;

    const saving = create.isPending || update.isPending;

    return (
        <div className="p-6 lg:p-8 max-w-[1100px]">
            <AdminPageHeader
                title="Services" subtitle="Les prestations affichées sur votre portfolio"
                icon={HardHat} iconColor="orange"
                actions={<button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouveau service</button>}
            />

            {!services || services.length === 0 ? (
                <div className="admin-card">
                    <EmptyState icon={HardHat} title="Aucun service" description="Créez votre premier service (VRD, études de sol, supervision…)."
                        action={<button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouveau service</button>} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s) => {
                        const Icon = getServiceIcon(s.icon);
                        return (
                            <div key={s.id} className="admin-card admin-card-hover p-4 flex items-start gap-3.5">
                                <GripVertical size={16} style={{ color: "var(--ink-faint)", marginTop: 14, flexShrink: 0 }} />
                                <AdminIcon icon={Icon} color="orange" size="md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="truncate" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{s.title}</h3>
                                        {s.isActive ? <AdminBadge variant="success">Actif</AdminBadge> : <AdminBadge variant="muted">Masqué</AdminBadge>}
                                        <AdminBadge variant={s.domain === "Decoration" ? "warning" : "info"}>{DOMAIN_LABEL[s.domain]}</AdminBadge>
                                    </div>
                                    <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>{s.shortDescription}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button className="admin-btn-ghost" style={{ height: 36, width: 36, padding: 0 }} onClick={() => openEdit(s)} aria-label="Modifier"><Pencil size={16} /></button>
                                    <button className="admin-btn-ghost" style={{ height: 36, width: 36, padding: 0, color: "var(--danger)" }} onClick={() => setToDelete(s)} aria-label="Supprimer"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal create/edit */}
            <AdminModal
                open={editing !== undefined}
                onClose={() => setEditing(undefined)}
                title={editing ? "Modifier le service" : "Nouveau service"}
                icon={<AdminIcon icon={getServiceIcon(iconValue)} color="orange" size="md" />}
                footer={
                    <>
                        <button className="admin-btn-outline" onClick={() => setEditing(undefined)} disabled={saving}>Annuler</button>
                        <button className="admin-btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : "Enregistrer"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="field-label">Titre *</label>
                        <input className="input-field" placeholder="VRD — Voirie & réseaux divers" {...register("title", { required: "Le titre est requis." })} />
                        {errors.title && <p style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 5 }}>{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Description courte *</label>
                        <textarea className="input-field" rows={3} {...register("shortDescription", { required: "La description est requise." })} />
                        {errors.shortDescription && <p style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 5 }}>{errors.shortDescription.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Icône</label>
                        <div className="flex flex-wrap gap-2">
                            {SERVICE_ICON_NAMES.map((name) => {
                                const Icon = getServiceIcon(name);
                                const active = iconValue === name;
                                return (
                                    <button type="button" key={name} onClick={() => setValue("icon", name)}
                                        className="flex items-center justify-center rounded-xl transition-all"
                                        style={{
                                            width: 42, height: 42,
                                            border: active ? "2px solid var(--orange)" : "1.5px solid var(--border)",
                                            background: active ? "var(--hover)" : "var(--surface)",
                                        }}>
                                        <Icon size={19} style={{ color: active ? "var(--orange)" : "var(--ink-soft)" }} />
                                    </button>
                                );
                            })}
                        </div>
                        <input type="hidden" {...register("icon", { required: true })} />
                    </div>
                    <div>
                        <label className="field-label">Univers</label>
                        <select className="input-field" {...register("domain")}>
                            <option value="GenieCivil">Génie Civil</option>
                            <option value="Decoration">Décoration intérieure</option>
                            <option value="Both">Les deux</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Ordre d'affichage</label>
                            <input type="number" className="input-field" {...register("displayOrder", { valueAsNumber: true })} />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input type="checkbox" {...register("isActive")} style={{ width: 18, height: 18, accentColor: "var(--orange)" }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Visible sur le portfolio</span>
                            </label>
                        </div>
                    </div>
                </form>
            </AdminModal>

            <AdminConfirmDialog
                open={!!toDelete}
                title="Supprimer le service"
                message={`Voulez-vous vraiment supprimer « ${toDelete?.title} » ? Cette action est irréversible.`}
                loading={remove.isPending}
                onConfirm={confirmDelete}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
}
