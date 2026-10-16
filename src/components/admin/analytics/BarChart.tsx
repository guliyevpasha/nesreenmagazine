"use client";

/**
 * BarChart — Sadə sütun diaqramı.
 */

import { useEffect, useRef } from "react";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  defaultColor?: string;
}

export function BarChart({
  data,
  height = 200,
  defaultColor = "#8B2635",
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = 40;
    const width = rect.width;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // Bars
    const barWidth = chartWidth / data.length - 10;
    const barSpacing = 10;

    data.forEach((point, i) => {
      const barHeight = (point.value / maxValue) * chartHeight;
      const x = padding + i * (barWidth + barSpacing);
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = point.color || defaultColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value on top
      ctx.fillStyle = "#2C2C2C";
      ctx.font = "11px ui-sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5);
    });

    // X-axis labels
    ctx.fillStyle = "#8B8B8B";
    ctx.font = "10px ui-sans-serif";
    ctx.textAlign = "center";

    data.forEach((point, i) => {
      const x = padding + i * (barWidth + barSpacing) + barWidth / 2;
      const label = point.label.length > 12 ? point.label.slice(0, 10) + "…" : point.label;
      ctx.fillText(label, x, height - 10);
    });
  }, [data, height, defaultColor]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center border border-line bg-paper"
        style={{ height }}
      >
        <p className="font-ui text-[12px] text-muted">Məlumat yoxdur</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height }}
      className="border border-line bg-paper"
    />
  );
}
