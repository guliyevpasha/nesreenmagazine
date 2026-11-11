import Link from "next/link";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import ArticleBanners from "@/components/ArticleBanners";
import ArticleCard from "@/components/ArticleCard";
import HeroCarousel from "@/components/HeroCarousel";
import { RoseMark } from "@/components/Logo";
import SectionHeading from "@/components/SectionHeading";
import ZodiacStrip from "@/components/ZodiacStrip";
import { categories } from "@/lib/categories";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { getHomepageContent } from "@/lib/data/homepage-editorial";
import { cacheToArticle } from "@/lib/article-helpers";
import { getArticlesByCategory } from "@/lib/data/articles";
import type { Article, HomepageArticleCache } from "@/lib/types";

export const revalidate = 60; // 60 saniyə - yeni məqalələr tez görünsün

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // Redaksiya seçimləri + əvvəlki avtomatik sorğular (fallback) paralel
  const [homepageData, allGundem, allModa, allGozellik, allHeyatTerzi, allAstrologiya, allBiznes] =
    await Promise.all([
      getHomepageContent(locale).catch(() => null),
      getArticlesByCategory("gundem", 6),
      getArticlesByCategory("moda", 15),
      getArticlesByCategory("gozellik", 15),
      getArticlesByCategory("heyat-terzi", 15),
      getArticlesByCategory("astrologiya", 1),
      getArticlesByCategory("biznes", 15),
    ]);

  /**
   * Bölmə: əvvəl redaksiya seçimi (sıra ilə), qalan yerlər avtomatik siyahı ilə doldurulur —
   * redaktorda bir məqalə seçmək bloku bir məqaləyə endirməsin.
   */
  const pick = (editorial: HomepageArticleCache[] | undefined, fallback: Article[]): Article[] => {
    if (!editorial || editorial.length === 0) return fallback;
    const chosen = editorial.map(cacheToArticle);
    const ids = new Set(chosen.map((a) => a.id));
    return [...chosen, ...fallback.filter((a) => !ids.has(a.id))].slice(
      0,
      Math.max(chosen.length, fallback.length),
    );
  };
  const plain = (list: Article[]) => list.filter((a) => !a.trending).slice(0, 5);
  const trending = (list: Article[]) => list.filter((a) => a.trending).slice(0, 5);

  // Baş mövzu carousel (əvvəl: Gündəmdən 6 məqalə)
  const heroArticles = pick(homepageData?.weeklyMainTopic, allGundem).slice(0, 6);

  // Ən son (əvvəl: hər bölmədən 1 məqalə, carousel-dəkilər çıxılmaqla)
  const heroIds = new Set(heroArticles.map((a) => a.id));
  const latestFallback = [allGundem, allModa, allGozellik, allHeyatTerzi, allAstrologiya, allBiznes]
    .map((list) => list[0])
    .filter((a): a is Article => Boolean(a) && !heroIds.has(a.id))
    .slice(0, 6);
  const latestArticles = pick(homepageData?.latestArticles, latestFallback);

  const moda = pick(homepageData?.moda.editorial, plain(allModa));
  const modaTrending = pick(homepageData?.moda.mostRead, trending(allModa));

  const gozellik = pick(homepageData?.gozellik.editorial, plain(allGozellik));
  const gozellikTrending = pick(homepageData?.gozellik.mostRead, trending(allGozellik));

  const heyatTerzi = pick(homepageData?.heyatTerzi.editorial, plain(allHeyatTerzi));
  const heyatTerziTrending = pick(homepageData?.heyatTerzi.mostRead, trending(allHeyatTerzi));

  const biznes = pick(homepageData?.biznes.editorial, plain(allBiznes));
  const biznesTrending = pick(homepageData?.biznes.mostRead, trending(allBiznes));

  return (
    <>
      {/* ================= Baş məqalə Carousel ================= */}
      {heroArticles.length > 0 && (
        <HeroCarousel articles={heroArticles} locale={locale} eyebrow={dict.home.heroEyebrow} />
      )}

      <div className="rule-gold" />

      {/* Admin paneldən «Ana səhifə - Hero» bannerləri; uyğun banner yoxdursa heç nə göstərilmir */}
      <div className="container-mag empty:hidden">
        <ArticleBanners location="home-hero" placeholder={false} className="pt-10" />
      </div>

      {/* ================= Ən son ================= */}
      {latestArticles.length > 0 && (
        <section className="container-mag py-16 lg:py-20">
          <SectionHeading
            title={dict.home.latestTitle}
            subtitle={dict.home.latestSub}
          />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {latestArticles.slice(0, 15).map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* ================= Reklam ================= */}
      <div className="container-mag pb-16">
        <AdvertisementBanner locale={locale} />
      </div>

      {/* ================= Redaktordan ================= */}
      <section className="relative overflow-hidden bg-bordo-deep py-10 text-cream sm:py-12 lg:py-14">
        <RoseMark
          className="pointer-events-none absolute -end-14 -top-14 h-32 w-32 text-cream/[0.05] sm:h-38 sm:w-38 lg:h-44 lg:w-44"
          strokeWidth={0.5}
        />
        <RoseMark
          className="pointer-events-none absolute -bottom-16 -start-8 h-28 w-28 text-cream/[0.03] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
          strokeWidth={0.5}
        />

        <div className="container-mag relative">
          <p className="eyebrow text-center text-gold-soft text-[9px] tracking-wider">{dict.home.editorTitle}</p>

          {/* Giriş — bölmənin yeganə böyük səsi */}
          <p className="mx-auto mt-4 max-w-[30ch] text-center font-display text-[1.05rem] italic leading-[1.28] sm:mt-5 sm:max-w-[36ch] sm:text-[1.25rem] lg:max-w-[40ch] lg:text-[1.4rem]">
            {dict.home.editorLead}
          </p>

          {/* Gövdə — geniş ekranda iki sütun */}
          <div className="mx-auto mt-5 grid max-w-[54ch] gap-3.5 text-[0.8125rem] leading-[1.65] text-cream/70 sm:mt-6 sm:text-[0.84375rem] lg:max-w-2xl lg:grid-cols-2 lg:gap-x-8">
            {dict.home.editorBody.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {/* Vurğu sətri — qızılı cizgilər arasında */}
          <p className="mx-auto mt-6 max-w-[40ch] border-y border-gold/20 py-3.5 text-center font-display text-[0.89rem] leading-[1.48] text-gold-soft sm:mt-7 sm:text-[0.98rem]">
            {dict.home.editorPull}
          </p>

          {/* Bağlayış və imza */}
          <p className="mx-auto mt-5 max-w-[36ch] text-center font-display text-[0.89rem] italic leading-[1.42] sm:mt-6 sm:text-[0.98rem]">
            {dict.home.editorClosing}
          </p>
          <div className="mx-auto mt-4 h-px w-10 bg-gold sm:mt-5 sm:w-12" aria-hidden="true" />
          <p className="mt-2.5 text-center font-ui text-[8px] uppercase tracking-[0.22em] text-cream/55 sm:text-[9px]">
            {dict.home.editorSignature}
          </p>
        </div>
      </section>

      {/* ================= Astrologiya ================= */}
      <section className="container-mag py-16 lg:py-20">
        <SectionHeading title={dict.home.astroTitle} subtitle={dict.home.astroSub} />
        <div className="mt-12">
          <ZodiacStrip locale={locale} withDates />
        </div>
        <div className="mt-10 text-center">
          <Link href={routes.astrology(locale)} className="btn-ghost">
            {dict.astro.moreAstrology}
          </Link>
        </div>
      </section>

      <div className="rule-gold" />

      {/* ================= Moda + Çox oxunanlar ================= */}
      <section className="container-mag py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <SectionHeading
              align="start"
              title={categories[1].name[locale]}
              action={{
                label: dict.common.viewAll,
                href: routes.category(locale, "moda"),
              }}
            />
            <div className="mt-8 grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {moda.slice(0, 9).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <p className="eyebrow border-b border-line pb-4 text-bordo">
              {dict.home.trendingTitle}
            </p>
            <div className="mt-5 space-y-5">
              {modaTrending.slice(0, 7).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  variant="numbered"
                  index={index}
                />
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ================= Gözəllik + Çox oxunanlar ================= */}
      {gozellik.length > 0 && (
        <section className="bg-cream-deep/55 py-16 lg:py-20">
          <div className="container-mag">
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <SectionHeading
                  align="start"
                  title={categories[2].name[locale]}
                  action={{
                    label: dict.common.viewAll,
                    href: routes.category(locale, "gozellik"),
                  }}
                />
                <div className="mt-8 grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {gozellik.slice(0, 9).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      locale={locale}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-4">
                <p className="eyebrow border-b border-line pb-4 text-bordo">
                  {dict.home.trendingTitle}
                </p>
                <div className="mt-5 space-y-5">
                  {gozellikTrending.slice(0, 7).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      locale={locale}
                      variant="numbered"
                      index={index}
                    />
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ================= Həyat tərzi + Çox oxunanlar ================= */}
      {heyatTerzi.length > 0 && (
        <section className="container-mag py-16 lg:py-20">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <SectionHeading
                align="start"
                title={categories[3].name[locale]}
                action={{
                  label: dict.common.viewAll,
                  href: routes.category(locale, "heyat-terzi"),
                }}
              />
              <div className="mt-8 grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {heyatTerzi.slice(0, 9).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    variant="compact"
                  />
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <p className="eyebrow border-b border-line pb-4 text-bordo">
                {dict.home.trendingTitle}
              </p>
              <div className="mt-5 space-y-5">
                {heyatTerziTrending.slice(0, 7).map((article, index) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    locale={locale}
                    variant="numbered"
                    index={index}
                  />
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ================= Biznes + Çox oxunanlar ================= */}
      {biznes.length > 0 && (
        <section className="bg-cream-deep/55 py-16 lg:py-20">
          <div className="container-mag">
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <SectionHeading
                  align="start"
                  title={categories[5].name[locale]}
                  action={{
                    label: dict.common.viewAll,
                    href: routes.category(locale, "biznes"),
                  }}
                />
                <div className="mt-8 grid gap-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                  {biznes.slice(0, 9).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      locale={locale}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-4">
                <p className="eyebrow border-b border-line pb-4 text-bordo">
                  {dict.home.trendingTitle}
                </p>
                <div className="mt-5 space-y-5">
                  {biznesTrending.slice(0, 7).map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      locale={locale}
                      variant="numbered"
                      index={index}
                    />
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
