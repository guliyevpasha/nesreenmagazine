import type { Metadata } from "next";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import ArticleBanners from "@/components/ArticleBanners";
import ArticleCard from "@/components/ArticleCard";
import CategoryCover, { COVER_BY_CATEGORY } from "@/components/CategoryCover";
import FashionLookbook from "@/components/category/FashionLookbook";
import CategoryMosaic,{ MOSAIC_CATEGORIES } from "@/components/category/CategoryMosaic";
import AstrologyTabs,{ type ReadingMap } from "@/components/AstrologyTabs";
import { RoseMark } from "@/components/Logo";
import SectionHeading from "@/components/SectionHeading";
import { categories, getCategory, isCategorySlug } from "@/lib/categories";
import { getHoroscope, horoscopePeriods } from "@/lib/content/horoscopes";
import { getArticlesByCategory } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { zodiac } from "@/lib/zodiac";

export const revalidate = 60; // 60 saniyə - yeni məqalələr tez görünsün

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
  // Gündəm, Gözəllik, Həyat tərzi, Biznes — «mozaika» düzülüşü (iki böyük kart + 4 sütunlu şəbəkə)
  const isMosaic = MOSAIC_CATEGORIES.has(category.slug);

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
      {/* Bölmə adı vizual olaraq göstərilmir (menyuda aktivdir), amma SEO və ekran oxuyucuları üçün H1 qalır */}
      <h1 className="sr-only">{category.name[locale]}</h1>

      {/* ---------- Üz qabığı: bölmənin baş məqaləsi ---------- */}
      {isMosaic && articles.length > 0 && <CategoryMosaic articles={articles} locale={locale} />}
      {!isMosaic && lead && <CategoryCover article={lead} locale={locale} variant={COVER_BY_CATEGORY[category.slug]} />}

      {/* MÜVƏQQƏTİ: reklam sahəsi gizlədilib — bu bloku şərhdən çıxarmaqla geri qaytarın.
      <div className="container-mag pt-10">
        <AdSlot slot="category-top" locale={locale} />
      </div>
      */}

      {/* Admin paneldən «Kateqoriya - Üst» (bölmə üzrə hədəflənə bilər); uyğun banner yoxdursa heç nə göstərilmir */}
      <div className="container-mag empty:hidden">
        <ArticleBanners location="category-top" category={category.slug} placeholder={false} className="pt-10" />
      </div>

      <div className="container-mag pt-10">
        <AdvertisementBanner locale={locale} />
      </div>

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
        <section className="container-mag py-16 lg:py-24">
          <div className="relative border border-line bg-cream-deep/40 px-6 py-20 text-center sm:py-28">
            <span className="pointer-events-none absolute inset-3 border border-gold-soft/40" aria-hidden="true" />
            <RoseMark className="mx-auto h-9 w-9 text-gold" strokeWidth={1.1} />
            <p className="mt-6 font-display text-3xl text-ink sm:text-4xl">{dict.astro.comingSoonTab}</p>
            <div className="rule-gold mx-auto mt-8 max-w-xs" aria-hidden="true" />
          </div>
        </section>
      ) : isMosaic ? (
        <div className="pb-16 lg:pb-24" />
      ) : category.slug === "moda" && rest.length > 0 ? (
        // Moda — üz qabığından sonra «lookbook» kartları
        <FashionLookbook articles={rest} locale={locale} />
      ) : rest.length > 0 ? (
        <section className="container-mag py-16 lg:py-24">
          <div className="flex items-center gap-5">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <RoseMark className="h-5 w-5 text-gold" strokeWidth={1.2} />
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        </section>
      ) : (
        <div className="pb-16 lg:pb-24" />
      )}
    </>
  );
}
