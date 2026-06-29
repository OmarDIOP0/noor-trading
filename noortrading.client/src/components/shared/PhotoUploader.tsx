import { useRef, useState } from "react";
import { Upload, Trash2, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { assetUrl } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface Props {
    currentUrl?: string | null;
    onUpload: (file: File) => Promise<unknown>;
    onRemove?: () => void;
    shape?: "circle" | "square";
    label?: string;
    size?: number;
}

export function PhotoUploader({ currentUrl, onUpload, onRemove, shape = "square", label = "Téléverser une image", size = 128 }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    function validate(file: File): boolean {
        if (!ACCEPTED.includes(file.type)) {
            toast.error("Format non supporté (jpg, png ou webp).");
            return false;
        }
        if (file.size > MAX_BYTES) {
            toast.error("Image trop volumineuse (max 5 Mo).");
            return false;
        }
        return true;
    }

    async function handleFile(file: File) {
        if (!validate(file)) return;
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);          // aperçu immédiat avant fin d'upload
        setBusy(true);
        try {
            await onUpload(file);
            toast.success("Image mise à jour.");
        } catch (e) {
            toast.error((e as Error).message);
            setPreview(null);
        } finally {
            setBusy(false);
            URL.revokeObjectURL(localUrl);
        }
    }

    const shown = preview ?? assetUrl(currentUrl);
    const radius = shape === "circle" ? "9999px" : "14px";

    return (
        <div className="flex items-center gap-4">
            <div
                onClick={() => !busy && inputRef.current?.click()}
                className="relative flex items-center justify-center cursor-pointer overflow-hidden admin-card"
                style={{ width: size, height: size, borderRadius: radius, borderStyle: shown ? "solid" : "dashed" }}
            >
                {shown ? (
                    <img src={shown} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <ImageIcon size={28} style={{ color: "var(--ink-faint)" }} />
                )}
                {busy && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(20,32,43,0.45)" }}>
                        <Loader2 className="animate-spin" size={24} color="#fff" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <button type="button" className="admin-btn-outline" onClick={() => inputRef.current?.click()} disabled={busy}>
                    <Upload size={16} /> {label}
                </button>
                {shown && onRemove && (
                    <button type="button" className="admin-btn-ghost" style={{ color: "var(--danger)" }} onClick={() => { setPreview(null); onRemove(); }} disabled={busy}>
                        <Trash2 size={16} /> Retirer
                    </button>
                )}
                <p style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>JPG, PNG ou WebP · 5 Mo max</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
