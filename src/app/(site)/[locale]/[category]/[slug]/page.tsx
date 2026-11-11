import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ArticleCard from "@/components/ArticleCard";
import ArticleBanners, { ArticleContentBanners } from "@/components/ArticleBanners";
import { withBannerSlots } from "@/lib/content/banner-slots";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import CoverArt from "@/components/CoverArt";
import { RoseMark } from "@/components/Logo";
import SectionHeading from "@/components/SectionHeading";
import ShareButtons from "@/components/ShareButtons";
import ViewTracker from "@/components/ViewTracker";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, isCategorySlug } from "@/lib/categories";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { formatDate, isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { markdownToHtml, markdownToPlainText } from "@/lib/markdown";
import { addHeadingIds, sanitizeArticleHtml } from "@/lib/content/sanitize-article";
import { routes } from "@/lib/routes";
import { pick, pickTags } from "@/lib/types";
import { transliterateAuthorName } from "@/lib/transliterate-author";

/** Müəllif adını dildə götürür. authorLocalized yoxdursa, author field-dən transliterasiya edir. */
function getAuthorName(article: { author: string; authorLocalized?: Record<string, string> }, locale: Locale): string {
  // Əgər authorLocalized varsa və o dildə tərcümə varsa
  if (article.authorLocalized && article.authorLocalized[locale]) {
    return article.authorLocalized[locale];
  }
  
  // Köhnə məqalələr üçün - avtomatik transliterasiya
  if (article.author) {
    const transliterated = transliterateAuthorName(article.author);
    return transliterated[locale];
  }
  
  return "Nesreen Magazine";
}

/** Kiril/ərəb slug-lar URL-də percent-encoded gəlir, Firestore-da isə açıq mətn saxlanılır. */
function decodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const TOC_LABEL: Record<Locale, string> = {
  az: "Mündəricat",
  en: "Contents",
  ru: "Содержание",
  tr: "İçindekiler",
  ar: "المحتويات",
};

export const revalidate = 60; // 60 saniyə - dərc edildikdən sonra tez görünsün
export const dynamicParams = true; // bilinməyən slug-lar runtime-da render olsun

// Build zamanı Firestore-a qoşulmaq əvəzinə səhifələr
// istifadəçi ilk dəfə açanda render olunur (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  if (!isLocale(rawLocale)) return {};

  const locale = rawLocale as Locale;
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};

  const title = pick(article.title, locale);
  const description =
    pick(article.excerpt, locale) || markdownToPlainText(pick(article.body, locale));
  const url = `${siteUrl}${routes.article(locale, article.category, getArticleSlug(article, locale))}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((code) => [
          code,
          `${siteUrl}${routes.article(code, article.category, getArticleSlug(article, code))}`,
        ]),
      ),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [getAuthorName(article, locale)],
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale: rawLocale, category: rawCategory, slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) notFound();

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const article = await getArticleBySlug(slug, locale);
  
  // Dərc olunmuş məqalə yoxdursa — həqiqi 404 (axtarış sistemləri boş səhifəni indeksləməsin)
  if (!article || article.status !== "published") notFound();

  // Məqalə başqa bölmədədirsə və ya başqa dilin slug-ı ilə açılıbsa — kanonik ünvana yönləndir
  const canonicalSlug = getArticleSlug(article, locale);
  if (article.category !== rawCategory || (canonicalSlug && canonicalSlug !== slug)) {
    permanentRedirect(routes.article(locale, article.category, canonicalSlug));
  }

  const title = pick(article.title, locale);
  const excerpt = pick(article.excerpt, locale);
  const body = pick(article.body, locale);
  const alt = pick(article.coverAlt, locale) || title;
  const tags = pickTags(article.tags, locale);
  const section = categoryName(article.category, locale);
  const related = await getRelatedArticles(article, 3);
  const authorName = getAuthorName(article, locale);

  // Mətni ikiyə bölürük ki, ortasına reklam sahəsi qoya bilək.
  // Word redaktorunun HTML-i (və köhnə Markdown) serverdə təmizlənir (XSS).
  const { html, toc } = addHeadingIds(sanitizeArticleHtml(markdownToHtml(body)));
  // H2/H3 başlıqlar arasına reklam yer tutucuları (banner brauzerdə yüklənir)
  const blocks = withBannerSlots(html.split("\n"));
  const splitAt = Math.max(3, Math.floor(blocks.length * 0.45));
  const firstHalf = blocks.slice(0, splitAt).join("\n");
  const secondHalf = blocks.slice(splitAt).join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    inLanguage: locale,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { "@type": "Organization", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "Nesreen Magazine",
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` },
    },
    mainEntityOfPage: `${siteUrl}${routes.article(locale, article.category, getArticleSlug(article, locale))}`,
    ...(article.coverImage ? { image: [article.coverImage] } : {}),
  };

  return (
    <article>
      {/* View tracking - görünməz komponent */}
      <ViewTracker articleId={article.id} slug={getArticleSlug(article, locale)} category={article.category} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------- Başlıq ---------- */}
      <header className="container-read pt-12 text-center lg:pt-16">
        <nav
          aria-label="breadcrumb"
          className="flex items-center justify-center gap-2 font-ui text-[10.5px] uppercase tracking-[0.18em] text-muted"
        >
          <Link href={routes.home(locale)} className="hover:text-bordo">
            {dict.nav.home}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={routes.category(locale, article.category)}
            className="text-bordo hover:opacity-70"
          >
            {section}
          </Link>
        </nav>

        <h1 className="mt-6 text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
          {title}
        </h1>

        {excerpt && (
          <p className="mx-auto mt-6 max-w-2xl font-display text-lg italic leading-relaxed text-ink-soft sm:text-xl">
            {excerpt}
          </p>
        )}

        {/* Qırmızı divider və müəllif məlumatları */}
        <div className="mx-auto mt-8 h-[3px] w-12 bg-bordo" aria-hidden="true" />

        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-ink">
            {authorName}
          </p>
          <p className="font-ui text-[11px] tracking-[0.16em] text-muted">
            {formatDate(article.publishedAt, locale)} · {interpolate(dict.common.minRead, { n: article.readingMinutes || 1 })}
          </p>
        </div>
      </header>

      {/* ---------- Üz qabığı ---------- */}
      <figure className="mt-12 w-full">
        <div className="relative aspect-[3/2] w-full">
          <CoverArt
            src={article.coverImage}
            alt={alt}
            category={article.category}
            seed={getArticleSlug(article, locale)}
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {article.coverCredit && (
          <figcaption className="container-mag mt-3 text-center font-ui text-[11px] tracking-wide text-muted">
            {article.coverCredit}
          </figcaption>
        )}
      </figure>

      {/* ---------- Mətn ---------- */}
      <div className="container-mag py-14 lg:py-16">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,720px)_minmax(0,1fr)] gap-8">
          {/* Sol reklam sahəsi - desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleBanners location="article-sidebar-left" category={article.category} />
            </div>
          </aside>

          {/* Mərkəz mətn sahəsi */}
          <div className="min-w-0">
            {/* Mobil/Tablet üçün üst reklam banneri */}
            <div className="mb-8 lg:hidden">
              <ArticleBanners location="article-header" category={article.category} />
            </div>

            {toc.length >= 3 && (
              <nav aria-label={TOC_LABEL[locale]} className="mb-10 border-y border-line py-5" data-testid="article-toc">
                <p className="eyebrow mb-3 text-muted">{TOC_LABEL[locale]}</p>
                <ol className="space-y-1.5 font-ui text-[14px]">
                  {toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "ps-5 text-[13px]" : ""}>
                      <a href={`#${item.id}`} className="text-ink-soft hover:text-bordo">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="prose-mag" dangerouslySetInnerHTML={{ __html: firstHalf }} />

            {secondHalf.trim().length > 0 && (
              <>
                {/* Mətn ortası reklam banneri */}
                <div className="my-12">
                  <ArticleBanners location="article-inline" category={article.category} />
                </div>
                <div className="prose-mag nm-continued" dangerouslySetInnerHTML={{ __html: secondHalf }} />
              </>
            )}

            {/* H2/H3 başlıqlar arası bannerlər (yer tutucular mətnin içindədir) */}
            <ArticleContentBanners category={article.category} />

            <div className="mt-14 flex justify-center">
              <RoseMark className="h-6 w-6 text-gold" strokeWidth={1.3} />
            </div>

            {/* Etiketlər */}
            {tags.length > 0 && (
              <div className="mt-12 border-t border-line pt-8">
                <p className="eyebrow text-muted">{dict.common.tags}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="border border-line px-3 py-1.5 font-ui text-[11px] tracking-wide text-ink-soft"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 border-t border-line pt-8">
              <ShareButtons locale={locale} title={title} />
            </div>

            {/* Mobil/Tablet üçün alt reklam banneri */}
            <div className="mt-8 lg:hidden">
              <ArticleBanners location="article-inline" category={article.category} />
            </div>
          </div>

          {/* Sağ reklam sahəsi - desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleBanners location="article-sidebar-right" category={article.category} />
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- Oxşar məqalələr ---------- */}
      {related.length > 0 && (
        <section className="border-t border-line bg-cream-deep/40 py-16 lg:py-20">
          <div className="container-mag">
            <SectionHeading title={dict.common.related} />
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} locale={locale} variant="compact" />
              ))}
            </div>

            {/* Reklam Banneri */}
            <div className="mt-16">
              <AdvertisementBanner locale={locale} />
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
