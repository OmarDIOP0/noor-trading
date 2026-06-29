/**
 * SEO de base — React 19 hisse nativement <title>/<meta> dans le <head>.
 * Titre & description dérivés d'AppSettings (jamais en dur).
 */
export function Seo({ title, description, image }: { title: string; description?: string; image?: string }) {
    return (
        <>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            <meta property="og:title" content={title} />
            {description && <meta property="og:description" content={description} />}
            {image && <meta property="og:image" content={image} />}
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
        </>
    );
}
