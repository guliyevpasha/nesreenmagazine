"use client";

import { useEffect, useRef } from "react";

/** Admin statistikası üçün avtomatik yenilənmə intervalı. */
export const STATS_REFRESH_MS = 15 * 60 * 1000;

/**
 * `refresh` funksiyasını hər 15 dəqiqədən bir çağırır. Tab gizli olanda
 * sorğu göndərmir; tab yenidən görünəndə 15 dəqiqə keçibsə, dərhal yeniləyir.
 */
export function useAutoRefresh(refresh: () => void, enabled = true) {
  const fnRef = useRef(refresh);
  fnRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;
    let lastRun = Date.now();
    const run = () => {
      lastRun = Date.now();
      fnRef.current();
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, STATS_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRun >= STATS_REFRESH_MS) run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}

/** «X vəziyyətinə · hər 15 dəqiqədən bir yenilənir» sətri + «İndi yenilə» düyməsi. */
export function StatsRefreshBar({
  updatedAt,
  refreshing,
  onRefresh,
  className = "",
}: {
  updatedAt: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
  className?: string;
}) {
  if (!updatedAt) return null;
  return (
    <div className={`flex flex-wrap items-center gap-3 font-ui text-[11px] text-muted ${className}`}>
      <span>
        Statistika: {updatedAt.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}{" "}
        vəziyyətinə · hər 15 dəqiqədən bir avtomatik yenilənir
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="border border-line px-2 py-1 uppercase tracking-wide text-ink hover:border-gold disabled:opacity-50"
      >
        {refreshing ? "Yenilənir…" : "↻ İndi yenilə"}
      </button>
    </div>
  );
}
