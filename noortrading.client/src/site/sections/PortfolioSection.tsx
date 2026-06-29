import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Calendar, Ruler, User2, Tag, type LucideIcon } from "lucide-react";
import { RevealWords } from "../components/Reveal";
import { BeforeAfter } from "../components/BeforeAfter";
import { usePublicProjects } from "../hooks/usePublicData";
import { useReducedMotion } from "../hooks/useUiHooks";
import { assetUrl } from "@/lib/utils";
import type { PublicProject } from "../types";

const ALL = "Toutes";

export function PortfolioSection() {
    const { data: projects = [], isLoading } = usePublicProjects();
    const [filter, setFilter] = useState(ALL);
    const [active, setActive] = useState<PublicProject | null>(null);
    const reduced = useReducedMotion();

    const categories = useMemo(() => {
        const set = new Set(projects.map((p) => p.category).filter(Boolean));
        return [ALL, ...Array.from(set)];
    }, [projects]);

    const shown = filter === ALL ? projects : projects.filter((p) => p.category === filter);

    useEffect(() => {
        if (!active) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [active]);

    return (
        <section id="realisations" className="relative py-28 lg:py-36 blueprint-grid-fine" style={{ background: "var(--s-bg-2)" }}>
            <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
                <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="plan-index">04 — RÉALISATIONS</span>
                        <h2 className="display-lg mt-3"><RevealWords text="Projets" /> <span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="livrés." /></span></h2>
                    </div>
                    {/* filtres */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button key={c} onClick={() => setFilter(c)}
                                className="relative px-4 py-2"
                                style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--s-mono)", letterSpacing: "0.04em", color: filter === c ? "var(--s-surface)" : "var(--s-ink-soft)", zIndex: 1 }}>
                                {filter === c && <motion.span layoutId="cat-pill" transition={{ type: "spring", stiffness: 320, damping: 30 }} style={{ position: "absolute", inset: 0, background: "var(--s-ink)", zIndex: -1 }} />}
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ aspectRatio: "4/5", background: "var(--s-concrete)" }} />)}
                    </div>
                ) : (
                    <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {shown.map((p) => (
                                <motion.button
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => setActive(p)}
                                    className="group relative text-left overflow-hidden cartouche"
                                    style={{ aspectRatio: "4/5", background: "var(--s-concrete)", cursor: "pointer" }}
                                >
                                    <motion.div layoutId={`cover-${p.id}`} style={{ position: "absolute", inset: 0 }}>
                                        {p.coverImageUrl ? (
                                            <img src={assetUrl(p.coverImageUrl)} alt={p.title} loading="lazy"
                                                className="w-full h-full" style={{ objectFit: "cover", transition: "transform .7s cubic-bezier(.16,1,.3,1), filter .5s", filter: "grayscale(0.25)" }} />
                                        ) : <div className="concrete w-full h-full" />}
                                    </motion.div>
                                    {/* voile bas */}
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,24,20,0.78) 0%, transparent 55%)" }} />
                                    <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                                        <span style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--s-brass)" }}>
                                            {p.category}{p.year ? ` · ${p.year}` : ""}
                                        </span>
                                        <h3 style={{ fontFamily: "var(--s-display)", fontSize: 22, fontWeight: 600, color: "var(--s-bg)", lineHeight: 1.1, marginTop: 2 }}>{p.title}</h3>
                                    </div>
                                    <span className="absolute top-4 right-4 z-10 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ width: 38, height: 38, background: "var(--s-surface)" }}>
                                        <Maximize2 size={17} style={{ color: "var(--s-ink)" }} />
                                    </span>
                                    <style>{`.group:hover img{transform:scale(1.06);filter:grayscale(0)!important;}`}</style>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {shown.length === 0 && !isLoading && (
                    <p className="lead text-center py-16">Aucune réalisation pour cette catégorie.</p>
                )}
            </div>

            {/* Détail — shared element */}
            <AnimatePresence>
                {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
            </AnimatePresence>
        </section>
    );
}

function ProjectModal({ project, onClose }: { project: PublicProject; onClose: () => void }) {
    const facts = [
        project.year && { icon: Calendar, label: "Année", value: String(project.year) },
        project.surface && { icon: Ruler, label: "Surface", value: project.surface },
        project.category && { icon: Tag, label: "Catégorie", value: project.category },
        project.client && { icon: User2, label: "Client", value: project.client },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string }[];

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 lg:p-10"
            style={{ background: "rgba(28,24,20,0.6)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="relative w-full cartouche"
                style={{ maxWidth: 1000, background: "var(--s-surface)" }}
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 z-20 grid place-items-center" style={{ width: 42, height: 42, background: "var(--s-ink)", color: "var(--s-surface)" }} aria-label="Fermer">
                    <X size={20} />
                </button>

                <motion.div layoutId={`cover-${project.id}`} style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", background: "var(--s-concrete)" }}>
                    {project.coverImageUrl && <img src={assetUrl(project.coverImageUrl)} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </motion.div>

                <div className="p-7 lg:p-10">
                    <span className="kicker mb-3">{project.category}</span>
                    <h2 className="display-md" style={{ marginBottom: 18 }}>{project.title}</h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8 pb-8" style={{ borderBottom: "1px solid var(--s-line)" }}>
                        {facts.map((f) => (
                            <div key={f.label}>
                                <div className="flex items-center gap-1.5" style={{ fontFamily: "var(--s-mono)", fontSize: 10.5, letterSpacing: "0.1em", color: "var(--s-ink-faint)", textTransform: "uppercase", marginBottom: 5 }}>
                                    <f.icon size={12} /> {f.label}
                                </div>
                                <div style={{ fontFamily: "var(--s-display)", fontSize: 18, fontWeight: 600 }}>{f.value}</div>
                            </div>
                        ))}
                    </div>

                    <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--s-ink-soft)", whiteSpace: "pre-line", maxWidth: 680 }}>{project.description}</p>

                    {(() => {
                        const avant = project.images.filter((i) => i.phase === "Avant");
                        const apres = project.images.filter((i) => i.phase === "Apres");
                        const hasComparison = avant.length > 0 && apres.length > 0;
                        const gallery = hasComparison ? apres : project.images;
                        return (
                            <>
                                {hasComparison && (
                                    <div className="mt-10">
                                        <span className="kicker mb-3">La transformation</span>
                                        <div className="mt-3"><BeforeAfter beforeUrl={avant[0].url} afterUrl={apres[0].url} /></div>
                                    </div>
                                )}
                                {gallery.length > 0 && (
                                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                                        {gallery.map((img) => (
                                            <div key={img.id} style={{ overflow: "hidden", background: "var(--s-concrete)" }}>
                                                <img src={assetUrl(img.url)} alt="" loading="lazy" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </motion.div>
        </motion.div>
    );
}
