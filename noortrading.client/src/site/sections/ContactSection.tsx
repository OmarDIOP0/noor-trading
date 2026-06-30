import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Reveal, RevealWords } from "../components/Reveal";
import { MagneticButton } from "../components/MagneticButton";
import { DownloadCardButton } from "../components/DownloadCardButton";
import { useReducedMotion } from "../hooks/useUiHooks";
import { publicApi } from "../services/publicApi";
import type { PublicProfile } from "../types";
import type { CardData } from "@/lib/businessCard";

/** Recharge les données publiques fraîches à chaque génération de carte. */
async function loadCardData(): Promise<CardData> {
    const b = await publicApi.getBundle();
    return {
        fullName: b.profile.fullName, title: b.profile.title, photoUrl: b.profile.photoUrl,
        email: b.profile.email, phone: b.profile.phone, location: b.profile.location,
        website: b.settings.publicUrl, appName: b.settings.appName, logoUrl: b.settings.logoUrl,
    };
}

function waLink(phone?: string | null) {
    if (!phone) return null;
    const clean = phone.replace(/[^\d+]/g, "");
    return `https://wa.me/${clean.replace(/^\+/, "")}`;
}

export function ContactSection({ profile }: { profile?: PublicProfile }) {
    const reduced = useReducedMotion();
    const wa = waLink(profile?.phone);

    const channels = [
        profile?.email && { icon: Mail, label: "E-mail", value: profile.email, href: `mailto:${profile.email}` },
        wa && { icon: MessageCircle, label: "WhatsApp", value: profile?.phone ?? "", href: wa },
        profile?.phone && { icon: Phone, label: "Téléphone", value: profile.phone, href: `tel:${profile.phone}` },
        profile?.location && { icon: MapPin, label: "Localisation", value: profile.location, href: null },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string; href: string | null }[];

    return (
        <section id="contact" className="relative py-28 lg:py-40 overflow-hidden" style={{ background: "var(--s-ink)", color: "var(--s-bg)" }}>
            {/* gradient animé subtil en fond */}
            {!reduced && (
                <motion.div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(60% 50% at 30% 20%, rgba(188,108,60,0.22), transparent), radial-gradient(50% 40% at 80% 90%, rgba(176,141,87,0.18), transparent)" }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            <div className="absolute inset-0 blueprint-grid" style={{ opacity: 0.08 }} />

            <div className="max-w-[1100px] mx-auto px-5 lg:px-10 relative z-10">
                <span className="kicker" style={{ color: "var(--s-brass)" }}>05 — Contact</span>
                <h2 className="display-xl mt-4" style={{ color: "var(--s-bg)", maxWidth: 900 }}>
                    <RevealWords text="Parlons de" /> <span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="votre projet." /></span>
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mt-14">
                    {channels.map((c, i) => {
                        const inner = (
                            <div className="flex items-center gap-4 w-full">
                                <span style={{ width: 50, height: 50, display: "grid", placeItems: "center", background: "rgba(237,232,223,0.07)", flexShrink: 0 }}>
                                    <c.icon size={22} style={{ color: "var(--s-brass)" }} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(237,232,223,0.5)" }}>{c.label}</div>
                                    <div className="truncate" style={{ fontFamily: "var(--s-display)", fontSize: 20, fontWeight: 600 }}>{c.value}</div>
                                </div>
                                {c.href && <ArrowUpRight size={22} style={{ color: "var(--s-brass)", flexShrink: 0 }} />}
                            </div>
                        );
                        return (
                            <Reveal key={i} direction="up" delay={i * 0.05}>
                                {c.href ? (
                                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                                        className="block p-5 cartouche" style={{ background: "rgba(237,232,223,0.04)", transition: "background .3s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,232,223,0.09)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(237,232,223,0.04)")}>
                                        {inner}
                                    </a>
                                ) : (
                                    <div className="block p-5 cartouche" style={{ background: "rgba(237,232,223,0.04)" }}>{inner}</div>
                                )}
                            </Reveal>
                        );
                    })}
                </div>

                <div className="mt-14 flex flex-wrap justify-center items-center gap-4">
                    {profile?.email && (
                        <MagneticButton as="a" href={`mailto:${profile.email}`} className="btn" >
                            <span style={{ background: "var(--s-clay)", color: "var(--s-surface)", padding: "1rem 2rem", display: "inline-flex", alignItems: "center", gap: ".6rem", fontWeight: 700 }}>
                                <Mail size={18} /> Démarrer une collaboration
                            </span>
                        </MagneticButton>
                    )}
                    <DownloadCardButton
                        loader={loadCardData}
                        className="btn"
                        style={{ background: "transparent", color: "var(--s-bg)", boxShadow: "inset 0 0 0 1.5px rgba(237,232,223,0.45)", padding: "1rem 1.6rem" }}
                        label="Enregistrer sa carte de visite"
                    />
                </div>
                <p style={{ textAlign: "center", marginTop: 12, fontFamily: "var(--s-mono)", fontSize: 11.5, color: "rgba(237,232,223,0.5)" }}>
                    PDF ou JPG · QR « vCard » pour l'ajouter à vos contacts
                </p>
            </div>
        </section>
    );
}
