import type { MetadataRoute } from "next";

import { categories } from "@/lib/categories";
import { getAllArticles } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { locales } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { zodiac } from "@/lib/zodiac";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}${routes.home(locale)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    });

    for (const category of categories) {
      entries.push({
        url: `${siteUrl}${routes.category(locale, category.slug)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });

      for (const subcategory of category.subcategories) {
        entries.push({
          url: `${siteUrl}${routes.subcategory(locale, category.slug, subcategory.slug)}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.6,
        });
      }
    }

    for (const sign of zodiac) {
      entries.push({
        url: `${siteUrl}${routes.zodiac(locale, sign.key)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }

    for (const page of [
      routes.contact(locale),
      routes.subscribe(locale),
      routes.issues(locale),
      routes.ejournal(locale),
      routes.selected(locale),
    ]) {
      entries.push({
        url: `${siteUrl}${page}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }

    for (const article of articles) {
      entries.push({
        url: `${siteUrl}${routes.article(locale, article.category, article.slug)}`,
        lastModified: new Date(article.updatedAt ?? article.publishedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
