"use client";

/**
 * ArticleAnalyticsTracker
 * Məqalə səhifələrində xüsusi tracking.
 */

import { useEffect } from "react";
import { trackPage } from "@/lib/analytics";
import type { Locale } from "@/lib/types";

interface ArticleAnalyticsTrackerProps {
  articleId: string;
  articleTitle: string;
  category: string;
  locale: Locale;
}

export default function ArticleAnalyticsTracker({
  articleId,
  articleTitle,
  category,
  locale,
}: ArticleAnalyticsTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const path = window.location.pathname;
    
    // Track article view
    trackPage({
      path,
      articleId,
      articleTitle,
      category,
      locale,
    });
  }, [articleId, articleTitle, category, locale]);

  return null; // Bu komponent heç nə render etmir
}
