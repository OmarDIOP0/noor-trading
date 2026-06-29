import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicProjects } from "../hooks/usePublicData";
import { useReducedMotion } from "../hooks/useUiHooks";
import { assetUrl } from "@/lib/utils";

const INTERVAL = 4200;

/** Heuristique : une catégorie « déco » vs le reste (génie civil / chantier). */
function isDeco(category: string): boolean {
    return /d[eé]co|int[eé]rieur|am[eé]nag|mobilier|design/i.test(category || "");
}

/**
 * Hero visuel : diaporama des réalisations (données dynamiques de l'API).
 * Crossfade + léger Ken Burns, légende projet, puces. Remplace l'ancien rendu 3D.
 */
export function HeroShowcase() {
    const { data: projects = [] } = usePublicProjects();
    const reduced = useReducedMotion();

    // Entrelace génie civil ↔ déco (chantier d'abord) pour montrer les DEUX métiers.
    const slides = useMemo(() => {
        const withCover = projects.filter((p) => p.coverImageUrl);
        const civil = withCover.filter((p) => !isDeco(p.category));
        const deco = withCover.filter((p) => isDeco(p.category));
        const mixed: typeof withCover = [];
        for (let k = 0; k < Math.max(civil.length, deco.length); k++) {
            if (civil[k]) mixed.push(civil[k]);
            if (deco[k]) mixed.push(deco[k]);
        }
        return mixed.slice(0, 6);
    }, [projects]);
    const [i, setI] = useState(0);

    useEffect(() => {
        if (reduced || slides.length <= 1) return;
        const t = setInterval(() => setI((v) => (v + 1) % slides.length), INTERVAL);
        return () => clearInterval(t);
    }, [reduced, slides.length]);

    // Fallback : aucune image publiée → bloc matière + repère technique
    if (slides.length === 0) {
        return (
            <div className="cartouche concrete blueprint-grid-fine" style={{ width: "100%", height: "100%", minHeight: 340, display: "grid", placeItems: "center" }}>
                <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, letterSpacing: "0.25em", color: "var(--s-ink-soft)" }}>PORTFOLIO</span>
            </div>
        );
    }

    const cur = slides[i % slides.length];

    return (
        <div className="cartouche" style={{ position: "relative", width: "100%", height: "100%", minHeight: 340, overflow: "hidden", background: "var(--s-concrete)" }}>
            <AnimatePresence>
                <motion.div
                    key={cur.id}
                    className="gpu"
                    style={{ position: "absolute", inset: 0 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ opacity: { duration: 1, ease: "easeInOut" } }}
                >
                    <motion.img
                        src={assetUrl(cur.coverImageUrl)}
                        alt={cur.title}
                        loading={i === 0 ? "eager" : "lazy"}
                        initial={{ scale: reduced ? 1 : 1.1 }}
                        animate={{ scale: reduced ? 1 : 1 }}
                        transition={{ duration: (INTERVAL + 1000) / 1000, ease: "linear" }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* voile bas pour la légende */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,24,20,0.72) 0%, transparent 45%)" }} />

            {/* légende projet */}
            <div className="absolute inset-x-0 bottom-0 p-5">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={cur.id}
                        initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--s-brass)" }}>
                            {isDeco(cur.category) ? "DÉCORATION" : "GÉNIE CIVIL"} · {cur.category}{cur.year ? ` · ${cur.year}` : ""}
                        </span>
                        <h3 style={{ fontFamily: "var(--s-display)", fontSize: "clamp(1.3rem,2.4vw,1.9rem)", fontWeight: 600, color: "var(--s-bg)", lineHeight: 1.1, marginTop: 2 }}>
                            {cur.title}
                        </h3>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* puces de navigation */}
            {slides.length > 1 && (
                <div className="absolute top-4 right-4 flex gap-1.5">
                    {slides.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => setI(idx)}
                            aria-label={`Voir ${s.title}`}
                            style={{
                                width: idx === i % slides.length ? 22 : 8, height: 8, borderRadius: 9999,
                                background: idx === i % slides.length ? "var(--s-clay)" : "rgba(246,242,234,0.6)",
                                border: "none", cursor: "pointer", transition: "width .3s, background .3s",
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
