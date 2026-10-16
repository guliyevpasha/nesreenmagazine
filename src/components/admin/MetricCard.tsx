/**
 * Modern Metric Card - NewsPilot style
 * Colorful badge icons with smooth animations
 */
"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  href?: string;
  color?: "purple" | "pink" | "blue" | "green" | "orange" | "red" | "yellow";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const colorClasses = {
  purple: "from-bordo to-bordo-soft bg-bordo/10 text-bordo",
  pink: "from-gold to-gold-soft bg-gold/10 text-gold",
  blue: "from-bordo-deep to-bordo bg-bordo/15 text-bordo-deep",
  green: "from-bordo-soft to-bordo bg-bordo/10 text-bordo-deep",
  orange: "from-gold-soft to-gold bg-gold/10 text-gold",
  red: "from-bordo-deep to-bordo bg-bordo/20 text-bordo-deep",
  yellow: "from-gold to-bordo-soft bg-cream text-bordo",
};

export default function MetricCard({
  label,
  value,
  icon,
  href,
  color = "purple",
  trend,
  loading = false,
}: MetricCardProps) {
  const gradientClass = colorClasses[color].split(" ")[0] + " " + colorClasses[color].split(" ")[1];
  const bgClass = colorClasses[color].split(" ")[2];
  const textClass = colorClasses[color].split(" ")[3];

  const content = (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 active:translate-y-0">
      {/* Icon badge */}
      <div className={`inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradientClass} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        {icon ? (
          <div className="text-white text-lg sm:text-xl">{icon}</div>
        ) : (
          <div className="text-white text-lg sm:text-xl font-bold">📊</div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 sm:mt-4">
        <p className="font-ui text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
          {label}
        </p>
        <p className={`mt-1.5 sm:mt-2 font-display text-2xl sm:text-3xl font-bold ${textClass} transition-all duration-300 group-hover:scale-105`}>
          {loading ? (
            <span className="inline-block h-7 sm:h-8 w-16 sm:w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            value
          )}
        </p>

        {/* Trend indicator */}
        {trend && !loading && (
          <div className={`mt-1.5 sm:mt-2 flex items-center gap-1 font-ui text-[10px] sm:text-[11px] font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            <svg
              viewBox="0 0 24 24"
              className={`h-3 w-3 transition-transform ${trend.isPositive ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
            <span>{Math.abs(trend.value)}%</span>
            <span className="hidden sm:inline text-slate-400">vs last month</span>
          </div>
        )}
      </div>

      {/* Hover arrow */}
      {href && (
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 sm:h-5 sm:w-5 ${textClass}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Decorative background pattern */}
      <div className={`absolute -right-4 -top-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full ${bgClass} opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl`} />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Predefined icons for common metrics
export const MetricIcons = {
  articles: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  drafts: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
    </svg>
  ),
  subscribers: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18M8 17V9M13 17V5M18 17v-3" />
    </svg>
  ),
};
