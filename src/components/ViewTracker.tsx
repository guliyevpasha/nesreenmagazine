"use client";

import { useEffect } from "react";
import { getVisitorId, isStaffBrowser } from "@/lib/analytics/tracker";

interface ViewTrackerProps {
  articleId: string;
  slug: string;
  category: string;
}

/**
 * Məqalə baxışını qeyd edir (analytics_daily / analytics_totals).
 * Admin panelə daxil olmuş brauzer (işçi) sayılmır.
 */
export default function ViewTracker({ articleId, slug, category }: ViewTrackerProps) {
  useEffect(() => {
    if (isStaffBrowser()) return;

    const trackView = () => {
      void fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          slug,
          category,
          visitorId: getVisitorId(),
          referrer: document.referrer,
        }),
        keepalive: true,
      }).catch(() => undefined);
    };

    // 1 saniyə: səhifəni dərhal bağlayanlar və StrictMode təkrarı sayılmasın
    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [articleId, slug, category]);

  return null;
}
