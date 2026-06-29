import { Reveal, RevealWords } from "../components/Reveal";
import { assetUrl } from "@/lib/utils";
import type { PublicSettings } from "../types";

/** Bande « entreprise » — infos issues d'AppSettings (nom, logo, titre/mission). */
export function CompanySection({ settings }: { settings?: PublicSettings }) {
    if (!settings?.appName) return null;
    return (
        <section className="relative py-24 lg:py-32 overflow-hidden" style={{ background: "var(--s-forest)", color: "var(--s-bg)" }}>
            <div className="absolute inset-0 blueprint-grid" style={{ opacity: 0.12 }} />
            <div className="max-w-[1200px] mx-auto px-5 lg:px-10 relative z-10 grid lg:grid-cols-[auto_1fr] gap-12 items-center">
                <Reveal direction="right">
                    <div className="cartouche" style={{ padding: 22, background: "rgba(237,232,223,0.06)" }}>
                        {settings.logoUrl ? (
                            <img src={assetUrl(settings.logoUrl)} alt={settings.appName} style={{ width: 120, height: 120, objectFit: "contain" }} />
                        ) : (
                            <div style={{ width: 120, height: 120, display: "grid", placeItems: "center", fontFamily: "var(--s-display)", fontSize: 54, fontWeight: 700, color: "var(--s-brass)" }}>
                                {settings.appName[0]}
                            </div>
                        )}
                    </div>
                </Reveal>
                <div>
                    <span className="kicker" style={{ color: "var(--s-brass)" }}>L'entreprise</span>
                    <h2 className="display-lg mt-4" style={{ color: "var(--s-bg)" }}>
                        <RevealWords text={settings.appName} />
                    </h2>
                    <Reveal>
                        <p className="lead mt-4" style={{ color: "rgba(237,232,223,0.78)", maxWidth: 620, fontFamily: "var(--s-display)", fontStyle: "italic", fontSize: "clamp(1.3rem,2.5vw,1.9rem)", lineHeight: 1.4 }}>
                            « {settings.mainTitle} »
                        </p>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
