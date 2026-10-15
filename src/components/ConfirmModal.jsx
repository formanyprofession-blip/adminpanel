import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: danger ? "var(--color-accent-danger-soft)" : "var(--color-accent-warning-soft)",
          }}
        >
          <AlertTriangle
            size={18}
            style={{ color: danger ? "var(--color-accent-danger)" : "var(--color-accent-warning)" }}
          />
        </div>
        <p className="text-sm text-body">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
