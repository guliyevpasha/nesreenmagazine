/**
 * Article köməkçi funksiyaları
 * 
 * Bu funksiyalar məqalə məlumatlarını oxumaq və emal etmək üçün type-safe yollar təmin edir.
 */

import type { Article, LocalizedText } from "./types";
import type { Locale } from "./i18n/config";

/**
 * Məqalənin başlığını oxu (type-safe)
 * 
 * Köhnə formatlı məqalələrdə title string ola bilər,
 * yeni formatlarda LocalizedText obyektidir.
 */
export function getArticleTitle(article: Article, locale: Locale = "az"): string {
  if (!article.title) return article.slug || "Başlıqsız";
  
  // Type guard - string yoxsa LocalizedText?
  if (typeof article.title === "string") {
    return article.title;
  }
  
  // LocalizedText obyektindən oxu
  return article.title[locale] || article.title.az || article.title.en || article.slug || "Başlıqsız";
}

/**
 * Məqalənin excerpt-ini oxu (type-safe)
 */
export function getArticleExcerpt(article: Article, locale: Locale = "az"): string {
  if (!article.excerpt) return "";
  
  if (typeof article.excerpt === "string") {
    return article.excerpt;
  }
  
  return article.excerpt[locale] || article.excerpt.az || article.excerpt.en || "";
}

/**
 * Məqalənin body-sini oxu (type-safe)
 */
export function getArticleBody(article: Article, locale: Locale = "az"): string {
  if (!article.body) return "";
  
  if (typeof article.body === "string") {
    return article.body;
  }
  
  return article.body[locale] || article.body.az || article.body.en || "";
}

/**
 * Məqalənin slug-unu oxu (type-safe)
 */
export function getArticleSlug(article: Article, locale: Locale = "az"): string {
  if (!article.slug) return "";
  
  // slug həmişə string olmalıdır Article type-ında
  return String(article.slug);
}

/**
 * Məqalənin bütün mövcud tərcümələrini yoxla
 */
export function getAvailableLocales(article: Article): Locale[] {
  const locales: Locale[] = ["az", "en", "ru", "tr"];
  return locales.filter((locale) => {
    if (typeof article.title === "string") return false;
    if (typeof article.body === "string") return false;
    return Boolean(article.title?.[locale]?.trim() && article.body?.[locale]?.trim());
  });
}

/**
 * Məqalənin müəyyən dildə tam olub-olmadığını yoxla
 */
export function isArticleComplete(article: Article, locale: Locale): boolean {
  const title = getArticleTitle(article, locale);
  const body = getArticleBody(article, locale);
  return Boolean(title.trim() && body.trim());
}
