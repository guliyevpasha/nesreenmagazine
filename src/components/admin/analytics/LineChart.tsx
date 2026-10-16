"use client";

/**
 * Modern LineChart — Gradient fills, smooth curves, interactive tooltips
 * NewsPilot style with enhanced visuals
 */

import { useEffect, useRef, useState } from "react";

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showGrid?: boolean;
  showPoints?: boolean;
  smooth?: boolean;
  fillArea?: boolean;
}

export function LineChart({
  data,
  height = 240,
  color = "#9333ea",
  gradientFrom = "#9333ea",
  gradientTo = "#ec4899",
  showGrid = true,
  showPoints = true,
  smooth = true,
  fillArea = true,
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

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

    const padding = 50;
    const width = rect.width;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const valueRange = maxValue - minValue || 1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;

      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const value = maxValue - (valueRange / 5) * i;
        ctx.fillStyle = "#64748b";
        ctx.font = "11px ui-sans-serif, system-ui";
        ctx.textAlign = "right";
        ctx.fillText(Math.round(value).toString(), padding - 12, y + 4);
      }
    }

    // Calculate points
    const points = data.map((point, i) => {
      const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * i;
      const y =
        padding +
        chartHeight -
        ((point.value - minValue) / valueRange) * chartHeight;
      return { x, y, value: point.value, label: point.label };
    });

    // Gradient fill under line
    if (fillArea && points.length > 0) {
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, gradientFrom + "40");
      gradient.addColorStop(1, gradientTo + "05");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(points[0].x, height - padding);
      
      if (smooth && points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      } else {
        points.forEach((point) => ctx.lineTo(point.x, point.y));
      }
      
      ctx.lineTo(points[points.length - 1].x, height - padding);
      ctx.closePath();
      ctx.fill();
    }

    // Line with gradient
    const lineGradient = ctx.createLinearGradient(padding, 0, width - padding, 0);
    lineGradient.addColorStop(0, gradientFrom);
    lineGradient.addColorStop(1, gradientTo);

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    if (smooth && points.length > 2) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    } else {
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
    }
    ctx.stroke();

    // Points with glow effect
    if (showPoints) {
      points.forEach((point) => {
        // Outer glow
        ctx.fillStyle = gradientFrom + "30";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Main point
        const pointGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 6);
        pointGradient.addColorStop(0, "#fff");
        pointGradient.addColorStop(0.5, gradientFrom);
        pointGradient.addColorStop(1, gradientTo);
        
        ctx.fillStyle = pointGradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Inner white dot
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // X-axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px ui-sans-serif, system-ui";
    ctx.textAlign = "center";

    data.forEach((point, i) => {
      if (data.length > 12 && i % 2 !== 0) return;
      const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * i;
      ctx.fillText(point.label.length > 8 ? point.label.slice(0, 8) + "..." : point.label, x, height - 15);
    });
  }, [data, height, color, gradientFrom, gradientTo, showGrid, showPoints, smooth, fillArea]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = 50;
    const chartWidth = rect.width - padding * 2;

    // Find nearest point
    const pointIndex = Math.round(((x - padding) / chartWidth) * (data.length - 1));
    
    if (pointIndex >= 0 && pointIndex < data.length) {
      const point = data[pointIndex];
      const chartHeight = height - padding * 2;
      const maxValue = Math.max(...data.map((d) => d.value), 1);
      const minValue = Math.min(...data.map((d) => d.value), 0);
      const valueRange = maxValue - minValue || 1;
      
      const pointX = padding + (chartWidth / Math.max(data.length - 1, 1)) * pointIndex;
      const pointY = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;

      setTooltip({
        x: pointX,
        y: pointY,
        value: point.value,
        label: point.label,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50"
        style={{ height }}
      >
        <p className="font-ui text-[12px] text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: "100%", height }}
        className="rounded-lg border border-slate-200 bg-white shadow-sm cursor-crosshair"
      />
      
      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xl"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 60}px`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-ui text-[11px] font-medium text-slate-900">{tooltip.label}</p>
          <p className="font-display text-lg font-bold text-purple-600">{tooltip.value.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
