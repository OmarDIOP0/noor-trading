import type { RefObject, ReactNode } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Phone, Mail, MapPin, Globe, User } from "lucide-react";
import { assetUrl } from "@/lib/utils";
import { buildVCard, type CardData } from "@/lib/businessCard";

const W = 510;
const H = 330;
const BETON = "#EDE8DF";
const CONCRETE = "#C9C2B6";
const INK = "#1C1814";
const CLAY = "#BC6C3C";
const BRASS = "#B08D57";
const CREAM = "#F6F2EA";

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_SANS = "'Hanken Grotesk', system-ui, sans-serif";
const FONT_MONO = "'Space Mono', monospace";

function Eq({ pos, color = CLAY }: { pos: "tl" | "br"; color?: string }) {
    const base = { position: "absolute" as const, width: 16, height: 16, pointerEvents: "none" as const };
    return pos === "tl"
        ? <span style={{ ...base, top: 10, left: 10, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
        : <span style={{ ...base, bottom: 10, right: 10, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />;
}

/**
 * Carte de visite (concept « Cartouche d'architecte »), rendue à taille fixe
 * pour capture html2canvas. Recto + verso exposés via refs.
 */
export function BusinessCard({ data, rectoRef, versoRef }: {
    data: CardData;
    rectoRef: RefObject<HTMLDivElement | null>;
    versoRef: RefObject<HTMLDivElement | null>;
}) {
    const [first, ...restArr] = (data.fullName || "").split(" ");
    const rest = restArr.join(" ");
    const titleLines = (data.title || "").split(/\s[&·]\s/).map((t) => t.trim()).filter(Boolean);
    const photo = assetUrl(data.photoUrl);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* ── RECTO ── */}
            <div ref={rectoRef} style={{
                width: W, height: H, position: "relative", overflow: "hidden",
                background: BETON, fontFamily: FONT_SANS, color: INK,
                backgroundImage: "linear-gradient(rgba(28,24,20,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(28,24,20,.028) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
            }}>
                <Eq pos="tl" /><Eq pos="br" />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 22, padding: 30 }}>
                    <div style={{ width: 118, height: 152, flex: "0 0 auto", background: CONCRETE, border: "1px solid rgba(28,24,20,.15)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {photo
                            ? <img src={photo} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <User size={48} color="#8a8378" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.18em", color: CLAY }}>
                            {(data.appName || "").toUpperCase()}
                        </div>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, lineHeight: 1.02, color: INK, marginTop: 3 }}>
                            {first}{rest && <span style={{ fontStyle: "italic", fontWeight: 400, color: CLAY }}> {rest}</span>}
                        </div>
                        <div style={{ marginTop: 12 }}>
                            {titleLines.map((line, idx) => (
                                <div key={idx} style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.06em", color: idx === 0 ? INK : BRASS, textTransform: "uppercase" }}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── VERSO ── */}
            <div ref={versoRef} style={{
                width: W, height: H, position: "relative", overflow: "hidden",
                background: INK, fontFamily: FONT_SANS, color: BETON,
            }}>
                <Eq pos="tl" color={BRASS} /><Eq pos="br" color={BRASS} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: 32 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 13, fontSize: 14 }}>
                        {data.phone && <Row icon={<Phone size={15} color={BRASS} />} text={data.phone} />}
                        {data.email && <Row icon={<Mail size={15} color={BRASS} />} text={data.email} />}
                        {data.location && <Row icon={<MapPin size={15} color={BRASS} />} text={data.location} />}
                        {data.website && (
                            <div style={{ marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(176,141,87,0.32)" }}>
                                <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: "0.22em", color: "rgba(176,141,87,0.7)", marginBottom: 4 }}>SITE WEB</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Globe size={15} color={BRASS} />
                                    <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: BRASS, letterSpacing: "0.03em" }}>
                                        {data.website.replace(/^https?:\/\//, "")}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{ width: 138, height: 138, flex: "0 0 auto", background: CREAM, padding: 8, borderTop: `3px solid ${CLAY}` }}>
                        <QRCodeCanvas value={buildVCard(data)} size={122} level="M" bgColor={CREAM} fgColor={INK} marginSize={0} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {icon}
            <span style={{ color: BETON }}>{text}</span>
        </div>
    );
}
