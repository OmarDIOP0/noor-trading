import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Ruler, User2, Tag, type LucideIcon } from "lucide-react";
import { usePublicProject, usePublicBundle } from "./hooks/usePublicData";
import { publicApi } from "./services/publicApi";
import { Seo } from "./components/Seo";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";
import { BeforeAfter } from "./components/BeforeAfter";
import { assetUrl } from "@/lib/utils";

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: project, isLoading, isError } = usePublicProject(id);
    const { data: bundle } = usePublicBundle();

    // Tracking déclenché seulement quand la réalisation a été chargée (anti-502 au démarrage)
    const tracked = useRef(false);
    useEffect(() => {
        if (!id || !project || tracked.current) return;
        tracked.current = true;
        const source = new URLSearchParams(window.location.search).get("source") || "direct";
        publicApi.trackVisit(`/projets/${id}`, source, "Project", id);
    }, [id, project]);

    useEffect(() => { window.scrollTo(0, 0); }, [id]);

    const facts = project ? [
        project.year && { icon: Calendar, label: "Année", value: String(project.year) },
        project.surface && { icon: Ruler, label: "Surface", value: project.surface },
        project.category && { icon: Tag, label: "Catégorie", value: project.category },
        project.client && { icon: User2, label: "Client", value: project.client },
    ].filter(Boolean) as { icon: LucideIcon; label: string; value: string }[] : [];

    const avant = project?.images.filter((i) => i.phase === "Avant") ?? [];
    const apres = project?.images.filter((i) => i.phase === "Apres") ?? [];
    const hasComparison = avant.length > 0 && apres.length > 0;
    const galleryImages = hasComparison ? apres : (project?.images ?? []);

    return (
        <>
            <SiteNav settings={bundle?.settings} />
            {project && <Seo title={`${project.title} — ${bundle?.settings.appName ?? "Portfolio"}`} description={project.description?.slice(0, 155)} image={project.coverImageUrl ?? undefined} />}

            <main className="pt-[76px] min-h-screen">
                {isLoading && <div className="grid place-items-center py-40" style={{ fontFamily: "var(--s-mono)", letterSpacing: "0.3em", color: "var(--s-ink-soft)" }}>CHARGEMENT…</div>}
                {isError && (
                    <div className="grid place-items-center py-40 text-center px-6">
                        <div>
                            <h1 className="display-md">Réalisation introuvable</h1>
                            <Link to="/" className="btn btn-outline mt-6 inline-flex"><ArrowLeft size={16} /> Retour à l'accueil</Link>
                        </div>
                    </div>
                )}

                {project && (
                    <article className="max-w-[1100px] mx-auto px-5 lg:px-10 py-12 lg:py-16">
                        <Link to="/#realisations" className="link-underline inline-flex items-center gap-2 mb-8" style={{ fontFamily: "var(--s-mono)", fontSize: 13, color: "var(--s-ink-soft)" }}>
                            <ArrowLeft size={16} /> Toutes les réalisations
                        </Link>

                        <span className="kicker mb-3">{project.category}{project.year ? ` · ${project.year}` : ""}</span>
                        <h1 className="display-lg" style={{ marginBottom: 28 }}>{project.title}</h1>

                        <motion.div className="cartouche" style={{ overflow: "hidden", background: "var(--s-concrete)", aspectRatio: "16/9" }}
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                            {project.coverImageUrl && <img src={assetUrl(project.coverImageUrl)} alt={project.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </motion.div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 my-10 py-8" style={{ borderTop: "1px solid var(--s-line)", borderBottom: "1px solid var(--s-line)" }}>
                            {facts.map((f) => (
                                <div key={f.label}>
                                    <div className="flex items-center gap-1.5" style={{ fontFamily: "var(--s-mono)", fontSize: 10.5, letterSpacing: "0.1em", color: "var(--s-ink-faint)", textTransform: "uppercase", marginBottom: 5 }}>
                                        <f.icon size={12} /> {f.label}
                                    </div>
                                    <div style={{ fontFamily: "var(--s-display)", fontSize: 19, fontWeight: 600 }}>{f.value}</div>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontSize: 17.5, lineHeight: 1.85, color: "var(--s-ink-soft)", whiteSpace: "pre-line", maxWidth: 720 }}>{project.description}</p>

                        {/* Comparatif Avant / Après (uniquement si les deux phases existent) */}
                        {hasComparison && (
                            <div className="mt-12">
                                <span className="kicker mb-4">La transformation</span>
                                <div className="mt-3"><BeforeAfter beforeUrl={avant[0].url} afterUrl={apres[0].url} /></div>
                            </div>
                        )}

                        {galleryImages.length > 0 && (
                            <div className="grid sm:grid-cols-2 gap-5 mt-8">
                                {galleryImages.map((img) => (
                                    <div key={img.id} className="cartouche" style={{ overflow: "hidden", background: "var(--s-concrete)" }}>
                                        <img src={assetUrl(img.url)} alt="" loading="lazy" style={{ width: "100%", display: "block", objectFit: "cover" }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                )}
            </main>
            <SiteFooter settings={bundle?.settings} profile={bundle?.profile} />
        </>
    );
}
