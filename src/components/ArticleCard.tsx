import Link from "next/link";

import CoverArt from "@/components/CoverArt";
import { categoryName, subcategoryName } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

type Variant = "hero" | "feature" | "compact" | "row" | "numbered";

export default function ArticleCard({
  article,
  locale,
  variant = "feature",
  index,
  priority = false,
}: {
  article: Article;
  locale: Locale;
  variant?: Variant;
  /** "numbered" variantında sıra nömrəsi. */
  index?: number;
  priority?: boolean;
}) {
  const dict = getDictionary(locale);
  const href = routes.article(locale, article.category, article.slug);
  const title = pick(article.title, locale);
  const excerpt = pick(article.excerpt, locale);
  const alt = pick(article.coverAlt, locale) || title;
  
  // Əgər alt-kateqoriya varsa, onu göstər; yoxsa əsas kateqoriya
  const section = article.subcategory 
    ? subcategoryName(article.category, article.subcategory, locale)
    : categoryName(article.category, locale);
    
  const date = formatDate(article.publishedAt, locale);
  const reading = interpolate(dict.common.minRead, { n: article.readingMinutes });

  /* ---------------- Hero — ana səhifənin baş məqaləsi ---------------- */
  if (variant === "hero") {
    return (
      <article className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <Link
          href={href}
          className="media-frame relative block aspect-[4/5] lg:col-span-7 lg:aspect-[5/4]"
          aria-label={title}
        >
          <CoverArt
            src={article.coverImage}
            alt={alt}
            category={article.category}
            seed={article.slug}
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </Link>

        <div className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-bordo">{section}</span>
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            <span className="font-ui text-[11px] tracking-wider text-muted">{date}</span>
          </div>

          <h2 className="mt-5 text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
            <Link href={href} className="link-underline">
              {title}
            </Link>
          </h2>

          <p className="clamp-4 mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">{excerpt}</p>

          <div className="mt-7 flex items-center gap-5">
            <Link href={href} className="btn-primary">
              {dict.common.readArticle}
            </Link>
            <span className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
              {reading}
            </span>
          </div>
        </div>
      </article>
    );
  }

  /* ---------------- Row — yan-yana kiçik siyahı ---------------- */
  if (variant === "row") {
    return (
      <article className="group flex items-start gap-4 sm:gap-5">
        <Link
          href={href}
          className="media-frame relative aspect-square w-24 shrink-0 sm:w-28"
          aria-label={title}
        >
          <CoverArt
            src={article.coverImage}
            alt={alt}
            category={article.category}
            seed={article.slug}
            sizes="120px"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <span className="eyebrow text-bordo">{section}</span>
          <h3 className="clamp-3 mt-2 text-lg leading-snug">
            <Link href={href} className="link-underline">
              {title}
            </Link>
          </h3>
          <p className="mt-2 font-ui text-[11px] tracking-wider text-muted">
            {date} · {reading}
          </p>
        </div>
      </article>
    );
  }

  /* ---------------- Numbered — «çox oxunanlar» ---------------- */
  if (variant === "numbered") {
    return (
      <article className="group flex items-start gap-5 border-t border-line pt-5">
        <span
          className="font-display text-4xl leading-none text-gold-soft transition-colors duration-500 group-hover:text-gold"
          aria-hidden="true"
        >
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <span className="eyebrow text-bordo">{section}</span>
          <h3 className="clamp-3 mt-2 text-lg leading-snug">
            <Link href={href} className="link-underline">
              {title}
            </Link>
          </h3>
          <p className="mt-2 font-ui text-[11px] tracking-wider text-muted">{reading}</p>
        </div>
      </article>
    );
  }

  /* ---------------- Compact — şəbəkədə kiçik kart ---------------- */
  if (variant === "compact") {
    return (
      <article className="group">
        <Link
          href={href}
          className="media-frame relative block aspect-[5/3]"
          aria-label={title}
        >
          <CoverArt
            src={article.coverImage}
            alt={alt}
            category={article.category}
            seed={article.slug}
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </Link>
        <span className="eyebrow mt-3 block text-bordo text-[10px]">{section}</span>
        <h3 className="clamp-2 mt-1.5 text-base leading-tight">
          <Link href={href} className="link-underline">
            {title}
          </Link>
        </h3>
        <p className="mt-1.5 font-ui text-[10px] tracking-wider text-muted">
          {date} · {reading}
        </p>
      </article>
    );
  }

  /* ---------------- Feature — standart kart ---------------- */
  return (
    <article className="group flex h-full flex-col">
      <Link href={href} className="media-frame relative block aspect-[4/5]" aria-label={title}>
        <CoverArt
          src={article.coverImage}
          alt={alt}
          category={article.category}
          seed={article.slug}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center gap-3">
          <span className="eyebrow text-bordo">{section}</span>
          <span className="h-px w-6 bg-gold" aria-hidden="true" />
          <span className="font-ui text-[11px] tracking-wider text-muted">{date}</span>
        </div>

        <h3 className="clamp-3 mt-3 text-2xl leading-[1.18]">
          <Link href={href} className="link-underline">
            {title}
          </Link>
        </h3>

        <p className="clamp-3 mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{excerpt}</p>

        <p className="mt-4 font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
          {reading}
        </p>
      </div>
    </article>
  );
}
