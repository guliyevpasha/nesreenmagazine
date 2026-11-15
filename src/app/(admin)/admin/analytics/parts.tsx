"use client";

/**
 * Analitika səhifəsinin kiçik vizual hissələri (kart, siyahı-bar, trend qrafiki).
 */

import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: ReactNode;
}) {
  return (
    <div className="border border-line bg-paper px-5 py-4">
      <p className="flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
        {accent}
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 font-ui text-[11px] text-gold">{hint}</p>}
    </div>
  );
}

export function LiveDot() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
    </span>
  );
}

/** Ad + bar + rəqəm + faiz sətirləri. */
export function BarList({
  rows,
  empty = "Bu dövr üçün məlumat yoxdur",
  extraHeader,
}: {
  rows: { key: string; label: ReactNode; value: number; extra?: ReactNode; sub?: ReactNode }[];
  empty?: string;
  extraHeader?: string;
}) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0 || total === 0) {
    return <p className="py-6 text-center font-ui text-[12px] text-muted">{empty}</p>;
  }
  return (
    <div className="space-y-2.5">
      {extraHeader && (
        <div className="flex justify-end gap-3 font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
          <span className="w-16 text-right">Say</span>
          <span className="w-20 text-right">{extraHeader}</span>
        </div>
      )}
      {rows.map((r) => (
        <div key={r.key} className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-ui text-[13px] text-ink">{r.label}</span>
                <span className="shrink-0 font-ui text-[11px] text-muted">
                  {((r.value / total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-cream">
                <div className="h-full bg-bordo/60" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              {r.sub && <div className="mt-0.5 truncate font-ui text-[11px] text-muted">{r.sub}</div>}
            </div>
            <span className="w-16 shrink-0 text-right font-ui text-[13px] text-ink">
              {r.value.toLocaleString("az-AZ")}
            </span>
            {extraHeader !== undefined && (
              <span className="w-20 shrink-0 text-right font-ui text-[12px] text-muted">{r.extra}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface TrendPoint {
  key: string;
  label: string;
  title: string;
  articleViews: number;
  pageViews: number;
}

/** İki seriyalı sütun qrafiki: məqalə baxışı və səhifə baxışı. */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return <p className="py-10 text-center font-ui text-[12px] text-muted">Bu dövr üçün məlumat yoxdur</p>;
  }
  const max = Math.max(1, ...points.map((p) => Math.max(p.articleViews, p.pageViews)));
  const labelEvery = Math.max(1, Math.ceil(points.length / 10));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 font-ui text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-bordo" /> Məqalə baxışı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-gold" /> Səhifə baxışı (bütün sayt)
        </span>
      </div>
      <div className="flex h-48 items-end gap-[2px] border-b border-line">
        {points.map((p) => (
          <div
            key={p.key}
            className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-[1px]"
            title={`${p.title}\nMəqalə baxışı: ${p.articleViews}\nSəhifə baxışı: ${p.pageViews}`}
          >
            <div className="w-1/2 max-w-[14px] bg-bordo/80" style={{ height: `${(p.articleViews / max) * 100}%` }} />
            <div className="w-1/2 max-w-[14px] bg-gold/80" style={{ height: `${(p.pageViews / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px]">
        {points.map((p, i) => (
          <div key={p.key} className="min-w-0 flex-1 overflow-visible text-center font-ui text-[10px] text-muted">
            {i % labelEvery === 0 ? <span className="whitespace-nowrap">{p.label}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-3 py-3 font-ui text-[11px] uppercase tracking-[0.14em] text-muted ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
