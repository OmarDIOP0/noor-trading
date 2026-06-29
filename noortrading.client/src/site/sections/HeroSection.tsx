import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { HeroShowcase } from "../components/HeroShowcase";
import { useReducedMotion } from "../hooks/useUiHooks";
import type { PublicProfile, PublicSettings } from "../types";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroSection({ profile, settings }: { profile?: PublicProfile; settings?: PublicSettings }) {
    const reduced = useReducedMotion();
    const name = profile?.fullName || settings?.appName || "";
    const [first, ...rest] = name.split(" ");

    const container = { hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.12, delayChildren: 0.1 } } };
    const item = {
        hidden: { opacity: 0, y: reduced ? 0 : 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
    };

    return (
        <section id="top" className="blueprint-grid relative min-h-[100svh] flex items-center overflow-hidden">
            {/* filet de matière béton en bas */}
            <div className="absolute inset-x-0 bottom-0 h-40 concrete" style={{ opacity: 0.5, maskImage: "linear-gradient(transparent, #000)" }} />

            <div className="max-w-[1400px] mx-auto w-full px-5 lg:px-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center relative z-10 pt-24 pb-16">
                {/* Colonne texte */}
                <motion.div variants={container} initial="hidden" animate="show">
                    <motion.div variants={item} className="kicker mb-6">Portfolio · {(settings?.appName ?? "").toUpperCase()}</motion.div>

                    <h1 className="display-xl" style={{ marginBottom: 8 }}>
                        <motion.span variants={item} style={{ display: "block" }}>{first}</motion.span>
                        <motion.span variants={item} className="italic-accent" style={{ display: "block", color: "var(--s-clay)" }}>
                            {rest.join(" ")}
                        </motion.span>
                    </h1>

                    {/* double identité */}
                    <motion.div variants={item} className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 mb-7">
                        <span style={{ fontFamily: "var(--s-mono)", fontSize: 13, letterSpacing: "0.08em", color: "var(--s-ink)" }}>
                            INGÉNIEURE GÉNIE CIVIL
                        </span>
                        <span style={{ width: 6, height: 6, background: "var(--s-brass)", borderRadius: 9999 }} />
                        <span style={{ fontFamily: "var(--s-mono)", fontSize: 13, letterSpacing: "0.08em", color: "var(--s-brass)" }}>
                            DÉCORATION D'INTÉRIEUR
                        </span>
                    </motion.div>

                    <motion.p variants={item} className="lead" style={{ maxWidth: 480 }}>
                        {settings?.mainTitle || profile?.bio?.slice(0, 160)}
                    </motion.p>

                    <motion.div variants={item} className="flex flex-wrap gap-3 mt-9">
                        <a href="#realisations" className="btn btn-solid">Voir les réalisations</a>
                        <a href="#apropos" className="btn btn-outline">Découvrir le parcours</a>
                    </motion.div>
                </motion.div>

                {/* Colonne 3D / blueprint */}
                <motion.div
                    className="relative"
                    style={{ height: "min(60vh, 520px)" }}
                    initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease, delay: 0.3 }}
                >
                    <HeroShowcase />
                </motion.div>
            </div>

            {/* scroll indicator */}
            {!reduced && (
                <motion.a
                    href="#apropos"
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    style={{ color: "var(--s-ink-soft)" }}
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 10.5, letterSpacing: "0.25em" }}>SCROLL</span>
                    <ArrowDown size={16} />
                </motion.a>
            )}
        </section>
    );
}
