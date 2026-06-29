import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "../hooks/useUiHooks";

type Dir = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Dir, { x: number; y: number }> = {
    up: { x: 0, y: 42 }, down: { x: 0, y: -42 },
    left: { x: 42, y: 0 }, right: { x: -42, y: 0 }, none: { x: 0, y: 0 },
};

interface Props {
    children: ReactNode;
    direction?: Dir;
    delay?: number;
    className?: string;
    once?: boolean;
}

/** Reveal au scroll (clip + translate), neutralisé si reduced-motion. */
export function Reveal({ children, direction = "up", delay = 0, className, once = true }: Props) {
    const reduced = useReducedMotion();
    const o = OFFSET[direction];

    if (reduced) return <div className={className}>{children}</div>;

    return (
        <motion.div
            className={`gpu ${className ?? ""}`}
            initial={{ opacity: 0, x: o.x, y: o.y }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, margin: "-12% 0px -12% 0px" }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

/** Révèle chaque mot d'un titre en cascade. */
export function RevealWords({ text, className }: { text: string; className?: string }) {
    const reduced = useReducedMotion();
    if (reduced) return <span className={className}>{text}</span>;
    return (
        <span className={className} style={{ display: "inline-block" }}>
            {text.split(" ").map((word, i) => (
                <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
                    <motion.span
                        style={{ display: "inline-block" }}
                        initial={{ y: "110%" }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {word}&nbsp;
                    </motion.span>
                </span>
            ))}
        </span>
    );
}
