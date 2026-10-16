"use client";

/**
 * PieChart — Dairəvi diaqram (Pie chart).
 */

import { useEffect, useRef } from "react";

export interface PieChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  size?: number;
  showLegend?: boolean;
}

export function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) * 0.7;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((segment) => {
      const sliceAngle = (segment.value / total) * Math.PI * 2;

      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });
  }, [data, size]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-line bg-paper"
        style={{ width: size, height: size }}
      >
        <p className="font-ui text-[12px] text-muted">Məlumat yoxdur</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="border border-line bg-paper"
      />
      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {data.map((segment, i) => {
            const percentage = ((segment.value / total) * 100).toFixed(1);
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-[11px] text-ink">
                    {segment.label}
                  </p>
                  <p className="font-ui text-[10px] text-muted">
                    {segment.value} ({percentage}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
