import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Link2, Check, MessageCircle, Mail, Smartphone, Download, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

export interface ShareConfig {
    /** URL absolue à partager. */
    url: string;
    /** Titre (sujet email / titre du partage natif). */
    title: string;
    /** Message d'accroche pré-rempli. */
    message: string;
}

interface Props {
    share: ShareConfig;
    variant?: "primary" | "outline" | "ghost" | "icon";
    label?: string;
    /** Contexte QR : propose en plus le téléchargement de l'image PNG. */
    qrDownloadPng?: () => void;
}

const PANEL_W = 264;

export function ShareButton({ share, variant = "outline", label = "Partager", qrDownloadPng }: Props) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const text = `${share.message} ${share.url}`;
    const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const mailHref = `mailto:?subject=${encodeURIComponent(share.title)}&body=${encodeURIComponent(`${share.message}\n\n${share.url}`)}`;
    const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

    // Position du panneau (rendu en portal → jamais rogné par un overflow:hidden de card)
    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        const estH = 56 * (2 + (canNativeShare ? 1 : 0) + (qrDownloadPng ? 1 : 0)) + 16;
        const left = Math.max(8, Math.min(r.right - PANEL_W, window.innerWidth - PANEL_W - 8));
        const below = r.bottom + 8;
        const top = below + estH > window.innerHeight && r.top - estH - 8 > 0 ? r.top - estH - 8 : below;
        setPos({ top, left });
    }, [open, canNativeShare, qrDownloadPng]);

    // Fermeture : clic extérieur (trigger + panel exclus), Échap, scroll, resize
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent | TouchEvent) => {
            const t = e.target as Node;
            if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onScrollResize = () => setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", onScrollResize, true);
        window.addEventListener("resize", onScrollResize);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", onScrollResize, true);
            window.removeEventListener("resize", onScrollResize);
        };
    }, [open]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(share.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error("Impossible de copier le lien.");
        }
    }

    async function nativeShare() {
        try {
            await navigator.share({ title: share.title, text: share.message, url: share.url });
            setOpen(false);
        } catch { /* annulé par l'utilisateur */ }
    }

    const triggerClass =
        variant === "primary" ? "admin-btn-primary"
        : variant === "ghost" ? "admin-btn-ghost"
        : variant === "icon" ? "admin-btn-ghost"
        : "admin-btn-outline";

    return (
        <div ref={triggerRef} className="relative inline-flex">
            <button type="button" className={triggerClass} onClick={() => setOpen((o) => !o)}
                style={variant === "icon" ? { height: 38, width: 38, padding: 0 } : undefined} aria-label="Partager">
                <Share2 size={16} />
                {variant !== "icon" && <span>{label}</span>}
            </button>

            {open && createPortal(
                <div
                    ref={panelRef}
                    className="admin-card scrollbar-thin"
                    style={{
                        position: "fixed", top: pos.top, left: pos.left, zIndex: 200,
                        width: PANEL_W, padding: 8, boxShadow: "0 18px 50px -12px rgba(20,32,43,0.30)",
                    }}
                >
                    {canNativeShare && (
                        <ShareRow icon={Smartphone} label="Partager…" color="var(--steel)" onClick={nativeShare} />
                    )}
                    <ShareRow
                        icon={copied ? Check : Link2}
                        label={copied ? "Copié !" : "Copier le lien"}
                        color={copied ? "var(--green)" : "var(--ink)"}
                        onClick={copyLink}
                    />
                    <ShareRowLink icon={MessageCircle} label="WhatsApp" color="#25D366" href={waHref} onClick={() => setOpen(false)} />
                    <ShareRowLink icon={Mail} label="E-mail" color="var(--orange)" href={mailHref} onClick={() => setOpen(false)} />
                    {qrDownloadPng && (
                        <ShareRow icon={Download} label="Télécharger le QR (PNG)" color="var(--ink)" onClick={() => { qrDownloadPng(); setOpen(false); }} />
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}

function ShareRow({ icon: Icon, label, color, onClick }: { icon: LucideIcon; label: string; color: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="w-full flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--hover)]">
            <Icon size={18} style={{ color }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
        </button>
    );
}

function ShareRowLink({ icon: Icon, label, color, href, onClick }: { icon: LucideIcon; label: string; color: string; href: string; onClick?: () => void }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className="w-full flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--hover)]">
            <Icon size={18} style={{ color }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
        </a>
    );
}
