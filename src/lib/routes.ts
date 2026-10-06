import type { CategorySlug } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";

/**
 * Saytın bütün daxili ünvanları.
 * Ünvanlar bütün dillərdə eynidir, yalnız önündəki dil kodu dəyişir:
 *   /az/moda/payiz-2026-siluetler
 *   /ar/moda/payiz-2026-siluetler
 */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  category: (locale: Locale, category: CategorySlug) => `/${locale}/${category}`,
  subcategory: (locale: Locale, category: CategorySlug, subcategory: string) =>
    `/${locale}/${category}/bolme/${subcategory}`,
  article: (locale: Locale, category: CategorySlug, slug: string) =>
    `/${locale}/${category}/${slug}`,
  astrology: (locale: Locale) => `/${locale}/astrologiya`,
  zodiac: (locale: Locale, sign: string) => `/${locale}/astrologiya/burc/${sign}`,
  contact: (locale: Locale) => `/${locale}/elaqe`,
  subscribe: (locale: Locale) => `/${locale}/abunelik`,
  issues: (locale: Locale) => `/${locale}/jurnallar`,
  ejournal: (locale: Locale) => `/${locale}/e-jurnal`,
  selected: (locale: Locale) => `/${locale}/secilenler`,
  about: (locale: Locale) => `/${locale}/haqqimizda`,
  partnership: (locale: Locale) => `/${locale}/emekdasliq`,
  privacy: (locale: Locale) => `/${locale}/mexfilik`,
  terms: (locale: Locale) => `/${locale}/sertler`,
  admin: () => "/admin",
} as const;

/** Dil dəyişdirildikdə eyni səhifədə qalmaq üçün yolun dil hissəsini əvəz edir. */
export function swapLocale(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${nextLocale}`;
  segments[0] = nextLocale;
  return `/${segments.join("/")}`;
}
