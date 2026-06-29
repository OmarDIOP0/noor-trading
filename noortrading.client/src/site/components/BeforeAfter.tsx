import { useRef, useState, useCallback } from "react";
import { assetUrl } from "@/lib/utils";

interface Props {
    beforeUrl: string;
    afterUrl: string;
}

/** Comparateur Avant/Après — curseur glissant (pointer), labels, sans dépendance. */
export function BeforeAfter({ beforeUrl, afterUrl }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState(50);
    const dragging = useRef(false);

    const update = useCallback((clientX: number) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const p = ((clientX - r.left) / r.width) * 100;
        setPos(Math.max(0, Math.min(100, p)));
    }, []);

    return (
        <div
            ref={ref}
            className="cartouche relative select-none"
            style={{ width: "100%", aspectRatio: "16/10", overflow: "hidden", background: "var(--s-concrete)", cursor: "ew-resize", touchAction: "none" }}
            onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); update(e.clientX); }}
            onPointerMove={(e) => { if (dragging.current) update(e.clientX); }}
            onPointerUp={() => { dragging.current = false; }}
            onPointerLeave={() => { dragging.current = false; }}
            role="slider"
            aria-valuenow={Math.round(pos)}
            aria-label="Comparateur avant après"
        >
            {/* APRÈS (base) */}
            <img src={assetUrl(afterUrl)} alt="Après travaux" loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            {/* AVANT (clippé à gauche) */}
            <img src={assetUrl(beforeUrl)} alt="Avant travaux" loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath: `inset(0 ${100 - pos}% 0 0)` }} />

            {/* labels */}
            <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.12em", color: "#fff", background: "rgba(28,24,20,0.6)", padding: "4px 10px" }}>AVANT</span>
            <span style={{ position: "absolute", top: 12, right: 12, fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--s-ink)", background: "rgba(246,242,234,0.85)", padding: "4px 10px" }}>APRÈS</span>

            {/* poignée */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, background: "var(--s-surface)", transform: "translateX(-1px)", boxShadow: "0 0 0 1px rgba(28,24,20,0.2)" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "9999px", background: "var(--s-surface)", boxShadow: "0 2px 10px rgba(28,24,20,0.3)", display: "grid", placeItems: "center" }}>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 14, color: "var(--s-clay)", letterSpacing: "-2px" }}>‹›</span>
                </div>
            </div>
        </div>
    );
}
