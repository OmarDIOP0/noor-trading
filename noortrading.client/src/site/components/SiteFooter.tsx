import { ScanQr } from "./ScanQr";
import type { PublicProfile, PublicSettings } from "../types";

export function SiteFooter({ settings, profile }: { settings?: PublicSettings; profile?: PublicProfile }) {
    const year = new Date().getFullYear();
    return (
        <footer className="blueprint-grid-fine" style={{ background: "var(--s-ink)", color: "var(--s-bg)" }}>
            <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-16 grid gap-12 lg:grid-cols-[1.4fr_1fr_auto]">
                <div>
                    <h3 className="display-md" style={{ color: "var(--s-bg)", marginBottom: 12 }}>
                        {profile?.fullName ?? settings?.appName}
                    </h3>
                    <p className="lead" style={{ color: "rgba(237,232,223,0.7)", maxWidth: 360 }}>
                        {settings?.mainTitle}
                    </p>
                </div>

                <div className="flex flex-col gap-2.5" style={{ fontSize: 14.5 }}>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.2em", color: "var(--s-brass)", textTransform: "uppercase", marginBottom: 6 }}>Contact</span>
                    {profile?.email && <a href={`mailto:${profile.email}`} style={{ color: "rgba(237,232,223,0.85)" }}>{profile.email}</a>}
                    {profile?.phone && <a href={`tel:${profile.phone}`} style={{ color: "rgba(237,232,223,0.85)" }}>{profile.phone}</a>}
                    {profile?.location && <span style={{ color: "rgba(237,232,223,0.6)" }}>{profile.location}</span>}
                    <div className="flex gap-4 mt-3">
                        {profile?.socialLinks?.map((s) => (
                            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline" style={{ color: "var(--s-brass)", fontSize: 13.5 }}>
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                {settings?.publicUrl && (
                    <div className="u-deco">
                        <ScanQr url={settings.publicUrl} logoUrl={settings.logoUrl} size={132} />
                    </div>
                )}
            </div>
            <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-5" style={{ borderTop: "1px solid rgba(237,232,223,0.12)", fontFamily: "var(--s-mono)", fontSize: 11.5, color: "rgba(237,232,223,0.5)", letterSpacing: "0.05em" }}>
                © {year} {settings?.appName} — Génie Civil & Décoration d'intérieur
            </div>
        </footer>
    );
}
