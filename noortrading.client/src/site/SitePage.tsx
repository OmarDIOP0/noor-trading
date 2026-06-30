import { useEffect, useRef } from "react";
import { usePublicBundle } from "./hooks/usePublicData";
import { publicApi } from "./services/publicApi";
import { Seo } from "./components/Seo";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { TimelineSection } from "./sections/TimelineSection";
import { CompanySection } from "./sections/CompanySection";
import { ServicesSection } from "./sections/ServicesSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { ContactSection } from "./sections/ContactSection";
import { QrSection } from "./sections/QrSection";

export default function SitePage() {
    const { data, isLoading, isError } = usePublicBundle();
    const tracked = useRef(false);

    // Tracking de visite — déclenché seulement quand le backend a répondu
    // (évite un 502 au démarrage en F5). source via ?source=qrcode|direct…
    useEffect(() => {
        if (!data || tracked.current) return;
        tracked.current = true;
        const source = new URLSearchParams(window.location.search).get("source") || "direct";
        publicApi.trackVisit("/", source);
    }, [data]);

    if (isLoading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div style={{ fontFamily: "var(--s-mono)", letterSpacing: "0.3em", color: "var(--s-ink-soft)", fontSize: 13 }}>
                    CHARGEMENT…
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen grid place-items-center px-6 text-center">
                <div>
                    <h1 className="display-md">Portfolio momentanément indisponible</h1>
                    <p className="lead mt-3">Merci de réessayer dans un instant.</p>
                </div>
            </div>
        );
    }

    const { settings, profile, services, timeline } = data;
    const desc = (profile.bio || settings.mainTitle || "").slice(0, 155);

    return (
        <>
            <Seo title={`${profile.fullName || settings.appName} — ${settings.mainTitle}`} description={desc} image={profile.photoUrl ?? settings.logoUrl ?? undefined} />
            <SiteNav settings={settings} />
            <main>
                <HeroSection profile={profile} settings={settings} />
                <AboutSection profile={profile} />
                <TimelineSection entries={timeline} />
                <CompanySection settings={settings} />
                <ServicesSection services={services} />
                <PortfolioSection />
                <ContactSection profile={profile} />
                <QrSection settings={settings} />
            </main>
            <SiteFooter settings={settings} profile={profile} />
        </>
    );
}
