import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IdCard, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BusinessCard } from "./BusinessCard";
import { useReducedMotion } from "../hooks/useUiHooks";
import { exportJpg, exportPdf, ensureCardFonts, slugName, type CardData } from "@/lib/businessCard";
import { assetUrl } from "@/lib/utils";

type Fmt = "pdf" | "jpg";
const MIN_ANIM_MS = 1700;

function preloadImage(src?: string) {
    return new Promise<void>((resolve) => {
        if (!src) return resolve();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
    });
}
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface Props {
    /** Recharge les données fraîches de l'admin à CHAQUE clic (jamais de cache). */
    loader: () => Promise<CardData>;
    className?: string;
    label?: string;
    style?: CSSProperties;
}

export function DownloadCardButton({ loader, className = "admin-btn-primary", label = "Télécharger ma carte de visite", style }: Props) {
    const reduced = useReducedMotion();
    const [menu, setMenu] = useState(false);
    const [busy, setBusy] = useState(false);
    const [data, setData] = useState<CardData | null>(null);
    const rectoRef = useRef<HTMLDivElement>(null);
    const versoRef = useRef<HTMLDivElement>(null);

    async function run(fmt: Fmt) {
        setMenu(false);
        if (busy) return;
        setBusy(true);
        const t0 = performance.now();
        try {
            const fresh = await loader();          // ← données à jour, régénération QR comprise
            setData(fresh);
            await preloadImage(assetUrl(fresh.photoUrl) ?? undefined);
            await ensureCardFonts();
            await nextFrame();
            if (!rectoRef.current || !versoRef.current) throw new Error("Rendu de la carte indisponible.");
            const fname = `${slugName(fresh.fullName)}-carte-visite`;
            if (fmt === "pdf") await exportPdf(rectoRef.current, versoRef.current, fname);
            else await exportJpg(rectoRef.current, versoRef.current, fname);
            if (!reduced) {
                const left = MIN_ANIM_MS - (performance.now() - t0);
                if (left > 0) await sleep(left);
            }
            toast.success("Carte de visite téléchargée.");
        } catch (e) {
            toast.error((e as Error).message || "Échec de la génération.");
        } finally {
            setBusy(false);
            setData(null);
        }
    }

    return (
        <div className="relative inline-flex">
            <button type="button" className={className} style={style} onClick={() => setMenu((m) => !m)} disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <IdCard size={16} />}
                {label}
            </button>

            {menu && !busy && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 60, background: "#F6F2EA", border: "1px solid rgba(28,24,20,.14)", borderRadius: 10, padding: 6, width: 230, boxShadow: "0 18px 40px -16px rgba(28,24,20,.35)" }}>
                    <FmtRow icon={<FileText size={17} color="#BC6C3C" />} title="PDF — impression" sub="85×55 mm, haute résolution" onClick={() => run("pdf")} />
                    <FmtRow icon={<ImageIcon size={17} color="#B08D57" />} title="JPG — partage" sub="recto + verso, réseaux" onClick={() => run("jpg")} />
                </div>
            )}

            {/* Carte rendue hors-écran pour capture (montée seulement pendant la génération) */}
            {data && (
                <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none", opacity: 0 }}>
                    <BusinessCard data={data} rectoRef={rectoRef} versoRef={versoRef} />
                </div>
            )}

            <AnimatePresence>{busy && <CardGenOverlay reduced={reduced} />}</AnimatePresence>
        </div>
    );
}

function FmtRow({ icon, title, sub, onClick }: { icon: ReactNode; title: string; sub: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="w-full text-left" style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(188,108,60,.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {icon}
            <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1C1814", fontFamily: "'Hanken Grotesk',sans-serif" }}>{title}</span>
                <span style={{ display: "block", fontSize: 11.5, color: "rgba(28,24,20,.55)" }}>{sub}</span>
            </span>
        </button>
    );
}

/** Animation « le plan devient carte » : tracé blueprint → matière → flip. */
function CardGenOverlay({ reduced }: { reduced: boolean }) {
    const ease = [0.16, 1, 0.3, 1] as const;
    const draw = (delay: number, duration = 0.6) => ({
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { pathLength: { delay, duration, ease }, opacity: { delay, duration: 0.2 } },
    });

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(28,24,20,0.55)", backdropFilter: "blur(5px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}
        >
            <div style={{ perspective: 1200 }}>
                <motion.div
                    style={{ width: 272, height: 176, position: "relative", transformStyle: "preserve-3d" }}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: reduced ? 0 : [0, 0, 180, 180] }}
                    transition={{ duration: reduced ? 0 : 1.7, times: [0, 0.62, 0.9, 1], ease: "easeInOut", repeat: reduced ? 0 : Infinity, repeatDelay: 0.2 }}
                >
                    {/* FACE recto : tracé + matière */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#EDE8DF", overflow: "hidden" }}>
                        <motion.div style={{ position: "absolute", inset: 0, background: "#EDE8DF" }}
                            initial={{ opacity: 0 }} animate={{ opacity: reduced ? 1 : [0, 0, 1] }} transition={{ duration: 1.7, times: [0, 0.45, 0.62] }} />
                        <svg viewBox="0 0 272 176" width="272" height="176" style={{ position: "absolute", inset: 0 }}>
                            <motion.rect x="6" y="6" width="260" height="164" fill="none" stroke="#BC6C3C" strokeWidth="1.5" {...draw(0, 0.6)} />
                            <motion.line x1="6" y1="40" x2="266" y2="40" stroke="#BC6C3C" strokeWidth="1" {...draw(0.5, 0.4)} />
                            <motion.rect x="22" y="60" width="70" height="90" fill="none" stroke="#1C1814" strokeWidth="1.2" {...draw(0.3, 0.5)} />
                            <motion.line x1="110" y1="74" x2="240" y2="74" stroke="#1C1814" strokeWidth="3" {...draw(0.55, 0.4)} />
                            <motion.line x1="110" y1="96" x2="210" y2="96" stroke="#1C1814" strokeWidth="2" {...draw(0.65, 0.4)} />
                            <motion.line x1="110" y1="130" x2="180" y2="130" stroke="#BC6C3C" strokeWidth="2" {...draw(0.75, 0.4)} />
                            <motion.line x1="6" y1="6" x2="40" y2="6" stroke="#BC6C3C" strokeWidth="3" {...draw(0.1, 0.3)} />
                        </svg>
                    </div>
                    {/* FACE verso */}
                    <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "#1C1814", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: 20 }}>
                        <div style={{ width: 90, height: 90, background: "#F6F2EA", borderTop: "3px solid #BC6C3C" }} />
                    </div>
                </motion.div>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: "0.25em", color: "#EDE8DF" }}>
                GÉNÉRATION DE LA CARTE…
            </div>
        </motion.div>,
        document.body
    );
}
