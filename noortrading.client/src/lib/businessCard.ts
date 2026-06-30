/** Données nécessaires à la carte de visite — toutes issues de l'admin (Profil + AppSettings). */
export interface CardData {
    fullName: string;
    title: string;
    photoUrl?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    website: string;
    appName: string;
    logoUrl?: string | null;
}

/** vCard 3.0 encodée dans le QR → scan = enregistrer le contact (régénéré à la volée). */
export function buildVCard(d: CardData): string {
    return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${d.fullName}`,
        d.title ? `TITLE:${d.title}` : "",
        d.phone ? `TEL;TYPE=CELL:${d.phone}` : "",
        d.email ? `EMAIL;TYPE=WORK:${d.email}` : "",
        d.website ? `URL:${d.website}` : "",
        d.location ? `ADR;TYPE=WORK:;;${d.location};;;;` : "",
        d.appName ? `ORG:${d.appName}` : "",
        "END:VCARD",
    ].filter(Boolean).join("\n");
}

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap";

let fontsInjected = false;

/** Garantit que les polices de la charte sont chargées avant la capture (sinon fallback). */
export async function ensureCardFonts(): Promise<void> {
    if (!fontsInjected) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        document.head.appendChild(link);
        fontsInjected = true;
    }
    try {
        await Promise.all([
            document.fonts.load("600 40px Fraunces"),
            document.fonts.load("italic 400 40px Fraunces"),
            document.fonts.load("700 14px 'Space Mono'"),
            document.fonts.load("500 14px 'Hanken Grotesk'"),
            document.fonts.load("700 14px 'Hanken Grotesk'"),
        ]);
        await document.fonts.ready;
    } catch { /* best-effort */ }
}

async function capture(node: HTMLElement, scale = 3): Promise<HTMLCanvasElement> {
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(node, { scale, useCORS: true, backgroundColor: null, logging: false });
}

function triggerDownload(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

/**
 * JPG haute résolution : recto + verso CÔTE À CÔTE dans un seul fichier
 * (les navigateurs bloquent un 2ᵉ téléchargement automatique → un seul fichier
 * fiable, les deux faces séparées par un filet, sans empilement vertical).
 */
export async function exportJpg(recto: HTMLElement, verso: HTMLElement, filename: string): Promise<void> {
    await ensureCardFonts();
    const c1 = await capture(recto);
    const c2 = await capture(verso);
    const gap = Math.round(c1.width * 0.05);
    const out = document.createElement("canvas");
    out.width = c1.width + c2.width + gap;
    out.height = Math.max(c1.height, c2.height);
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#EDE8DF";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(c1, 0, 0);
    ctx.drawImage(c2, c1.width + gap, 0);
    // filet de séparation entre les deux faces
    ctx.strokeStyle = "rgba(28,24,20,0.18)";
    ctx.lineWidth = Math.max(1, Math.round(c1.width * 0.004));
    ctx.beginPath();
    ctx.moveTo(c1.width + gap / 2, out.height * 0.12);
    ctx.lineTo(c1.width + gap / 2, out.height * 0.88);
    ctx.stroke();
    triggerDownload(out.toDataURL("image/jpeg", 0.95), `${filename}.jpg`);
}

/** PDF 85×55 mm, 2 pages (recto / verso) — prêt à imprimer. */
export async function exportPdf(recto: HTMLElement, verso: HTMLElement, filename: string): Promise<void> {
    await ensureCardFonts();
    const { jsPDF } = await import("jspdf");
    const c1 = await capture(recto);
    const c2 = await capture(verso);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [85, 55] });
    pdf.addImage(c1.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 85, 55);
    pdf.addPage([85, 55], "landscape");
    pdf.addImage(c2.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 85, 55);
    pdf.save(`${filename}.pdf`);
}

export function slugName(s: string): string {
    return (s || "carte").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "carte-visite";
}
