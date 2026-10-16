"use client";

/**
 * AnalyticsProvider
 * Saytın bütün səhifələrində analytics tracking-i aktivləşdirir.
 */

import { useAnalytics } from "@/lib/analytics";
import type { Locale } from "@/lib/types";

interface AnalyticsProviderProps {
  locale: Locale;
}

export default function AnalyticsProvider({ locale }: AnalyticsProviderProps) {
  useAnalytics({ locale });
  
  return null; // Bu komponent heç nə render etmir
}
