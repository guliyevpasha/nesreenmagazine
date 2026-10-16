"use client";

/**
 * Modern BarChart — Gradient bars with rounded corners and animations
 * NewsPilot style with enhanced visuals
 */

import { useEffect, useRef, useState } from "react";

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  defaultGradientFrom?: string;
  defaultGradientTo?: string;
}

export function BarChart({
  data,
  height = 240,
  defaultGradientFrom = "#9333ea",
  defaultGradientTo = "#ec4899",
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (maxValue / 5) * i;
      ctx.fillStyle = "#64748b";
      ctx.font = "11px ui-sans-serif, system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(value).toString(), padding - 12, y + 4);
    }

    // Bars with gradients and rounded corners
    const barWidth = Math.min(chartWidth / data.length - 16, 60);
    const barSpacing = (chartWidth - barWidth * data.length) / (data.length + 1);

    data.forEach((point, i) => {
      const barHeight = (point.value / maxValue) * chartHeight;
      const x = padding + barSpacing + i * (barWidth + barSpacing);
      const y = padding + chartHeight - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, point.gradientFrom || defaultGradientFrom);
      gradient.addColorStop(1, point.gradientTo || defaultGradientTo);

      // Shadow effect
      ctx.shadowColor = (point.gradientFrom || defaultGradientFrom) + "40";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;

      // Draw rounded bar
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = 6;
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.lineTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Value on top with background
      const valueText = point.value.toLocaleString();
      ctx.font = "bold 12px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      const textWidth = ctx.measureText(valueText).width;
      
      // Background pill
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(x + barWidth / 2 - textWidth / 2 - 6, y - 24, textWidth + 12, 18, 9);
      ctx.fill();
      
      // Value text
      ctx.fillStyle = point.gradientFrom || defaultGradientFrom;
      ctx.fillText(valueText, x + barWidth / 2, y - 11);
    });

    // X-axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "11px ui-sans-serif, system-ui";
    ctx.textAlign = "center";

    data.forEach((point, i) => {
      const x = padding + barSpacing + i * (barWidth + barSpacing) + barWidth / 2;
      const label = point.label.length > 10 ? point.label.slice(0, 9) + "…" : point.label;
      ctx.fillText(label, x, height - 15);
    });
  }, [data, height, defaultGradientFrom, defaultGradientTo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const padding = 50;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = Math.min(chartWidth / data.length - 16, 60);
    const barSpacing = (chartWidth - barWidth * data.length) / (data.length + 1);
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // Check if hovering over a bar
    for (let i = 0; i < data.length; i++) {
      const barX = padding + barSpacing + i * (barWidth + barSpacing);
      const barHeight = (data[i].value / maxValue) * chartHeight;
      const barY = padding + chartHeight - barHeight;

      if (x >= barX && x <= barX + barWidth && y >= barY && y <= padding + chartHeight) {
        setTooltip({
          x: barX + barWidth / 2,
          y: barY,
          value: data[i].value,
          label: data[i].label,
        });
        return;
      }
    }

    setTooltip(null);
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
    <div className="relative">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: "100%", height }}
        className="rounded-lg border border-slate-200 bg-white shadow-sm cursor-pointer"
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
