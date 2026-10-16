/**
 * StatsList — Siyahı formatında statistika.
 */

interface StatsListItem {
  label: string;
  value: string | number;
  /** Dəyişiklik (%) */
  change?: number;
  /** Trend ikonu */
  trend?: "up" | "down" | "neutral";
  /** Rəng override */
  color?: string;
}

interface StatsListProps {
  items: StatsListItem[];
  title?: string;
}

export function StatsList({ items, title }: StatsListProps) {
  return (
    <div className="border border-line bg-paper">
      {title && (
        <div className="border-b border-line px-4 py-3">
          <h3 className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
            {title}
          </h3>
        </div>
      )}
      <div className="divide-y divide-line">
        {items.map((item, i) => {
          const trendColor =
            item.trend === "up"
              ? "text-green-600"
              : item.trend === "down"
                ? "text-red-600"
                : "text-muted";

          const trendIcon =
            item.trend === "up" ? "↗" : item.trend === "down" ? "↘" : "→";

          return (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="font-ui text-[13px] text-ink">{item.label}</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-display text-lg"
                  style={item.color ? { color: item.color } : undefined}
                >
                  {item.value}
                </span>
                {item.change !== undefined && (
                  <div className="flex items-center gap-0.5">
                    <span className={`text-sm ${trendColor}`}>{trendIcon}</span>
                    <span className={`font-ui text-[11px] ${trendColor}`}>
                      {item.change > 0 ? "+" : ""}
                      {item.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
