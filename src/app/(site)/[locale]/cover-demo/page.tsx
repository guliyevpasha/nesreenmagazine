/**
 * YALNIZ DEV: 6 bölmənin üz qabığı dizaynı bir səhifədə (hər bölmə öz yazısı ilə).
 * Firestore-a heç nə yazılmır. Production-da 404 qaytarır.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryCover, { COVER_BY_CATEGORY } from "@/components/CategoryCover";
import { categories } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/data/articles";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CoverDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const lists = await Promise.all(categories.map((c) => getArticlesByCategory(c.slug, 1)));
  const fallback = lists.flat().find((a) => a.coverImage);

  return (
    <>
      {categories.map((category, i) => {
        const article = lists[i][0] ?? fallback;
        if (!article) return null;
        return (
          <section key={category.slug} id={category.slug} className="pb-16">
            <div className="bg-ink py-3 text-center font-ui text-xs uppercase tracking-[0.25em] text-gold-soft">
              {category.name[locale]}
              {!lists[i][0] && " — bu bölmədə yazı yoxdur, başqa yazı ilə göstərilir"}
            </div>
            <CategoryCover article={article} locale={locale} variant={COVER_BY_CATEGORY[category.slug]} />
          </section>
        );
      })}
    </>
  );
}
