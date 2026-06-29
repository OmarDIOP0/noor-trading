import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { HardHat, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/hooks/useAuth";

interface FormValues { email: string; password: string; }

export default function Login() {
    const navigate = useNavigate();
    const login = useLogin();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

    async function onSubmit(values: FormValues) {
        setError(null);
        try {
            await login.mutateAsync(values);
            toast.success("Connexion réussie.");
            navigate("/admin", { replace: true });
        } catch (e) {
            setError((e as Error).message);
        }
    }

    return (
        <div className="admin-scope admin-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full" style={{ maxWidth: 420 }}>
                {/* Marque */}
                <div className="flex flex-col items-center mb-7">
                    <div style={{ width: 56, height: 56, borderRadius: 15, background: "linear-gradient(135deg,#EA5B0C,#F7873E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(234,91,12,0.45), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
                        <HardHat size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginTop: 14 }}>NoorTrading</h1>
                    <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Espace d'administration · Génie Civil</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="admin-card p-6 space-y-4">
                    <div>
                        <label className="field-label">Adresse e-mail</label>
                        <div className="relative">
                            <Mail size={17} style={{ position: "absolute", left: 12, top: 14, color: "var(--ink-faint)" }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: 38 }}
                                placeholder="admin@noortrading.local"
                                {...register("email", { required: "L'e-mail est requis." })}
                            />
                        </div>
                        {errors.email && <p style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 5 }}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="field-label">Mot de passe</label>
                        <div className="relative">
                            <Lock size={17} style={{ position: "absolute", left: 12, top: 14, color: "var(--ink-faint)" }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: 38 }}
                                placeholder="••••••••"
                                {...register("password", { required: "Le mot de passe est requis." })}
                            />
                        </div>
                        {errors.password && <p style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 5 }}>{errors.password.message}</p>}
                    </div>

                    {error && (
                        <div className="rounded-xl px-3.5 py-2.5" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                            <p style={{ fontSize: 13, color: "var(--danger)", fontWeight: 500 }}>{error}</p>
                        </div>
                    )}

                    <button type="submit" className="admin-btn-primary w-full" disabled={login.isPending}>
                        {login.isPending ? <Loader2 size={18} className="animate-spin" /> : "Se connecter"}
                    </button>
                </form>
            </div>
        </div>
    );
}
