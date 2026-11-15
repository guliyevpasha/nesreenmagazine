import Link from "next/link";

import ArticleCard from "@/components/ArticleCard";
import CoverArt from "@/components/CoverArt";
import { RoseMark } from "@/components/Logo";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, subcategoryName } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

/**
 * Ana səhifənin «ön səhifəsi» — klassik jurnal düzülüşü:
 *  sol sütun: 2 əlavə yazı · orta: baş mövzu · sağ: çox oxunanlar.
 * Telefonda: baş mövzu → əlavə yazılar → çox oxunanlar.
 */
export default function FrontPage({
  lead,
  side,
  trending,
  locale,
}: {
  lead: Article;
  side: Article[];
  trending: Article[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const href = routes.article(locale, lead.category, getArticleSlug(lead, locale));
  const title = pick(lead.title, locale);
  const excerpt = pick(lead.excerpt, locale);
  const section = lead.subcategory
    ? subcategoryName(lead.category, lead.subcategory, locale)
    : categoryName(lead.category, locale);

  return (
    <section className="container-mag pb-16 pt-8 lg:pb-20 lg:pt-12">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
        {/* ---------- Baş mövzu ---------- */}
        <article className="group lg:order-2 lg:col-span-6 lg:px-10">
          <p className="eyebrow mb-5 flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            {dict.home.heroEyebrow}
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
          </p>
          <Link href={href} className="media-frame relative block aspect-square sm:aspect-[3/2]" aria-label={title}>
            <span className="absolute inset-0">
              <CoverArt
                src={lead.coverImage}
                alt={pick(lead.coverAlt, locale) || title}
                category={lead.category}
                seed={getArticleSlug(lead, locale)}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                objectPosition="center 25%"
              />
            </span>
          </Link>
          <div className="mx-auto mt-7 max-w-xl text-center">
            <span className="eyebrow text-bordo">{section}</span>
            <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-5xl lg:text-[3.1rem]">
              <Link href={href} className="link-underline">
                {title}
              </Link>
            </h1>
            {excerpt && (
              <p className="clamp-3 mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{excerpt}</p>
            )}
            <p className="mt-5 font-ui text-[11px] uppercase tracking-[0.18em] text-muted">
              {formatDate(lead.publishedAt, locale)}
              <span className="mx-2 text-gold" aria-hidden="true">·</span>
              {interpolate(dict.common.minRead, { n: lead.readingMinutes || 1 })}
            </p>
          </div>
        </article>

        {/* ---------- Sol: əlavə yazılar ---------- */}
        {side.length > 0 && (
          <div className="grid gap-10 sm:grid-cols-2 lg:order-1 lg:col-span-3 lg:grid-cols-1 lg:content-start lg:gap-0 lg:divide-y lg:divide-line lg:border-e lg:border-line lg:pe-8">
            {side.slice(0, 2).map((article) => (
              <div key={article.id} className="lg:py-8 lg:first:pt-0">
                <ArticleCard article={article} locale={locale} variant="compact" />
              </div>
            ))}
          </div>
        )}

        {/* ---------- Sağ: çox oxunanlar ---------- */}
        {trending.length > 0 && (
          <aside className="lg:order-3 lg:col-span-3 lg:border-s lg:border-line lg:ps-8">
            <p className="eyebrow flex items-center gap-2.5 border-b border-ink pb-4 text-ink">
              <RoseMark className="h-4 w-4 text-gold" strokeWidth={1.3} />
              {dict.home.trendingTitle}
            </p>
            <div className="mt-2 space-y-5">
              {trending.slice(0, 5).map((article, index) => (
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
        )}
      </div>
    </section>
  );
}
