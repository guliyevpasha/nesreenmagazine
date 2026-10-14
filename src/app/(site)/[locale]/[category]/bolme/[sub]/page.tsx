import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleCard from "@/components/ArticleCard";
import { RoseMark } from "@/components/Logo";
import {
  categories,
  getCategory,
  getSubcategory,
  isCategorySlug,
} from "@/lib/categories";
import { getArticlesBySubcategory } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

export const revalidate = 3600; // 1 saat

type Params = { locale: string; category: string; sub: string };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    categories.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        locale,
        category: category.slug,
        sub: subcategory.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: rawLocale, category: rawCategory, sub } = await params;
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) return {};

  const locale = rawLocale as Locale;
  const category = getCategory(rawCategory);
  const subcategory = getSubcategory(rawCategory, sub);
  if (!category || !subcategory) return {};

  const title = `${subcategory.name[locale]} · ${category.name[locale]}`;

  return {
    title,
    description: category.tagline[locale],
    alternates: {
      canonical: `${siteUrl}${routes.subcategory(locale, category.slug, subcategory.slug)}`,
      languages: Object.fromEntries(
        locales.map((code) => [
          code,
          `${siteUrl}${routes.subcategory(code, category.slug, subcategory.slug)}`,
        ]),
      ),
    },
    openGraph: {
      title: `${title} · Nesreen Magazine`,
      description: category.tagline[locale],
      url: `${siteUrl}${routes.subcategory(locale, category.slug, subcategory.slug)}`,
    },
  };
}

export default async function SubcategoryPage({ params }: { params: Promise<Params> }) {
  const { locale: rawLocale, category: rawCategory, sub } = await params;
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) notFound();

  const locale = rawLocale as Locale;
  const category = getCategory(rawCategory);
  const subcategory = getSubcategory(rawCategory, sub);
  if (!category || !subcategory) notFound();

  const dict = getDictionary(locale);
  const articles = await getArticlesBySubcategory(category.slug, subcategory.slug);
  const [lead, ...rest] = articles;

  return (
    <>
      {/* ---------- Alt bölmə başlığı ---------- */}
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />

          <p className="mt-6 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            <Link href={routes.category(locale, category.slug)} className="hover:text-bordo">
              {category.name[locale]}
            </Link>
          </p>

          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl">{subcategory.name[locale]}</h1>

          <p className="mt-6 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {articles.length} {dict.common.articles}
          </p>
        </div>
      </header>

      {/* ---------- Eyni bölmənin digər alt bölmələri ---------- */}
      <nav
        aria-label={dict.nav.sections}
        className="border-b border-line bg-cream"
      >
        <div className="scrollbar-none container-mag flex gap-6 overflow-x-auto py-4">
          <Link
            href={routes.category(locale, category.slug)}
            className="shrink-0 font-ui text-[11.5px] uppercase tracking-[0.18em] text-ink hover:text-bordo"
          >
            {dict.nav.allIn}
          </Link>
          {category.subcategories.map((item) => {
            const active = item.slug === subcategory.slug;
            return (
              <Link
                key={item.slug}
                href={routes.subcategory(locale, category.slug, item.slug)}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 font-ui text-[11.5px] uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-bordo" : "text-ink hover:text-bordo"
                }`}
              >
                {item.name[locale]}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ---------- Məqalələr ---------- */}
      {articles.length === 0 ? (
        <section className="container-read py-24 text-center">
          <p className="font-display text-2xl text-ink">{dict.search.noResults}</p>
          <Link href={routes.category(locale, category.slug)} className="btn-ghost mt-8">
            {dict.common.allArticles}
          </Link>
        </section>
      ) : (
        <section className="container-mag py-16 lg:py-20">
          {lead && <ArticleCard article={lead} locale={locale} variant="hero" priority />}

          {rest.length > 0 && (
            <>
              <div className="rule-gold my-14" aria-hidden="true" />
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} locale={locale} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
