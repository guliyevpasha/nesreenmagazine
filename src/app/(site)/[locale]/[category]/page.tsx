import type { Metadata } from "next";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import ArticleCard from "@/components/ArticleCard";
import AstrologyTabs, { type ReadingMap } from "@/components/AstrologyTabs";
import { RoseMark } from "@/components/Logo";
import SectionHeading from "@/components/SectionHeading";
import { categories, getCategory, isCategorySlug } from "@/lib/categories";
import { getHoroscope, horoscopePeriods } from "@/lib/content/horoscopes";
import { getArticlesByCategory } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { zodiac } from "@/lib/zodiac";

export const revalidate = 3600; // 1 saat

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category: category.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, category: rawCategory } = await params;
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) return {};

  const locale = rawLocale as Locale;
  const category = getCategory(rawCategory);
  if (!category) return {};

  return {
    title: category.name[locale],
    description: category.tagline[locale],
    alternates: {
      canonical: `${siteUrl}/${locale}/${category.slug}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}/${code}/${category.slug}`]),
      ),
    },
    openGraph: {
      title: `${category.name[locale]} · Nesreen Magazine`,
      description: category.tagline[locale],
      url: `${siteUrl}/${locale}/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale: rawLocale, category: rawCategory } = await params;
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) notFound();

  const locale = rawLocale as Locale;
  const category = getCategory(rawCategory);
  if (!category) notFound();

  const dict = getDictionary(locale);
  const articles = await getArticlesByCategory(category.slug);
  const [lead, ...rest] = articles;

  const isAstrology = category.slug === "astrologiya";

  // Astrologiya bölməsi üçün hər dövrün 12 bürc üzrə şərhini hazırlayırıq.
  const readings: ReadingMap = isAstrology
    ? Object.fromEntries(
        horoscopePeriods.map((period) => [
          period,
          Object.fromEntries(
            zodiac.map((sign) => [sign.key, getHoroscope(sign.key, period, locale)]),
          ),
        ]),
      )
    : {};

  return (
    <>
      {/* ---------- Bölmə başlığı ---------- */}
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">{category.name[locale]}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
            {category.tagline[locale]}
          </p>
          <p className="mt-6 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {articles.length} {dict.common.articles}
          </p>
        </div>
      </header>

      {/* MÜVƏQQƏTİ: reklam sahəsi gizlədilib — bu bloku şərhdən çıxarmaqla geri qaytarın.
      <div className="container-mag pt-10">
        <AdSlot slot="category-top" locale={locale} />
      </div>
      */}

      {/* ---------- Astrologiya: bürc dairələri ---------- */}
      {isAstrology && (
        <section className="container-mag py-16 lg:py-20">
          <SectionHeading title={dict.astro.chooseSign} subtitle={dict.astro.subtitle} />
          <div className="mt-12">
            <AstrologyTabs locale={locale} readings={readings} />
          </div>
        </section>
      )}

      {/* ---------- Məqalələr ---------- */}
      {articles.length === 0 ? (
        <section className="container-read py-24 text-center">
          <p className="font-display text-2xl text-ink">{dict.search.noResults}</p>
        </section>
      ) : (
        <section className="container-mag py-16 lg:py-20">
          {isAstrology && (
            <SectionHeading
              align="start"
              title={dict.common.inThisSection}
              subtitle={interpolate(dict.home.moreFrom, {
                category: category.name[locale],
              })}
            />
          )}

          {/* Bölmənin baş məqaləsi */}
          {lead && (
            <div className={isAstrology ? "mt-10" : ""}>
              <ArticleCard article={lead} locale={locale} variant="hero" priority />
            </div>
          )}

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
