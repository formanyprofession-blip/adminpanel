const STATUS_STYLES = {
  Pending: { bg: "var(--badge-pending-bg)", text: "var(--badge-pending-text)" },
  Processing: { bg: "var(--color-accent-info-soft)", text: "var(--color-accent-info)" },
  Shipped: { bg: "var(--badge-shipped-bg)", text: "var(--badge-shipped-text)" },
  Delivered: { bg: "var(--badge-delivered-bg)", text: "var(--badge-delivered-text)" },
  Cancelled: { bg: "var(--color-accent-danger-soft)", text: "var(--color-accent-danger)" },
  Paid: { bg: "var(--badge-delivered-bg)", text: "var(--badge-delivered-text)" },
  Failed: { bg: "var(--color-accent-danger-soft)", text: "var(--color-accent-danger)" },
  Refunded: { bg: "var(--color-accent-warning-soft)", text: "var(--color-accent-warning)" },
  active: { bg: "var(--badge-delivered-bg)", text: "var(--badge-delivered-text)" },
  inactive: { bg: "var(--color-accent-danger-soft)", text: "var(--color-accent-danger)" },
  admin: { bg: "var(--color-brand-soft)", text: "var(--color-brand-light)" },
  user: { bg: "var(--color-surface-hover)", text: "var(--color-content-sub)" },
};

export default function Badge({ status }) {
  const style = STATUS_STYLES[status] || { bg: "var(--color-surface-hover)", text: "var(--color-content-sub)" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}
