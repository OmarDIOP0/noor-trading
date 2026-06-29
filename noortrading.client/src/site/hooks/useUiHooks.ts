import { useEffect, useState } from "react";

/** Respecte prefers-reduced-motion (accessibilité + perf). */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const on = () => setReduced(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);
    return reduced;
}

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    );
    useEffect(() => {
        const mq = window.matchMedia(query);
        const on = () => setMatches(mq.matches);
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, [query]);
    return matches;
}

/** true sur écrans étroits → animations plus sobres, pas de 3D lourde. */
export function useIsMobile(): boolean {
    return useMediaQuery("(max-width: 768px)");
}
