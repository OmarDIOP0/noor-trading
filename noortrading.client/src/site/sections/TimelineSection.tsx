import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, GraduationCap, Award, Trophy, type LucideIcon } from "lucide-react";
import { RevealWords } from "../components/Reveal";
import { useReducedMotion } from "../hooks/useUiHooks";
import type { TimelineEntry, TimelineType } from "../types";

gsap.registerPlugin(ScrollTrigger);

const ICON: Record<TimelineType, LucideIcon> = {
    Experience: Briefcase, Education: GraduationCap, Certification: Award, Achievement: Trophy,
};

export function TimelineSection({ entries }: { entries: TimelineEntry[] }) {
    const reduced = useReducedMotion();
    const root = useRef<HTMLDivElement>(null);
    const fill = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduced || !entries.length || !list.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(fill.current,
                { scaleY: 0 },
                { scaleY: 1, ease: "none", transformOrigin: "top",
                  scrollTrigger: { trigger: list.current, start: "top 55%", end: "bottom 75%", scrub: 0.5 } });

            gsap.utils.toArray<HTMLElement>(".tl-item").forEach((el) => {
                gsap.from(el, {
                    opacity: 0, y: 48, duration: 0.7, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 88%" },
                });
            });
        }, root);
        return () => ctx.revert();
    }, [reduced, entries]);

    if (!entries.length) return null;

    return (
        <section id="parcours" ref={root} className="concrete relative py-28 lg:py-36">
            <div className="max-w-[1100px] mx-auto px-5 lg:px-10">
                <div className="mb-16">
                    <span className="plan-index">02 — PARCOURS</span>
                    <h2 className="display-lg mt-3"><RevealWords text="Une trajectoire" /> <span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="construite." /></span></h2>
                </div>

                <div ref={list} className="relative" style={{ paddingLeft: 4 }}>
                    {/* rail + remplissage progressif */}
                    <div className="absolute top-0 bottom-0" style={{ left: 23, width: 2, background: "var(--s-line)" }} />
                    <div ref={fill} className="absolute top-0 bottom-0" style={{ left: 23, width: 2, background: "var(--s-clay)", transform: reduced ? "scaleY(1)" : "scaleY(0)", transformOrigin: "top" }} />

                    <div className="space-y-10">
                        {entries.map((e) => {
                            const Icon = ICON[e.type];
                            return (
                                <div key={e.id} className="tl-item relative flex gap-6" style={{ willChange: "transform, opacity" }}>
                                    <div className="relative z-10 flex-shrink-0" style={{ width: 48, height: 48, background: "var(--s-surface)", display: "grid", placeItems: "center", boxShadow: "0 0 0 1px var(--s-line), 0 0 0 6px var(--s-concrete)" }}>
                                        <Icon size={20} style={{ color: e.type === "Education" ? "var(--s-blueprint)" : "var(--s-clay)" }} />
                                    </div>
                                    <div className="pb-2 pt-1">
                                        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 4 }}>
                                            <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, letterSpacing: "0.08em", color: "var(--s-clay)", fontWeight: 700 }}>{e.period}</span>
                                            {e.isCurrent && <span style={{ fontFamily: "var(--s-mono)", fontSize: 10, padding: "2px 8px", background: "var(--s-clay)", color: "var(--s-surface)" }}>EN COURS</span>}
                                        </div>
                                        <h3 style={{ fontFamily: "var(--s-display)", fontSize: 23, fontWeight: 600 }}>{e.title}</h3>
                                        {e.organization && <p style={{ fontSize: 15, color: "var(--s-ink-soft)", fontWeight: 600 }}>{e.organization}{e.location ? ` · ${e.location}` : ""}</p>}
                                        {e.description && <p style={{ fontSize: 15, color: "var(--s-ink-soft)", marginTop: 8, maxWidth: 620, lineHeight: 1.7 }}>{e.description}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
