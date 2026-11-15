import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CategoryMosaic from "@/components/category/CategoryMosaic";
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

export const revalidate = 60; // planlaşdırılmış məqalələr vaxtında görünsün

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

  return (
    <>
      {/* ---------- Yığcam başlıq: bölmə / alt bölmə + digər alt bölmələr (bir zolaqda) ---------- */}
      <header className="border-b border-line">
        <div className="container-mag flex flex-col gap-5 py-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:py-9">
          <div className="min-w-0">
            <p className="flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.22em] text-muted">
              <Link href={routes.category(locale, category.slug)} className="transition-colors hover:text-bordo">
                {category.name[locale]}
              </Link>
              <span className="h-px w-6 bg-gold" aria-hidden="true" />
              <span>
                {articles.length} {dict.common.articles}
              </span>
            </p>
            <h1 className="mt-2 text-[2rem] leading-[1.1] sm:text-[2.4rem]">{subcategory.name[locale]}</h1>
          </div>

          {/* Eyni bölmənin digər alt bölmələri */}
          <nav aria-label={dict.nav.sections} className="-mx-4 min-w-0 sm:mx-0">
            <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 sm:flex-wrap sm:px-0 lg:justify-end">
              {[
                { slug: "", href: routes.category(locale, category.slug), label: dict.nav.allIn },
                ...category.subcategories.map((item) => ({
                  slug: item.slug,
                  href: routes.subcategory(locale, category.slug, item.slug),
                  label: item.name[locale],
                })),
              ].map((item) => {
                const active = item.slug === subcategory.slug;
                return (
                  <Link
                    key={item.slug || "all"}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 border px-3.5 py-2 font-ui text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                      active
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* ---------- Məqalələr ---------- */}
      {articles.length === 0 ? (
        <section className="container-read py-24 text-center">
          <p className="font-display text-2xl text-ink">{dict.search.noResults}</p>
          <Link href={routes.category(locale, category.slug)} className="btn-ghost mt-8">
            {dict.common.allArticles}
          </Link>
        </section>
      ) : (
        // Bölmə səhifələri ilə eyni «mozaika» düzülüşü: iki böyük kart + 4 sütunlu şəbəkə
        <div className="pb-8 lg:pb-12">
          <CategoryMosaic articles={articles} locale={locale} />
        </div>
      )}
    </>
  );
}
