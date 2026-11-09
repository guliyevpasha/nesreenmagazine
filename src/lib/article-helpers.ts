/**
 * Məqalə helper funksiyaları
 * 
 * Developed by Cradex Agency
 */

import type { Article, HomepageArticleCache, LocalizedText, Locale } from "@/lib/types";

/**
 * Məqalədən başlıq götürür (localized)
 */
export function getArticleTitle(article: Article | HomepageArticleCache, locale: Locale): string {
  if (typeof article.title === "string") return article.title;
  return article.title[locale] || article.title.az || article.title.en || "";
}

/**
 * Məqalədən slug götürür (localized)
 */
export function getArticleSlug(article: Article | HomepageArticleCache, locale: Locale): string {
  if (typeof article.slug === "string") return article.slug;
  return article.slug[locale] || article.slug.az || "";
}

/**
 * Məqalədən excerpt götürür (localized)
 */
export function getArticleExcerpt(article: Article | HomepageArticleCache, locale: Locale): string {
  if (typeof article.excerpt === "string") return article.excerpt;
  return article.excerpt[locale] || article.excerpt.az || "";
}

/**
 * Məqalədən cover alt götürür (localized)
 */
export function getArticleCoverAlt(article: Article | HomepageArticleCache, locale: Locale): string {
  if (typeof article.coverAlt === "string") return article.coverAlt;
  return article.coverAlt[locale] || article.coverAlt.az || "";
}

/**
 * HomepageArticleCache-i Article formatına çevirir (component uyğunluğu üçün)
 */
export function cacheToArticle(cache: HomepageArticleCache): Article {
  return {
    ...cache,
    // Missing fields from full Article type - add defaults
    body: typeof cache.excerpt === "string" 
      ? cache.excerpt 
      : cache.excerpt,
    tags: { az: [], en: [], ru: [], tr: [], ar: [] },
    coverCredit: "",
    featured: false,
    trending: false,
    updatedAt: cache.publishedAt,
  } as Article;
}

/**
 * Məqalənin verilmiş dildə tam doldurulub-doldurulmadığını yoxlayır
 */
export function isArticleComplete(article: Article, locale: Locale): boolean {
  const title = typeof article.title === "string" ? article.title : article.title[locale];
  const excerpt = typeof article.excerpt === "string" ? article.excerpt : article.excerpt[locale];
  const body = typeof article.body === "string" ? article.body : article.body[locale];
  const slug = typeof article.slug === "string" ? article.slug : article.slug[locale];
  
  return !!(title && excerpt && body && slug);
}
