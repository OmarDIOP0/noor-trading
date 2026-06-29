import { useEffect, type RefObject } from "react";

/** Appelle <paramref name="handler"/> au clic / touch hors de l'élément référencé. */
export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: () => void,
    active = true
) {
    useEffect(() => {
        if (!active) return;
        const onDown = (e: MouseEvent | TouchEvent) => {
            const el = ref.current;
            if (el && !el.contains(e.target as Node)) handler();
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("touchstart", onDown);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("touchstart", onDown);
        };
    }, [ref, handler, active]);
}
