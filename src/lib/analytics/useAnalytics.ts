/**
 * useAnalytics hook
 * Next.js səhifələrində tracking üçün istifadə olunur.
 */

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics } from "./tracker";
import type { Locale } from "@/lib/types";

interface UseAnalyticsParams {
  locale: Locale;
  articleId?: string;
  articleTitle?: string;
  category?: string;
}

/**
 * Analytics tracking hook.
 * 
 * @example
 * ```tsx
 * // Layout-da
 * useAnalytics({ locale });
 * 
 * // Məqalə səhifəsində
 * useAnalytics({ 
 *   locale, 
 *   articleId: article.id,
 *   articleTitle: article.title[locale],
 *   category: article.category 
 * });
 * ```
 */
export function useAnalytics(params: UseAnalyticsParams) {
  const pathname = usePathname();

  useEffect(() => {
    // Yalnız client-side
    if (typeof window === "undefined") return;

    // Admin səhifələrini track etmə
    if (pathname?.startsWith("/admin")) return;

    // Analytics-i initialize et
    initAnalytics({
      path: pathname || "/",
      locale: params.locale,
      articleId: params.articleId,
      articleTitle: params.articleTitle,
      category: params.category,
    });
  }, [pathname, params.locale, params.articleId, params.articleTitle, params.category]);
}
