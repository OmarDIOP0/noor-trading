import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: number;
}

export function AdminModal({ open, onClose, title, icon, children, footer, maxWidth = 560 }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="admin-modal-backdrop admin-scope" onMouseDown={onClose}>
            <div
                className="admin-modal-container scrollbar-thin"
                style={{ maxWidth }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {(title || icon) && (
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-3">
                            {icon}
                            {title && <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{title}</h3>}
                        </div>
                        <button onClick={onClose} className="admin-btn-ghost" style={{ height: 34, width: 34, padding: 0 }} aria-label="Fermer">
                            <X size={18} />
                        </button>
                    </div>
                )}
                <div className="px-5 py-4 overflow-y-auto scrollbar-thin">{children}</div>
                {footer && (
                    <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
