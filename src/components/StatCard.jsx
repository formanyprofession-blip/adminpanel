export default function StatCard({ label, value, icon: Icon, accent = "var(--color-brand-primary)", trend }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-heading">{value}</p>
          {trend !== undefined && (
            <p className="mt-1 text-xs" style={{ color: trend >= 0 ? "var(--color-accent-success)" : "var(--color-accent-danger)" }}>
              {trend >= 0 ? "+" : ""}
              {trend}% vs last period
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "color-mix(in srgb, " + accent + " 15%, transparent)" }}
          >
            <Icon size={19} style={{ color: accent }} />
          </div>
        )}
      </div>
    </div>
  );
}
