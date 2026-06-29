import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Reveal, RevealWords } from "../components/Reveal";
import { useReducedMotion } from "../hooks/useUiHooks";
import { assetUrl } from "@/lib/utils";
import type { PublicProfile } from "../types";

type Lens = "civil" | "deco";

const LENS = {
    civil: { label: "Génie Civil", tag: "Structure · Calcul · Exécution", blurb: "Rigueur technique, maîtrise des structures et conduite de projets sur le terrain." },
    deco: { label: "Décoration d'intérieur", tag: "Espace · Matière · Lumière", blurb: "Sens de l'espace et des matières, pour des intérieurs habités et chaleureux." },
};

export function AboutSection({ profile }: { profile?: PublicProfile }) {
    const [lens, setLens] = useState<Lens>("civil");
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const photoY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [60, -60]);

    return (
        <section id="apropos" ref={ref} className={`relative py-28 lg:py-36 ${lens === "deco" ? "u-deco" : ""}`}>
            <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-14">
                    <div>
                        <span className="plan-index">01 — PROFIL</span>
                        <h2 className="display-lg mt-3"><RevealWords text="Deux disciplines," /><br /><span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="une même exigence." /></span></h2>
                    </div>

                    {/* toggle des deux univers */}
                    <div className="flex items-center gap-1 p-1" style={{ background: "var(--s-surface)", boxShadow: "inset 0 0 0 1px var(--s-line)" }}>
                        {(["civil", "deco"] as Lens[]).map((l) => (
                            <button key={l} onClick={() => setLens(l)}
                                className="relative px-4 py-2"
                                style={{ fontSize: 13.5, fontWeight: 700, fontFamily: "var(--s-sans)", color: lens === l ? "var(--s-surface)" : "var(--s-ink-soft)", zIndex: 1 }}>
                                {lens === l && (
                                    <motion.span layoutId="lens-pill" transition={{ type: "spring", stiffness: 320, damping: 30 }}
                                        style={{ position: "absolute", inset: 0, background: l === "deco" ? "var(--s-brass)" : "var(--s-clay)", zIndex: -1 }} />
                                )}
                                {LENS[l].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-start">
                    {/* photo parallax + cadre cartouche */}
                    <Reveal direction="right">
                        <div className="cartouche relative" style={{ background: "var(--s-concrete)", padding: 12 }}>
                            <div style={{ overflow: "hidden", aspectRatio: "3/4" }}>
                                {profile?.photoUrl ? (
                                    <motion.img src={assetUrl(profile.photoUrl)} alt={profile.fullName}
                                        loading="lazy" style={{ width: "100%", height: "115%", objectFit: "cover", y: photoY }} />
                                ) : (
                                    <div className="concrete w-full h-full" style={{ minHeight: 360 }} />
                                )}
                            </div>
                            <div style={{ position: "absolute", bottom: 18, left: 18, fontFamily: "var(--s-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--s-surface)", mixBlendMode: "difference" }}>
                                {profile?.location?.toUpperCase()}
                            </div>
                        </div>
                    </Reveal>

                    {/* texte */}
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div key={lens}
                                initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -16 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                                <span className="kicker mb-4">{LENS[lens].tag}</span>
                                <p className="display-md" style={{ marginTop: 14, marginBottom: 22, fontWeight: 400, lineHeight: 1.2 }}>
                                    {LENS[lens].blurb}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <Reveal>
                            <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--s-ink-soft)", whiteSpace: "pre-line" }}>
                                {profile?.bio}
                            </p>
                        </Reveal>

                        {/* mini stats / repères */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-8" style={{ borderTop: "1px solid var(--s-line)" }}>
                            {[{ k: "Discipline", v: "Génie Civil" }, { k: "Complément", v: "Décoration" }, { k: "Approche", v: "Sur-mesure" }].map((s) => (
                                <Reveal key={s.k} direction="up">
                                    <div>
                                        <div style={{ fontFamily: "var(--s-mono)", fontSize: 10.5, letterSpacing: "0.15em", color: "var(--s-ink-faint)", textTransform: "uppercase", marginBottom: 6 }}>{s.k}</div>
                                        <div style={{ fontFamily: "var(--s-display)", fontSize: 19, fontWeight: 600 }}>{s.v}</div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
