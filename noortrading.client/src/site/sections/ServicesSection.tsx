import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealWords } from "../components/Reveal";
import { getServiceIcon } from "@/lib/serviceIcons";
import { useReducedMotion } from "../hooks/useUiHooks";
import type { PublicService, ServiceDomain } from "../types";

function ServiceRow({ s, index }: { s: PublicService; index: number }) {
    const [hover, setHover] = useState(false);
    const reduced = useReducedMotion();
    const Icon = getServiceIcon(s.icon);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="relative cursor-default"
            style={{ borderTop: "1px solid var(--s-line)", padding: "26px 4px", transition: "padding .35s" }}
        >
            {/* fond qui se révèle */}
            {!reduced && (
                <motion.div
                    initial={false}
                    animate={{ scaleX: hover ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: "absolute", inset: 0, background: "var(--s-clay)", opacity: 0.06, transformOrigin: "left", zIndex: 0 }}
                />
            )}
            <div className="relative z-10 flex items-center gap-5">
                <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, color: "var(--s-ink-faint)", width: 28 }}>
                    {String(index + 1).padStart(2, "0")}
                </span>
                <motion.div
                    animate={{ rotate: hover && !reduced ? -8 : 0, scale: hover && !reduced ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    style={{ width: 46, height: 46, display: "grid", placeItems: "center", background: "var(--s-surface)", boxShadow: "inset 0 0 0 1px var(--s-line)", flexShrink: 0 }}
                >
                    <Icon size={22} style={{ color: "var(--s-clay)" }} />
                </motion.div>

                <div className="flex-1 min-w-0">
                    <h3 style={{ fontFamily: "var(--s-display)", fontSize: "clamp(1.4rem,2.4vw,2rem)", fontWeight: 600, lineHeight: 1.1, color: hover ? "var(--s-clay)" : "var(--s-ink)", transition: "color .3s" }}>
                        {s.title}
                    </h3>
                    <AnimatePresence initial={false}>
                        {(hover || reduced) && (
                            <motion.p
                                initial={reduced ? false : { opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35 }}
                                style={{ fontSize: 15, color: "var(--s-ink-soft)", marginTop: 6, lineHeight: 1.6, overflow: "hidden" }}
                            >
                                {s.shortDescription}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <motion.span animate={{ opacity: hover ? 1 : 0.25, x: hover ? 0 : -6 }} style={{ color: "var(--s-clay)" }}>
                    <ArrowUpRight size={24} />
                </motion.span>
            </div>
        </div>
    );
}

function Block({ title, label, services }: { title: string; label: string; services: PublicService[] }) {
    if (!services.length) return null;
    return (
        <div>
            <Reveal>
                <div className="flex items-baseline gap-4 mb-2">
                    <span className="kicker">{label}</span>
                    <span style={{ flex: 1, height: 1, background: "var(--s-line)" }} />
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, color: "var(--s-ink-faint)" }}>{services.length} prestation{services.length > 1 ? "s" : ""}</span>
                </div>
                <h3 className="display-md mb-2" style={{ fontWeight: 400 }}>{title}</h3>
            </Reveal>
            <div>
                {services.map((s, i) => <ServiceRow key={s.id} s={s} index={i} />)}
            </div>
        </div>
    );
}

const inDomain = (s: PublicService, d: ServiceDomain) => s.domain === d || s.domain === "Both";

export function ServicesSection({ services }: { services: PublicService[] }) {
    if (!services.length) return null;
    const civil = services.filter((s) => inDomain(s, "GenieCivil"));
    const deco = services.filter((s) => inDomain(s, "Decoration"));

    return (
        <section id="services" className="relative py-28 lg:py-36" style={{ background: "var(--s-bg)" }}>
            <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
                <div className="mb-16">
                    <span className="plan-index">03 — SERVICES</span>
                    <h2 className="display-lg mt-3"><RevealWords text="Ce que je" /> <span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="conçois." /></span></h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
                    <Block title="Ingénierie & structure" label="Génie Civil" services={civil} />
                    <div className="u-deco">
                        <Block title="Espaces & matières" label="Décoration d'intérieur" services={deco} />
                    </div>
                </div>
            </div>
        </section>
    );
}
