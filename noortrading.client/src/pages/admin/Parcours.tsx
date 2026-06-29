import { useState } from "react";
import { useForm } from "react-hook-form";
import { Route, Plus, Pencil, Trash2, Loader2, GraduationCap, Briefcase, Award, Trophy, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useTimeline, useCreateTimelineEntry, useUpdateTimelineEntry, useDeleteTimelineEntry } from "@/hooks/useTimeline";
import { AdminPageHeader, AdminModal, AdminBadge, AdminIcon, AdminConfirmDialog } from "@/components/admin/ui";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import type { TimelineEntry, TimelineEntryInput, TimelineType } from "@/types";

const TYPE_META: Record<TimelineType, { label: string; icon: LucideIcon }> = {
    Experience: { label: "Expérience", icon: Briefcase },
    Education: { label: "Formation", icon: GraduationCap },
    Certification: { label: "Certification", icon: Award },
    Achievement: { label: "Distinction", icon: Trophy },
};

export default function Parcours() {
    const { data: entries, isLoading } = useTimeline();
    const create = useCreateTimelineEntry();
    const update = useUpdateTimelineEntry();
    const remove = useDeleteTimelineEntry();

    const [editing, setEditing] = useState<TimelineEntry | null | undefined>(undefined);
    const [toDelete, setToDelete] = useState<TimelineEntry | null>(null);
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TimelineEntryInput>();
    const typeValue = watch("type");

    function openNew() {
        reset({ type: "Experience", title: "", organization: "", location: "", period: "", startYear: undefined, isCurrent: false, description: "", displayOrder: (entries?.length ?? 0) + 1 });
        setEditing(null);
    }
    function openEdit(e: TimelineEntry) {
        reset({ type: e.type, title: e.title, organization: e.organization ?? "", location: e.location ?? "", period: e.period, startYear: e.startYear ?? undefined, isCurrent: e.isCurrent, description: e.description ?? "", displayOrder: e.displayOrder });
        setEditing(e);
    }

    async function onSubmit(values: TimelineEntryInput) {
        try {
            const payload = { ...values, startYear: values.startYear ? Number(values.startYear) : null };
            if (editing) await update.mutateAsync({ id: editing.id, body: payload });
            else await create.mutateAsync(payload);
            toast.success(editing ? "Étape mise à jour." : "Étape ajoutée.");
            setEditing(undefined);
        } catch (e) { toast.error((e as Error).message); }
    }

    async function confirmDelete() {
        if (!toDelete) return;
        try { await remove.mutateAsync(toDelete.id); toast.success("Étape supprimée."); setToDelete(null); }
        catch (e) { toast.error((e as Error).message); }
    }

    if (isLoading) return <LoadingSkeleton variant="page" />;
    const saving = create.isPending || update.isPending;

    return (
        <div className="p-6 lg:p-8 max-w-[900px]">
            <AdminPageHeader
                title="Parcours" subtitle="Formation, expériences et certifications (CV public)"
                icon={Route} iconColor="steel"
                actions={<button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouvelle étape</button>}
            />

            {!entries || entries.length === 0 ? (
                <div className="admin-card">
                    <EmptyState icon={Route} title="Parcours vide" description="Ajoutez vos formations, expériences et certifications."
                        action={<button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouvelle étape</button>} />
                </div>
            ) : (
                <div className="relative pl-4">
                    <div className="absolute left-[27px] top-2 bottom-2 w-px" style={{ background: "var(--border)" }} />
                    <div className="space-y-3">
                        {entries.map((e) => {
                            const meta = TYPE_META[e.type];
                            return (
                                <div key={e.id} className="relative flex items-start gap-3.5">
                                    <AdminIcon icon={meta.icon} color={e.type === "Education" ? "steel" : e.type === "Certification" ? "green" : "orange"} size="md" className="relative z-10" />
                                    <div className="admin-card admin-card-hover flex-1 p-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <AdminBadge variant="muted">{meta.label}</AdminBadge>
                                                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}>{e.period}</span>
                                                {e.isCurrent && <AdminBadge variant="success">En cours</AdminBadge>}
                                            </div>
                                            <h3 className="truncate" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{e.title}</h3>
                                            {e.organization && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{e.organization}{e.location ? ` · ${e.location}` : ""}</p>}
                                        </div>
                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                            <button className="admin-btn-ghost" style={{ height: 34, width: 34, padding: 0 }} onClick={() => openEdit(e)}><Pencil size={15} /></button>
                                            <button className="admin-btn-ghost" style={{ height: 34, width: 34, padding: 0, color: "var(--danger)" }} onClick={() => setToDelete(e)}><Trash2 size={15} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <AdminModal
                open={editing !== undefined}
                onClose={() => setEditing(undefined)}
                title={editing ? "Modifier l'étape" : "Nouvelle étape"}
                icon={<AdminIcon icon={typeValue ? TYPE_META[typeValue].icon : Route} color="steel" size="md" />}
                maxWidth={600}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Type</label>
                            <select className="input-field" {...register("type")}>
                                <option value="Experience">Expérience</option>
                                <option value="Education">Formation</option>
                                <option value="Certification">Certification</option>
                                <option value="Achievement">Distinction</option>
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Période *</label>
                            <input className="input-field" placeholder="2019 — Aujourd'hui" {...register("period", { required: "Requis." })} />
                            {errors.period && <p className="err">{errors.period.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Titre *</label>
                        <input className="input-field" placeholder="Ingénieure structure" {...register("title", { required: "Requis." })} />
                        {errors.title && <p className="err">{errors.title.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Organisation</label>
                            <input className="input-field" placeholder="BET Concept" {...register("organization")} />
                        </div>
                        <div>
                            <label className="field-label">Lieu</label>
                            <input className="input-field" {...register("location")} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Année de début</label>
                            <input type="number" className="input-field" placeholder="2019" {...register("startYear", { valueAsNumber: true })} />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input type="checkbox" {...register("isCurrent")} style={{ width: 18, height: 18, accentColor: "var(--orange)" }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>En cours</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Description</label>
                        <textarea className="input-field" rows={3} {...register("description")} />
                    </div>
                    <div>
                        <label className="field-label">Ordre d'affichage</label>
                        <input type="number" className="input-field" style={{ maxWidth: 120 }} {...register("displayOrder", { valueAsNumber: true })} />
                    </div>
                </form>
            </AdminModal>

            <AdminConfirmDialog
                open={!!toDelete}
                title="Supprimer l'étape"
                message={`Supprimer « ${toDelete?.title} » du parcours ?`}
                loading={remove.isPending}
                onConfirm={confirmDelete}
                onClose={() => setToDelete(null)}
            />
            <style>{`.err{font-size:12.5px;color:var(--danger);margin-top:5px;}`}</style>
        </div>
    );
}
