import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";
import { assetUrl } from "@/lib/utils";
import { ShareButton } from "./ShareButton";

interface Props {
    /** URL publique de base (sans query). */
    baseUrl: string;
    logoUrl?: string | null;
    appName: string;
    shareMessage: string;
}

const QR_SIZE = 240;
const DARK = "#14202B";

export function QrCodePanel({ baseUrl, logoUrl, appName, shareMessage }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);

    // URL encodée dans le QR : tag analytics ?source=qrcode
    const qrUrl = baseUrl ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}source=qrcode` : "";

    useEffect(() => {
        if (!qrUrl || !canvasRef.current) return;
        let cancelled = false;
        const canvas = canvasRef.current;

        QRCode.toCanvas(canvas, qrUrl, {
            width: QR_SIZE,
            margin: 2,
            errorCorrectionLevel: "H", // tolérance élevée → logo central possible
            color: { dark: DARK, light: "#FFFFFF" },
        }).then(() => {
            if (cancelled) return;
            setReady(true);
            const logo = assetUrl(logoUrl);
            if (!logo) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const box = QR_SIZE * 0.24;
                const c = (QR_SIZE - box) / 2;
                ctx.fillStyle = "#FFFFFF";
                const r = 10;
                ctx.beginPath();
                ctx.roundRect(c - 6, c - 6, box + 12, box + 12, r);
                ctx.fill();
                ctx.drawImage(img, c, c, box, box);
            };
            img.onerror = () => { /* logo introuvable : QR simple */ };
            img.src = logo;
        }).catch(() => toast.error("Impossible de générer le QR code."));

        return () => { cancelled = true; };
    }, [qrUrl, logoUrl]);

    function downloadPng() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${slug(appName)}-qrcode.png`;
        a.click();
    }

    async function downloadSvg() {
        if (!qrUrl) return;
        try {
            let svg = await QRCode.toString(qrUrl, {
                type: "svg", margin: 2, errorCorrectionLevel: "H",
                color: { dark: DARK, light: "#FFFFFF" },
            });
            const logo = assetUrl(logoUrl);
            if (logo) {
                // insère le logo au centre (24% de la largeur, viewBox carré)
                const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
                const w = vb ? Number(vb[1]) : 33;
                const box = w * 0.24, c = (w - box) / 2;
                const overlay =
                    `<rect x="${c - 1}" y="${c - 1}" width="${box + 2}" height="${box + 2}" rx="1.2" fill="#fff"/>` +
                    `<image href="${logo}" x="${c}" y="${c}" width="${box}" height="${box}"/>`;
                svg = svg.replace("</svg>", `${overlay}</svg>`);
            }
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${slug(appName)}-qrcode.svg`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch {
            toast.error("Impossible de générer le SVG.");
        }
    }

    if (!baseUrl) {
        return (
            <div className="admin-card p-5">
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                    Renseignez d'abord l'URL publique pour générer le QR code.
                </p>
            </div>
        );
    }

    return (
        <div className="admin-card p-5">
            <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                <QrIcon size={17} style={{ color: "var(--ink-faint)" }} /> QR code du portfolio
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="rounded-2xl p-3" style={{ background: "#fff", border: "1px solid var(--border)", boxShadow: "0 8px 24px -10px rgba(20,32,43,0.2)" }}>
                    <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} style={{ display: "block", width: QR_SIZE, height: QR_SIZE }} />
                </div>
                <div className="flex-1 w-full">
                    <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 4 }}>
                        Généré dynamiquement depuis l'URL publique, avec le marqueur <code style={{ fontSize: 12 }}>?source=qrcode</code> pour le suivi analytique.
                    </p>
                    <p className="truncate" style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 14 }}>{qrUrl}</p>
                    <div className="flex flex-wrap gap-2">
                        <button className="admin-btn-primary" onClick={downloadPng} disabled={!ready}><Download size={16} /> PNG</button>
                        <button className="admin-btn-outline" onClick={downloadSvg}><Download size={16} /> SVG</button>
                        <ShareButton
                            share={{ url: qrUrl, title: appName, message: shareMessage }}
                            qrDownloadPng={downloadPng}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function slug(s: string): string {
    const stripped = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return stripped.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "portfolio";
}
