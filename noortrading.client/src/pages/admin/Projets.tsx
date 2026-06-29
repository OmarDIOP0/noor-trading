import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Building2, Plus, Pencil, Trash2, Loader2, ImagePlus, Star, X,
    Calendar, Ruler, User2,
} from "lucide-react";
import { toast } from "sonner";
import {
    useProjects, useCreateProject, useUpdateProject, useDeleteProject,
    useAddProjectImage, useDeleteProjectImage, useSetProjectCover,
} from "@/hooks/useProjects";
import { useSettings } from "@/hooks/useSettings";
import { AdminPageHeader, AdminModal, AdminBadge, AdminIcon, AdminConfirmDialog } from "@/components/admin/ui";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShareButton } from "@/components/shared/ShareButton";
import { assetUrl } from "@/lib/utils";
import type { Project, ProjectInput, ProjectStatus, ProjectImage, ImagePhase } from "@/types";

const CATEGORIES = ["VRD", "Bâtiment", "Études de sol", "Supervision", "Ouvrages d'art", "Hydraulique", "Topographie"];

export default function Projets() {
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
    const { data, isLoading } = useProjects({ status: statusFilter || undefined, pageSize: 100 });
    const { data: settings } = useSettings();
    const create = useCreateProject();
    const update = useUpdateProject();
    const remove = useDeleteProject();
    const addImage = useAddProjectImage();
    const delImage = useDeleteProjectImage();
    const setCover = useSetProjectCover();

    const items = data?.items ?? [];
    const [editingId, setEditingId] = useState<string | null | undefined>(undefined); // undefined=closed, null=new
    const [toDelete, setToDelete] = useState<Project | null>(null);

    const current = editingId ? items.find((p) => p.id === editingId) : undefined;
    const publicUrl = settings?.publicUrl ?? "";

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectInput>();

    function openNew() {
        reset({ title: "", description: "", category: "", year: undefined, surface: "", client: "", status: "Draft", displayOrder: items.length + 1 });
        setEditingId(null);
    }
    function openEdit(p: Project) {
        reset({ title: p.title, description: p.description, category: p.category, year: p.year ?? undefined, surface: p.surface ?? "", client: p.client ?? "", status: p.status, displayOrder: p.displayOrder });
        setEditingId(p.id);
    }

    // garde le formulaire synchronisé si l'objet projet courant change (après upload image)
    useEffect(() => {
        if (current) reset({ title: current.title, description: current.description, category: current.category, year: current.year ?? undefined, surface: current.surface ?? "", client: current.client ?? "", status: current.status, displayOrder: current.displayOrder });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current?.id]);

    async function onSubmit(values: ProjectInput) {
        try {
            const payload = { ...values, year: values.year ? Number(values.year) : null };
            if (editingId) {
                await update.mutateAsync({ id: editingId, body: payload });
                toast.success("Réalisation mise à jour.");
                setEditingId(undefined);
            } else {
                const created = await create.mutateAsync(payload);
                toast.success("Réalisation créée. Ajoutez maintenant des photos.");
                setEditingId(created.id); // bascule en édition pour gérer les images
            }
        } catch (e) {
            toast.error((e as Error).message);
        }
    }

    async function onAddImage(file: File, phase: ImagePhase) {
        if (!current) return;
        try { await addImage.mutateAsync({ id: current.id, file, phase }); }
        catch (e) { toast.error((e as Error).message); }
    }

    async function confirmDelete() {
        if (!toDelete) return;
        try { await remove.mutateAsync(toDelete.id); toast.success("Réalisation supprimée."); setToDelete(null); }
        catch (e) { toast.error((e as Error).message); }
    }

    if (isLoading) return <LoadingSkeleton variant="page" />;
    const saving = create.isPending || update.isPending;

    return (
        <div className="p-6 lg:p-8 max-w-[1300px]">
            <AdminPageHeader
                title="Réalisations" subtitle="Vos projets et chantiers présentés au public"
                icon={Building2} iconColor="orange"
                actions={
                    <>
                        <select className="input-field" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "")}>
                            <option value="">Tous les statuts</option>
                            <option value="Published">Publiés</option>
                            <option value="Draft">Brouillons</option>
                        </select>
                        <button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouvelle réalisation</button>
                    </>
                }
            />

            {items.length === 0 ? (
                <div className="admin-card">
                    <EmptyState icon={Building2} title="Aucune réalisation" description="Présentez vos chantiers : titre, catégorie, photos, surface…"
                        action={<button className="admin-btn-primary" onClick={openNew}><Plus size={16} /> Nouvelle réalisation</button>} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((p) => (
                        <div key={p.id} className="admin-card admin-card-hover overflow-hidden flex flex-col">
                            <div style={{ height: 168, background: "rgba(20,32,43,0.05)", position: "relative" }}>
                                {p.coverImageUrl ? (
                                    <img src={assetUrl(p.coverImageUrl)} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Building2 size={30} style={{ color: "var(--ink-faint)" }} /></div>
                                )}
                                <div style={{ position: "absolute", top: 10, left: 10 }}>
                                    {p.status === "Published" ? <AdminBadge variant="success">Publié</AdminBadge> : <AdminBadge variant="warning">Brouillon</AdminBadge>}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <AdminBadge variant="info">{p.category || "Non classé"}</AdminBadge>
                                    {p.year && <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{p.year}</span>}
                                </div>
                                <h3 className="truncate" style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{p.title}</h3>
                                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                                <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                                    <button className="admin-btn-ghost" style={{ height: 36 }} onClick={() => openEdit(p)}><Pencil size={15} /> Modifier</button>
                                    <div className="flex-1" />
                                    {publicUrl && (
                                        <ShareButton variant="icon" share={{
                                            url: `${publicUrl}/projets/${p.id}`,
                                            title: p.title,
                                            message: `Découvrez la réalisation « ${p.title} » (${p.category}).`,
                                        }} />
                                    )}
                                    <button className="admin-btn-ghost" style={{ height: 36, width: 36, padding: 0, color: "var(--danger)" }} onClick={() => setToDelete(p)} aria-label="Supprimer"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal create/edit */}
            <AdminModal
                open={editingId !== undefined}
                onClose={() => setEditingId(undefined)}
                title={editingId ? "Modifier la réalisation" : "Nouvelle réalisation"}
                icon={<AdminIcon icon={Building2} color="orange" size="md" />}
                maxWidth={720}
                footer={
                    <>
                        <button className="admin-btn-outline" onClick={() => setEditingId(undefined)} disabled={saving}>Fermer</button>
                        <button className="admin-btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : "Enregistrer"}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="field-label">Titre *</label>
                        <input className="input-field" {...register("title", { required: "Le titre est requis." })} />
                        {errors.title && <p className="err">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Description</label>
                        <textarea className="input-field" rows={4} {...register("description")} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Catégorie *</label>
                            <input className="input-field" list="cats" placeholder="VRD, Bâtiment…" {...register("category", { required: "La catégorie est requise." })} />
                            <datalist id="cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
                            {errors.category && <p className="err">{errors.category.message}</p>}
                        </div>
                        <div>
                            <label className="field-label">Statut</label>
                            <select className="input-field" {...register("status")}>
                                <option value="Draft">Brouillon</option>
                                <option value="Published">Publié</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="field-label"><Calendar size={13} className="inline mr-1" />Année</label>
                            <input type="number" className="input-field" placeholder="2024" {...register("year", { valueAsNumber: true })} />
                        </div>
                        <div>
                            <label className="field-label"><Ruler size={13} className="inline mr-1" />Surface</label>
                            <input className="input-field" placeholder="1 200 m²" {...register("surface")} />
                        </div>
                        <div>
                            <label className="field-label"><User2 size={13} className="inline mr-1" />Client</label>
                            <input className="input-field" {...register("client")} />
                        </div>
                    </div>

                    {/* Galerie — Avant / Après */}
                    <div>
                        <label className="field-label">Photos {!editingId && "(disponible après création)"}</label>
                        {editingId && current ? (
                            <div className="space-y-5">
                                <PhaseZone
                                    label="Photos avant travaux" hint="optionnel" accent="var(--steel)" allowCover={false}
                                    images={current.images.filter((i) => i.phase === "Avant")}
                                    adding={addImage.isPending}
                                    onAdd={(f) => onAddImage(f, "Avant")}
                                    onDelete={(imageId) => delImage.mutate({ id: current.id, imageId })}
                                    onSetCover={() => {}}
                                />
                                <PhaseZone
                                    label="Photos après travaux" hint="" accent="var(--orange)" allowCover
                                    images={current.images.filter((i) => i.phase === "Apres")}
                                    adding={addImage.isPending}
                                    onAdd={(f) => onAddImage(f, "Apres")}
                                    onDelete={(imageId) => delImage.mutate({ id: current.id, imageId })}
                                    onSetCover={(imageId) => setCover.mutate({ id: current.id, imageId })}
                                />
                            </div>
                        ) : (
                            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Enregistrez d'abord la réalisation pour téléverser des photos.</p>
                        )}
                    </div>
                </form>
            </AdminModal>

            <AdminConfirmDialog
                open={!!toDelete}
                title="Supprimer la réalisation"
                message={`Supprimer « ${toDelete?.title} » et toutes ses photos ? Action irréversible.`}
                loading={remove.isPending}
                onConfirm={confirmDelete}
                onClose={() => setToDelete(null)}
            />
            <style>{`.err{font-size:12.5px;color:var(--danger);margin-top:5px;}`}</style>
        </div>
    );
}

// ── Zone d'upload par phase (Avant / Après) ──────────────────────────────────
function PhaseZone({ label, hint, accent, allowCover, images, adding, onAdd, onDelete, onSetCover }: {
    label: string; hint?: string; accent: string; allowCover: boolean;
    images: ProjectImage[]; adding: boolean;
    onAdd: (file: File) => void; onDelete: (imageId: string) => void; onSetCover: (imageId: string) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="rounded-xl p-3.5" style={{ background: "var(--hover)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
                <span style={{ width: 8, height: 8, borderRadius: 2, background: accent }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{label}</span>
                {hint && <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>· {hint}</span>}
                <span className="flex-1" />
                <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{images.length} photo{images.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden admin-card" style={{ aspectRatio: "1", padding: 0 }}>
                        <img src={assetUrl(img.url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {allowCover && img.isCover && <span className="admin-badge admin-badge-success" style={{ position: "absolute", top: 6, left: 6 }}><Star size={11} /> Couv.</span>}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(20,32,43,0.5)" }}>
                            {allowCover && !img.isCover && (
                                <button type="button" title="Définir comme couverture" onClick={() => onSetCover(img.id)}
                                    className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#fff" }}>
                                    <Star size={15} style={{ color: "var(--orange)" }} />
                                </button>
                            )}
                            <button type="button" title="Supprimer" onClick={() => onDelete(img.id)}
                                className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#fff" }}>
                                <X size={16} style={{ color: "var(--danger)" }} />
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => ref.current?.click()} disabled={adding}
                    className="flex flex-col items-center justify-center gap-1 rounded-xl admin-card cursor-pointer" style={{ aspectRatio: "1", borderStyle: "dashed" }}>
                    {adding ? <Loader2 size={20} className="animate-spin" style={{ color: "var(--orange)" }} /> : <ImagePlus size={20} style={{ color: "var(--ink-faint)" }} />}
                    <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ajouter</span>
                </button>
                <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }} />
            </div>
        </div>
    );
}
