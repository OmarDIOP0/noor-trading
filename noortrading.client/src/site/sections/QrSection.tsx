import { Reveal, RevealWords } from "../components/Reveal";
import { ScanQr } from "../components/ScanQr";
import type { PublicSettings } from "../types";

export function QrSection({ settings }: { settings?: PublicSettings }) {
    if (!settings?.publicUrl) return null;
    return (
        <section className="relative py-24 lg:py-32 concrete">
            <div className="max-w-[1100px] mx-auto px-5 lg:px-10 grid lg:grid-cols-[1fr_auto] gap-12 items-center">
                <div>
                    <span className="plan-index">06 — SIGNATURE</span>
                    <h2 className="display-lg mt-3">
                        <RevealWords text="Gardez ce" /> <span className="italic-accent" style={{ color: "var(--s-clay)" }}><RevealWords text="portfolio." /></span>
                    </h2>
                    <Reveal>
                        <p className="lead mt-4" style={{ maxWidth: 460 }}>
                            Scannez ce cachet technique pour retrouver l'ensemble du portfolio sur votre mobile —
                            ou partagez-le directement.
                        </p>
                        <p style={{ fontFamily: "var(--s-mono)", fontSize: 12.5, color: "var(--s-ink-faint)", marginTop: 18, letterSpacing: "0.05em", wordBreak: "break-all" }}>
                            ↳ {settings.publicUrl}
                        </p>
                    </Reveal>
                </div>
                <Reveal direction="left">
                    <ScanQr url={settings.publicUrl} logoUrl={settings.logoUrl} size={208} />
                </Reveal>
            </div>
        </section>
    );
}
