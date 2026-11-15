import Link from "next/link";

import CoverArt from "@/components/CoverArt";
import { RoseMark } from "@/components/Logo";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, subcategoryName } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

/**
 * «Ən son» — redaksiya seçkisi kimi: ortalanmış jurnal başlığı,
 * solda böyük baş yazı, sağda 4 nömrəli yazı (2×2).
 */
export default function LatestEdit({
  title,
  subtitle,
  articles,
  locale,
}: {
  title: string;
  subtitle: string;
  articles: Article[];
  locale: Locale;
}) {
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;
  const others = rest.slice(0, 4);

  return (
    <section className="border-y border-line bg-cream-deep/45">
      <div className="container-mag py-16 lg:py-24">
        {/* Başlıq */}
        <header className="text-center">
          <RoseMark className="mx-auto h-7 w-7 text-gold" strokeWidth={1.2} />
          <h2 className="mt-5 text-[2.6rem] leading-none sm:text-6xl">{title}</h2>
          <p className="mt-4 font-display text-[1.05rem] italic text-ink-soft">{subtitle}</p>
          <div className="mx-auto mt-7 flex max-w-xs items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-gold/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px flex-1 bg-gold/60" />
          </div>
        </header>

        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className={others.length > 0 ? "lg:col-span-5" : "lg:col-span-8 lg:col-start-3"}>
            <Story article={lead} index={1} locale={locale} size="lead" />
          </div>

          {others.length > 0 && (
            <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:col-span-7 lg:border-s lg:border-line lg:ps-12">
              {others.map((article, i) => (
                <Story key={article.id} article={article} index={i + 2} locale={locale} size="small" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Story({
  article,
  index,
  locale,
  size,
}: {
  article: Article;
  index: number;
  locale: Locale;
  size: "lead" | "small";
}) {
  const dict = getDictionary(locale);
  const slug = getArticleSlug(article, locale);
  const href = routes.article(locale, article.category, slug);
  const title = pick(article.title, locale);
  const excerpt = pick(article.excerpt, locale);
  const section = article.subcategory
    ? subcategoryName(article.category, article.subcategory, locale)
    : categoryName(article.category, locale);
  const lead = size === "lead";

  return (
    <article className="group">
      <Link
        href={href}
        className={`media-frame relative block ${lead ? "aspect-[4/5]" : "aspect-[3/2]"}`}
        aria-label={title}
      >
        <span className="absolute inset-0">
          <CoverArt
            src={article.coverImage}
            alt={pick(article.coverAlt, locale) || title}
            category={article.category}
            seed={slug}
            sizes={lead ? "(max-width: 1024px) 100vw, 40vw" : "(max-width: 640px) 100vw, 28vw"}
            objectPosition="center 25%"
          />
        </span>
        {/* Üzərinə gələndə incə qızılı çərçivə */}
        <span
          className="pointer-events-none absolute inset-3 border border-white/0 transition-colors duration-500 group-hover:border-white/70"
          aria-hidden="true"
        />
      </Link>

      <div className={lead ? "mt-7" : "mt-5"}>
        <div className="flex items-baseline gap-3">
          <span className={`font-display leading-none text-gold ${lead ? "text-3xl" : "text-xl"}`}>
            {String(index).padStart(2, "0")}
          </span>
          <span className="h-px w-6 translate-y-[-3px] bg-gold/60" aria-hidden="true" />
          <span className="eyebrow text-bordo">{section}</span>
        </div>

        <h3
          className={
            lead
              ? "mt-4 text-[1.9rem] leading-[1.12] sm:text-[2.35rem]"
              : "clamp-3 mt-3 text-[1.3rem] leading-[1.22]"
          }
        >
          <Link href={href} className="link-underline">
            {title}
          </Link>
        </h3>

        {lead && excerpt && (
          <p className="clamp-3 mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">{excerpt}</p>
        )}

        <p className="mt-4 font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
          {formatDate(article.publishedAt, locale)}
          <span className="mx-2 text-gold" aria-hidden="true">·</span>
          {interpolate(dict.common.minRead, { n: article.readingMinutes || 1 })}
        </p>
      </div>
    </article>
  );
}
