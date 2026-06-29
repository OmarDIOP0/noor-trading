import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { assetUrl } from "@/lib/utils";

interface Props {
    url: string;
    logoUrl?: string | null;
    size?: number;
}

/**
 * QR « signature » sobre, cohérent avec les cartes du site.
 * Les couleurs proviennent de la charte (variables CSS), jamais codées en dur.
 * Les modules du QR restent à fort contraste (encre sur surface claire) → scannable.
 */
export function ScanQr({ url, logoUrl, size = 200 }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [theme, setTheme] = useState({ ink: "#1C1814", accent: "#BC6C3C", surface: "#F6F2EA" });

    // Lecture des couleurs réelles de la charte (tokens CSS) au montage.
    useEffect(() => {
        if (!ref.current) return;
        const cs = getComputedStyle(ref.current);
        const get = (v: string, fb: string) => cs.getPropertyValue(v).trim() || fb;
        setTheme({
            ink: get("--s-ink", "#1C1814"),
            accent: get("--s-clay", "#BC6C3C"),
            surface: get("--s-surface", "#F6F2EA"),
        });
    }, []);

    const qrUrl = url ? `${url}${url.includes("?") ? "&" : "?"}source=qrcode` : "";
    const logo = assetUrl(logoUrl);
    let host = "";
    try { host = url ? new URL(url).host : ""; } catch { host = ""; }

    return (
        <div
            ref={ref}
            className="qr-card"
            style={{
                background: theme.surface,
                border: "1px solid var(--s-line)",
                borderTop: `3px solid ${theme.accent}`,   // accent charte, sobre
                padding: 20,
                display: "inline-flex",
                flexDirection: "column",
                gap: 14,
                transition: "transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s",
            }}
        >
            <div style={{ width: size, height: size }}>
                <QRCodeSVG
                    value={qrUrl || "https://"}
                    size={size}
                    level="H"
                    bgColor="transparent"
                    fgColor={theme.ink}
                    imageSettings={logo ? { src: logo, height: size * 0.22, width: size * 0.22, excavate: true } : undefined}
                    style={{ display: "block" }}
                />
            </div>
            <div className="flex items-center gap-2" style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.06em", color: "var(--s-ink-soft)" }}>
                <span style={{ width: 6, height: 6, background: theme.accent, borderRadius: 1 }} />
                {host || "Scannez pour visiter"}
            </div>
            <style>{`.qr-card:hover{ transform: translateY(-3px); box-shadow: 0 18px 40px -18px rgba(28,24,20,0.35); }`}</style>
        </div>
    );
}
