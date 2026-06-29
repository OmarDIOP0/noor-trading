import { useRef, type ReactNode, type MouseEvent, type ElementType } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "../hooks/useUiHooks";

interface Props {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    as?: "button" | "a";
    href?: string;
    strength?: number;
}

/** Bouton « magnétique » : suit légèrement le curseur (désactivé si reduced-motion). */
export function MagneticButton({ children, className, onClick, as = "button", href, strength = 0.4 }: Props) {
    const reduced = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 15 });
    const sy = useSpring(y, { stiffness: 200, damping: 15 });

    function onMove(e: MouseEvent) {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
    }
    function onLeave() { x.set(0); y.set(0); }

    // union a/button → typage relâché pour accepter href conditionnel
    const Inner: ElementType = as === "a" ? motion.a : motion.button;

    return (
        <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy, display: "inline-block" }}>
            <Inner className={className} onClick={onClick} href={href} {...(as === "a" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
            </Inner>
        </motion.div>
    );
}
