/**
 * MetricCard — Analytics dashboard üçün statistika kartı.
 * Böyük rəqəm, dəyişiklik göstəricisi və trend ikonu ilə.
 */

interface MetricCardProps {
  label: string;
  value: string | number;
  /** Əvvəlki dövrə nisbətən dəyişiklik (%) */
  change?: number;
  /** Trend ikonu göstər */
  trend?: "up" | "down" | "neutral";
  /** Icon (optional) */
  icon?: string;
  /** Yüklənir statusu */
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon,
  loading,
}: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-muted";

  const trendIcon =
    trend === "up"
      ? "↗"
      : trend === "down"
        ? "↘"
        : "→";

  return (
    <div className="border border-line bg-paper px-6 py-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-line" />
          ) : (
            <p className="mt-2 font-display text-3xl text-ink">{value}</p>
          )}
          {change !== undefined && !loading && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-lg ${trendColor}`}>{trendIcon}</span>
              <span className={`font-ui text-[12px] font-medium ${trendColor}`}>
                {change > 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="font-ui text-[11px] text-muted">əvvəlki dövrə görə</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
