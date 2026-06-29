import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { UserRound, Plus, Trash2, Link2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile, useUploadProfilePhoto } from "@/hooks/useProfile";
import { useSettings } from "@/hooks/useSettings";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { ShareButton } from "@/components/shared/ShareButton";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AdminPageHeader } from "@/components/admin/ui";
import type { UpdateProfileRequest } from "@/types";

export default function Profil() {
    const { data: profile, isLoading } = useProfile();
    const { data: settings } = useSettings();
    const update = useUpdateProfile();
    const uploadPhoto = useUploadProfilePhoto();

    const { register, control, handleSubmit, reset, formState: { errors, isDirty } } =
        useForm<UpdateProfileRequest>({ defaultValues: { socialLinks: [] } });
    const { fields, append, remove } = useFieldArray({ control, name: "socialLinks" });

    useEffect(() => {
        if (profile) {
            reset({
                fullName: profile.fullName, title: profile.title, bio: profile.bio,
                email: profile.email ?? "", phone: profile.phone ?? "", location: profile.location ?? "",
                socialLinks: profile.socialLinks.map((s) => ({ label: s.label, url: s.url, icon: s.icon, displayOrder: s.displayOrder })),
            });
        }
    }, [profile, reset]);

    async function onSubmit(values: UpdateProfileRequest) {
        try {
            await update.mutateAsync(values);
            toast.success("Profil enregistré.");
        } catch (e) {
            toast.error((e as Error).message);
        }
    }

    if (isLoading) return <LoadingSkeleton variant="page" />;

    const publicUrl = settings?.publicUrl ?? "";

    return (
        <div className="p-6 lg:p-8 max-w-[920px]">
            <AdminPageHeader
                title="Profil" subtitle="Vos informations affichées sur le portfolio public"
                icon={UserRound} iconColor="steel"
                actions={publicUrl ? (
                    <ShareButton share={{
                        url: publicUrl,
                        title: settings?.mainTitle ?? "Portfolio",
                        message: `Découvrez le portfolio de ${profile?.fullName ?? "notre ingénieur"} — ${profile?.title ?? "Génie Civil"}.`,
                    }} />
                ) : undefined}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Photo */}
                <div className="admin-card p-5">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>Photo de profil</h3>
                    <PhotoUploader
                        shape="circle"
                        currentUrl={profile?.photoUrl}
                        label="Changer la photo"
                        onUpload={(file) => uploadPhoto.mutateAsync(file)}
                    />
                </div>

                {/* Identité */}
                <div className="admin-card p-5 space-y-4">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Identité</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label">Nom complet *</label>
                            <input className="input-field" {...register("fullName", { required: "Le nom est requis." })} />
                            {errors.fullName && <p className="err">{errors.fullName.message}</p>}
                        </div>
                        <div>
                            <label className="field-label">Titre / poste *</label>
                            <input className="input-field" placeholder="Ingénieur Génie Civil" {...register("title", { required: "Le titre est requis." })} />
                            {errors.title && <p className="err">{errors.title.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Bio / présentation</label>
                        <textarea className="input-field" rows={5} placeholder="Quelques lignes sur votre parcours, vos spécialités…" {...register("bio")} />
                    </div>
                </div>

                {/* Coordonnées */}
                <div className="admin-card p-5 space-y-4">
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Coordonnées</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="field-label">E-mail</label>
                            <input type="email" className="input-field" {...register("email")} />
                        </div>
                        <div>
                            <label className="field-label">Téléphone</label>
                            <input className="input-field" {...register("phone")} />
                        </div>
                        <div>
                            <label className="field-label">Localisation</label>
                            <input className="input-field" placeholder="Ville, Pays" {...register("location")} />
                        </div>
                    </div>
                </div>

                {/* Réseaux / liens */}
                <div className="admin-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Réseaux & liens</h3>
                        <button type="button" className="admin-btn-outline" style={{ height: 38 }}
                            onClick={() => append({ label: "", url: "", icon: "Link2", displayOrder: fields.length })}>
                            <Plus size={16} /> Ajouter
                        </button>
                    </div>
                    {fields.length === 0 && <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Aucun lien. (optionnel)</p>}
                    {fields.map((field, i) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Link2 size={16} style={{ color: "var(--ink-faint)", flexShrink: 0 }} />
                            <input className="input-field" style={{ maxWidth: 180 }} placeholder="LinkedIn" {...register(`socialLinks.${i}.label` as const, { required: true })} />
                            <input className="input-field" placeholder="https://…" {...register(`socialLinks.${i}.url` as const, { required: true })} />
                            <button type="button" className="admin-btn-ghost" style={{ color: "var(--danger)", height: 40, width: 40, padding: 0 }} onClick={() => remove(i)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-2 sticky bottom-4">
                    <button type="submit" className="admin-btn-primary" disabled={update.isPending || !isDirty}>
                        {update.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> Enregistrer</>}
                    </button>
                </div>
            </form>

            <style>{`.err{font-size:12.5px;color:var(--danger);margin-top:5px;}`}</style>
        </div>
    );
}
