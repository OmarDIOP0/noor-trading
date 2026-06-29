import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { assetUrl } from "@/lib/utils";
import type { PublicSettings } from "../types";

const LINKS = [
    { href: "#apropos", label: "À propos" },
    { href: "#parcours", label: "Parcours" },
    { href: "#services", label: "Services" },
    { href: "#realisations", label: "Réalisations" },
    { href: "#contact", label: "Contact" },
];

export function SiteNav({ settings }: { settings?: PublicSettings }) {
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 40);
        on();
        window.addEventListener("scroll", on, { passive: true });
        return () => window.removeEventListener("scroll", on);
    }, []);

    return (
        <header
            className="fixed top-0 inset-x-0 z-50 transition-all"
            style={{
                background: scrolled ? "color-mix(in srgb, var(--s-bg) 86%, transparent)" : "transparent",
                backdropFilter: scrolled ? "blur(10px)" : "none",
                borderBottom: scrolled ? "1px solid var(--s-line)" : "1px solid transparent",
            }}
        >
            <div className="max-w-[1400px] mx-auto px-5 lg:px-10 flex items-center justify-between" style={{ height: 76 }}>
                <a href="#top" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
                    {settings?.logoUrl ? (
                        <img src={assetUrl(settings.logoUrl)} alt="" style={{ width: 36, height: 36, objectFit: "cover" }} />
                    ) : (
                        <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", background: "var(--s-ink)", color: "var(--s-surface)", fontFamily: "var(--s-display)", fontWeight: 700 }}>
                            {(settings?.appName ?? "N")[0]}
                        </span>
                    )}
                    <span style={{ fontFamily: "var(--s-display)", fontWeight: 600, fontSize: 19, color: "var(--s-ink)" }}>
                        {settings?.appName ?? "Portfolio"}
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-8">
                    {LINKS.map((l) => (
                        <a key={l.href} href={l.href} className="link-underline" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--s-ink-soft)" }}>
                            {l.label}
                        </a>
                    ))}
                </nav>

                <a href="#contact" className="btn btn-solid hidden sm:inline-flex" style={{ padding: "0.6rem 1.2rem" }}>
                    Me contacter
                </a>
            </div>

            {/* barre de progression de lecture */}
            <motion.div style={{ scaleX: progress, transformOrigin: "0%", height: 2, background: "var(--s-clay)" }} />
        </header>
    );
}
