import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl border shadow-xl`}
        style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="sticky top-0 flex items-center justify-between border-b px-5 py-4"
          style={{ backgroundColor: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
        >
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-panel-hover focus-ring"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
