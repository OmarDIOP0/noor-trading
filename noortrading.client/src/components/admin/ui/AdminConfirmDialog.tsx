import { AlertTriangle } from "lucide-react";
import { AdminModal } from "./AdminModal";
import { AdminIcon } from "./AdminIcon";

interface Props {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export function AdminConfirmDialog({
    open, title = "Confirmer", message,
    confirmLabel = "Confirmer", cancelLabel = "Annuler",
    danger = true, loading = false, onConfirm, onClose,
}: Props) {
    return (
        <AdminModal
            open={open}
            onClose={onClose}
            title={title}
            icon={<AdminIcon icon={AlertTriangle} color={danger ? "red" : "amber"} size="md" />}
            maxWidth={440}
            footer={
                <>
                    <button className="admin-btn-outline" onClick={onClose} disabled={loading}>{cancelLabel}</button>
                    <button className={danger ? "admin-btn-danger" : "admin-btn-primary"} onClick={onConfirm} disabled={loading}>
                        {loading ? "…" : confirmLabel}
                    </button>
                </>
            }
        >
            <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>{message}</p>
        </AdminModal>
    );
}
