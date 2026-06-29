interface Props {
    variant?: "card" | "text" | "page" | "stat";
    rows?: number;
    className?: string;
}

export function LoadingSkeleton({ variant = "text", rows = 3, className }: Props) {
    if (variant === "page") {
        return (
            <div className={`p-6 lg:p-8 space-y-6 ${className ?? ""}`}>
                <div className="skeleton" style={{ height: 40, width: 280 }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
                </div>
                <div className="skeleton" style={{ height: 280 }} />
            </div>
        );
    }
    if (variant === "card" || variant === "stat") {
        return <div className={`skeleton ${className ?? ""}`} style={{ height: variant === "stat" ? 120 : 160 }} />;
    }
    return (
        <div className={`space-y-2.5 ${className ?? ""}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 14, width: `${90 - i * 8}%` }} />
            ))}
        </div>
    );
}
