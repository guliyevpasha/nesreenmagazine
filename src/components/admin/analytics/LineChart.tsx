"use client";

/**
 * LineChart — Sadə xətt diaqramı (lightweight, canvas-based).
 * Dependency-siz, yüngül implementasiya.
 */

import { useEffect, useRef } from "react";

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}

export function LineChart({
  data,
  height = 200,
  color = "#8B2635",
  showGrid = true,
  showPoints = true,
}: LineChartProps) {
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
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const valueRange = maxValue - minValue || 1;

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "#E8E4E1";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const value = maxValue - (valueRange / 4) * i;
        ctx.fillStyle = "#8B8B8B";
        ctx.font = "10px ui-sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
      }
    }

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    data.forEach((point, i) => {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y =
        padding +
        chartHeight -
        ((point.value - minValue) / valueRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Points
    if (showPoints) {
      data.forEach((point, i) => {
        const x = padding + (chartWidth / (data.length - 1)) * i;
        const y =
          padding +
          chartHeight -
          ((point.value - minValue) / valueRange) * chartHeight;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // X-axis labels
    ctx.fillStyle = "#8B8B8B";
    ctx.font = "10px ui-sans-serif";
    ctx.textAlign = "center";

    data.forEach((point, i) => {
      if (data.length > 15 && i % 2 !== 0) return; // Skip labels if too many
      const x = padding + (chartWidth / (data.length - 1)) * i;
      ctx.fillText(point.label, x, height - 10);
    });
  }, [data, height, color, showGrid, showPoints]);

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
