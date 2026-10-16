/**
 * ProgressBar — Progress göstəricisi (analytics üçün).
 */

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  label,
  value,
  max,
  color = "#8B2635",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-ui text-[12px] text-ink">{label}</span>
        {showPercentage && (
          <span className="font-ui text-[11px] text-muted">
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-ui text-[10px] text-muted">
          {value.toLocaleString()}
        </span>
        <span className="font-ui text-[10px] text-muted">
          {max.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
