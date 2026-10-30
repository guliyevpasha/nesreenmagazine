import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import ArticleCard from "@/components/ArticleCard";
import CoverArt from "@/components/CoverArt";
import { RoseMark } from "@/components/Logo";
import SectionHeading from "@/components/SectionHeading";
import ShareButtons from "@/components/ShareButtons";
import { categoryName, isCategorySlug } from "@/lib/categories";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { formatDate, isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { markdownToHtml, markdownToPlainText } from "@/lib/markdown";
import { routes } from "@/lib/routes";
import { pick, pickTags } from "@/lib/types";

export const revalidate = 3600; // 1 saat
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
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};

  const locale = rawLocale as Locale;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const title = pick(article.title, locale);
  const description =
    pick(article.excerpt, locale) || markdownToPlainText(pick(article.body, locale));
  const url = `${siteUrl}${routes.article(locale, article.category, article.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((code) => [
          code,
          `${siteUrl}${routes.article(code, article.category, article.slug)}`,
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
      authors: [article.author],
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
  const { locale: rawLocale, category: rawCategory, slug } = await params;
  if (!isLocale(rawLocale) || !isCategorySlug(rawCategory)) notFound();

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);

  const article = await getArticleBySlug(slug);
  
  // Məqalə yoxdursa, kateqoriya uyğun gəlmirsə və ya draft statusundadırsa, "Coming Soon" göstər
  // Published və scheduled məqalələr aktiv göstərilir
  if (!article || article.category !== rawCategory || article.status === "draft") {
    return (
      <div className="container-mag flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto max-w-md">
          <RoseMark className="mx-auto h-12 w-12 text-gold/30" strokeWidth={1} />
          <h1 className="mt-8 text-3xl font-display">{dict.soon.badge}</h1>
          <p className="mt-4 text-lg text-ink-soft">
            Bu məqalə hazırlanır. Yaxın zamanda dərc olunacaq.
          </p>
          <Link 
            href={routes.category(locale, rawCategory)} 
            className="btn-ghost mt-8"
          >
            {categoryName(rawCategory, locale)} bölməsinə qayıt
          </Link>
        </div>
      </div>
    );
  }

  const title = pick(article.title, locale);
  const excerpt = pick(article.excerpt, locale);
  const body = pick(article.body, locale);
  const alt = pick(article.coverAlt, locale) || title;
  const tags = pickTags(article.tags, locale);
  const section = categoryName(article.category, locale);
  const related = await getRelatedArticles(article, 3);

  // Mətni ikiyə bölürük ki, ortasına reklam sahəsi qoya bilək.
  const html = markdownToHtml(body);
  const blocks = html.split("\n");
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
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Nesreen Magazine",
      logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` },
    },
    mainEntityOfPage: `${siteUrl}${routes.article(locale, article.category, article.slug)}`,
    ...(article.coverImage ? { image: [article.coverImage] } : {}),
  };

  return (
    <article>
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
            {article.author}
          </p>
          <p className="font-ui text-[11px] tracking-[0.16em] text-muted">
            {formatDate(article.publishedAt, locale)} · {interpolate(dict.common.minRead, { n: article.readingMinutes })}
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
            seed={article.slug}
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
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_720px_1fr] gap-8">
          {/* Sol reklam sahəsi - yalnız desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="border border-line bg-cream-deep/30 p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wider">Reklam</p>
                <div className="mt-2 aspect-[300/600] bg-line/20 flex items-center justify-center">
                  {/* AdSlot komponenti buraya */}
                </div>
              </div>
            </div>
          </aside>

          {/* Mərkəz mətn sahəsi */}
          <div className="min-w-0">
            <div className="prose-mag" dangerouslySetInnerHTML={{ __html: firstHalf }} />

            {secondHalf.trim().length > 0 && (
              <>
                {/* MÜVƏQQƏTİ: reklam sahəsi gizlədilib — bu bloku şərhdən çıxarmaqla geri qaytarın.
                <div className="my-12">
                  <AdSlot slot="article-inline" locale={locale} />
                </div>
                */}
                <div className="prose-mag" dangerouslySetInnerHTML={{ __html: secondHalf }} />
              </>
            )}

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
          </div>

          {/* Sağ reklam sahəsi - yalnız desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="border border-line bg-cream-deep/30 p-4 text-center">
                <p className="text-xs text-muted uppercase tracking-wider">Reklam</p>
                <div className="mt-2 aspect-[300/600] bg-line/20 flex items-center justify-center">
                  {/* AdSlot komponenti buraya */}
                </div>
              </div>
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
          </div>
        </section>
      )}
    </article>
  );
}
