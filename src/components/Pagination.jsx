import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || (p >= page - windowSize && p <= page + windowSize)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3.5 sm:flex-row" style={{ borderColor: "var(--color-surface-border)" }}>
      <p className="text-xs text-muted">
        Showing <span className="font-medium text-body">{start}</span>–<span className="font-medium text-body">{end}</span> of{" "}
        <span className="font-medium text-body">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          className="rounded-md p-1.5 text-muted hover:bg-panel-hover disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="min-w-[28px] rounded-md px-2 py-1 text-xs font-medium"
              style={
                p === page
                  ? { backgroundColor: "var(--color-brand-primary)", color: "white" }
                  : { color: "var(--color-content-sub)" }
              }
            >
              {p}
            </button>
          )
        )}
        <button
          className="rounded-md p-1.5 text-muted hover:bg-panel-hover disabled:opacity-40 disabled:hover:bg-transparent"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
