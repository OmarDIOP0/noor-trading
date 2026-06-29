import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Settings, Save, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSettings, useUpdateSettings, useUploadLogo } from "@/hooks/useSettings";
import { useChangePassword } from "@/hooks/useAuth";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { QrCodePanel } from "@/components/shared/QrCodePanel";
import { ShareButton } from "@/components/shared/ShareButton";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AdminPageHeader, AdminIcon } from "@/components/admin/ui";
import type { UpdateSettingsRequest, ChangePasswordRequest } from "@/types";

export default function Parametres() {
    const { data: settings, isLoading } = useSettings();
    const update = useUpdateSettings();
    const uploadLogo = useUploadLogo();
    const changePassword = useChangePassword();

    const settingsForm = useForm<UpdateSettingsRequest>();
    const pwForm = useForm<ChangePasswordRequest>();

    useEffect(() => {
        if (settings) settingsForm.reset({
            appName: settings.appName, mainTitle: settings.mainTitle,
            adminEmail: settings.adminEmail ?? "", publicUrl: settings.publicUrl,
        });
    }, [settings, settingsForm]);

    async function saveSettings(values: UpdateSettingsRequest) {
        try { await update.mutateAsync(values); toast.success("Paramètres enregistrés."); }
        catch (e) { toast.error((e as Error).message); }
    }

    async function submitPassword(values: ChangePasswordRequest) {
        try {
            await changePassword.mutateAsync(values);
            toast.success("Mot de passe modifié.");
            pwForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e) { toast.error((e as Error).message); }
    }

    if (isLoading) return <LoadingSkeleton variant="page" />;

    const publicUrl = settings?.publicUrl ?? "";
    const newPwd = pwForm.watch("newPassword");

    return (
        <div className="p-6 lg:p-8 max-w-[1000px] space-y-5">
            <AdminPageHeader
                title="Paramètres" subtitle="Configuration générale du portfolio"
                icon={Settings} iconColor="slate"
                actions={publicUrl ? (
                    <ShareButton share={{
                        url: publicUrl,
                        title: settings?.appName ?? "Portfolio",
                        message: settings?.mainTitle || "Découvrez notre portfolio Génie Civil & BTP.",
                    }} />
                ) : undefined}
            />

            {/* Général */}
            <form onSubmit={settingsForm.handleSubmit(saveSettings)} className="admin-card p-5 space-y-4">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>Application</h3>

                <div>
                    <label className="field-label">Logo de l'application</label>
                    <PhotoUploader currentUrl={settings?.logoUrl} label="Changer le logo" onUpload={(file) => uploadLogo.mutateAsync(file)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="field-label">Nom de l'application *</label>
                        <input className="input-field" {...settingsForm.register("appName", { required: "Requis." })} />
                        {settingsForm.formState.errors.appName && <p className="err">{settingsForm.formState.errors.appName.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">E-mail administrateur</label>
                        <input type="email" className="input-field" {...settingsForm.register("adminEmail")} />
                    </div>
                </div>
                <div>
                    <label className="field-label">Titre principal (page publique) *</label>
                    <input className="input-field" placeholder="Génie Civil & BTP — Portfolio" {...settingsForm.register("mainTitle", { required: "Requis." })} />
                    {settingsForm.formState.errors.mainTitle && <p className="err">{settingsForm.formState.errors.mainTitle.message}</p>}
                </div>
                <div>
                    <label className="field-label">URL publique *</label>
                    <input className="input-field" placeholder="https://mon-portfolio.com" {...settingsForm.register("publicUrl", { required: "Requis." })} />
                    <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 5 }}>Utilisée pour le QR code et le partage.</p>
                    {settingsForm.formState.errors.publicUrl && <p className="err">{settingsForm.formState.errors.publicUrl.message}</p>}
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="admin-btn-primary" disabled={update.isPending}>
                        {update.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> Enregistrer</>}
                    </button>
                </div>
            </form>

            {/* QR code */}
            <QrCodePanel
                baseUrl={publicUrl}
                logoUrl={settings?.logoUrl}
                appName={settings?.appName ?? "NoorTrading"}
                shareMessage={settings?.mainTitle || "Découvrez notre portfolio Génie Civil & BTP."}
            />

            {/* Mot de passe */}
            <form onSubmit={pwForm.handleSubmit(submitPassword)} className="admin-card p-5 space-y-4">
                <h3 className="flex items-center gap-2.5" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    <AdminIcon icon={ShieldCheck} color="green" size="sm" /> Sécurité — mot de passe
                </h3>
                <div>
                    <label className="field-label">Mot de passe actuel *</label>
                    <input type="password" className="input-field" {...pwForm.register("currentPassword", { required: "Requis." })} />
                    {pwForm.formState.errors.currentPassword && <p className="err">{pwForm.formState.errors.currentPassword.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="field-label">Nouveau mot de passe *</label>
                        <input type="password" className="input-field" {...pwForm.register("newPassword", { required: "Requis.", minLength: { value: 8, message: "8 caractères minimum." } })} />
                        {pwForm.formState.errors.newPassword && <p className="err">{pwForm.formState.errors.newPassword.message}</p>}
                    </div>
                    <div>
                        <label className="field-label">Confirmation *</label>
                        <input type="password" className="input-field" {...pwForm.register("confirmPassword", { required: "Requis.", validate: (v) => v === newPwd || "Les mots de passe ne correspondent pas." })} />
                        {pwForm.formState.errors.confirmPassword && <p className="err">{pwForm.formState.errors.confirmPassword.message}</p>}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="admin-btn-primary" disabled={changePassword.isPending}>
                        {changePassword.isPending ? <Loader2 size={18} className="animate-spin" /> : <><KeyRound size={16} /> Modifier le mot de passe</>}
                    </button>
                </div>
            </form>

            <style>{`.err{font-size:12.5px;color:var(--danger);margin-top:5px;}`}</style>
        </div>
    );
}
