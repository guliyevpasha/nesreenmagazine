import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import ArticleBanners from "@/components/ArticleBanners";
import CategoryBlock from "@/components/home/CategoryBlock";
import LatestEdit from "@/components/home/LatestEdit";
import AstroSection from "@/components/home/AstroSection";
import FrontPage from "@/components/home/FrontPage";
import NewsletterBand from "@/components/home/NewsletterBand";
import EditorLetter from "@/components/home/EditorLetter";
import { getCategory } from "@/lib/categories";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { getHomepageContent } from "@/lib/data/homepage-editorial";
import { cacheToArticle } from "@/lib/article-helpers";
import { getArticlesByCategory } from "@/lib/data/articles";
import type { Article, HomepageArticleCache } from "@/lib/types";

/** «Redaktordan» bölməsi arxivdədir — yenidən göstərmək üçün true edin. */
const SHOW_EDITOR_LETTER = false;

export const revalidate = 60; // 60 saniyə - yeni məqalələr tez görünsün

/** Təkrarları atır (id üzrə), ilk görünən qalır. */
function uniq(list: Article[]): Article[] {
  const seen = new Set<string>();
  return list.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

/** Tarixi müqayisə üçün millisaniyəyə çevirir (Date, string və ya Firestore Timestamp). */
function time(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") return new Date(value).getTime() || 0;
  const v = value as { toDate?: () => Date; seconds?: number };
  if (typeof v.toDate === "function") return v.toDate().getTime();
  if (typeof v.seconds === "number") return v.seconds * 1000;
  return 0;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // Redaksiya seçimləri + avtomatik sorğular (fallback) paralel
  const [homepageData, allGundem, allModa, allGozellik, allHeyatTerzi, allAstrologiya, allBiznes] =
    await Promise.all([
      getHomepageContent(locale).catch(() => null),
      getArticlesByCategory("gundem", 8),
      getArticlesByCategory("moda", 15),
      getArticlesByCategory("gozellik", 15),
      getArticlesByCategory("heyat-terzi", 15),
      getArticlesByCategory("astrologiya", 4),
      getArticlesByCategory("biznes", 15),
    ]);

  /**
   * Əvvəl redaksiya seçimi (sıra ilə), qalan yerlər avtomatik siyahı ilə doldurulur —
   * redaktorda bir məqalə seçmək bloku bir məqaləyə endirməsin.
   */
  const pick = (editorial: HomepageArticleCache[] | undefined, fallback: Article[]): Article[] => {
    if (!editorial || editorial.length === 0) return fallback;
    const chosen = editorial.map(cacheToArticle);
    return uniq([...chosen, ...fallback]).slice(0, Math.max(chosen.length, fallback.length));
  };
  const plain = (list: Article[]) => list.filter((a) => !a.trending);
  const hot = (list: Article[]) => list.filter((a) => a.trending);

  // Bütün dərc olunmuş yazılar — yenidən köhnəyə
  const everything = uniq(
    [...allGundem, ...allModa, ...allGozellik, ...allHeyatTerzi, ...allAstrologiya, ...allBiznes],
  ).sort((a, b) => time(b.publishedAt) - time(a.publishedAt));

  // ---------- Ön səhifə: baş mövzu + 2 əlavə yazı ----------
  const heroArticles = pick(homepageData?.weeklyMainTopic, allGundem);
  const lead = heroArticles[0] ?? everything[0];
  const side = uniq([...heroArticles.slice(1), ...everything])
    .filter((a) => a.id !== lead?.id)
    .slice(0, 2);
  const frontIds = new Set([lead?.id, ...side.map((a) => a.id)]);

  // ---------- Bölmə blokları: redaksiya seçimi + çox oxunanlar + qalanlar ----------
  const block = (
    editorial: HomepageArticleCache[] | undefined,
    mostRead: HomepageArticleCache[] | undefined,
    all: Article[],
  ) => {
    const top = pick(mostRead, hot(all));
    return {
      articles: uniq([...pick(editorial, plain(all)), ...top, ...all]),
      mostRead: top,
    };
  };

  const sectionBlocks = (
    [
      { slug: "moda", ...block(homepageData?.moda.editorial, homepageData?.moda.mostRead, allModa) },
      { slug: "gozellik", ...block(homepageData?.gozellik.editorial, homepageData?.gozellik.mostRead, allGozellik) },
      { slug: "heyat-terzi", ...block(homepageData?.heyatTerzi.editorial, homepageData?.heyatTerzi.mostRead, allHeyatTerzi) },
      { slug: "biznes", ...block(homepageData?.biznes.editorial, homepageData?.biznes.mostRead, allBiznes) },
    ] as const
  )
    .map((b) => ({ ...b, category: getCategory(b.slug) }))
    .filter(
      (b): b is typeof b & { category: NonNullable<typeof b.category> } =>
        Boolean(b.category) && b.articles.length > 0,
    );

  // ---------- Çox oxunanlar (bütün sayt): redaksiyanın seçdikləri + «trend», sonra ən yenilər ----------
  const trendingAll = uniq([
    ...sectionBlocks.flatMap((b) => b.mostRead),
    ...hot(everything),
    ...everything,
  ])
    .filter((a) => !frontIds.has(a.id))
    .slice(0, 5);

  // ---------- Ən son: ön səhifədə olmayan ən yeni 5 yazı ----------
  const latestArticles = uniq([...pick(homepageData?.latestArticles, []), ...everything])
    .filter((a) => !frontIds.has(a.id))
    .slice(0, 5);

  const firstBlocks = sectionBlocks.slice(0, 2);
  const restBlocks = sectionBlocks.slice(2);

  return (
    <>
      {/* ================= Ön səhifə ================= */}
      {lead && <FrontPage lead={lead} side={side} trending={trendingAll} locale={locale} />}

      {/* Admin paneldən «Ana səhifə - Hero» bannerləri; uyğun banner yoxdursa heç nə göstərilmir */}
      <div className="container-mag empty:hidden">
        <ArticleBanners location="home-hero" placeholder={false} className="pb-12" />
      </div>

      {/* ================= Reklam: «Ən son»-un üstündə ================= */}
      <div className="container-mag pt-12 lg:pt-16">
        <AdvertisementBanner locale={locale} />
      </div>

      {/* ================= Ən son ================= */}
      <LatestEdit
        title={dict.home.latestTitle}
        subtitle={dict.home.latestSub}
        articles={latestArticles}
        locale={locale}
      />

      {/* ================= Astrologiya: bürclər + yazılar ================= */}
      <AstroSection locale={locale} articles={allAstrologiya} />

      {/* ================= Bölmə blokları (1-ci hissə) ================= */}
      {firstBlocks.map((b, i) => (
        <CategoryBlock
          key={b.slug}
          title={b.category.name[locale]}
          href={routes.category(locale, b.slug)}
          viewAllLabel={dict.common.viewAll}
          articles={b.articles.slice(0, 5)}
          locale={locale}
          shaded={i % 2 === 1}
        />
      ))}

      {/* ================= Bülleten ================= */}
      <NewsletterBand locale={locale} />

      {/* ================= Bölmə blokları (2-ci hissə) ================= */}
      {restBlocks.map((b, i) => (
        <CategoryBlock
          key={b.slug}
          title={b.category.name[locale]}
          href={routes.category(locale, b.slug)}
          viewAllLabel={dict.common.viewAll}
          articles={b.articles.slice(0, 5)}
          locale={locale}
          shaded={i % 2 === 1}
        />
      ))}

      {/* ================= Redaktordan (arxivdə) ================= */}
      {SHOW_EDITOR_LETTER && <EditorLetter dict={dict} />}

    </>
  );
}
