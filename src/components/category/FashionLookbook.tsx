import Link from "next/link";

import CoverArt from "@/components/CoverArt";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, subcategoryName } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

/**
 * Moda bölməsi — üz qabığından sonrakı məqalələr «lookbook» kimi:
 * pilləli 3 sütun (orta sütun aşağı enir), nömrələnmiş portret şəkillər,
 * hover-da kənara çəkilən incə qızılı çərçivə, kursiv qısa mətn.
 */
export default function FashionLookbook({ articles, locale }: { articles: Article[]; locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="container-mag py-16 lg:py-24">
      <div className="flex items-center gap-5" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-display text-sm italic tracking-[0.3em] text-gold">Lookbook</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* 3-dən az məqalə olanda boş sütun qalmasın — şəbəkə ortaya yığılır */}
      <div
        className={`mx-auto mt-14 grid gap-x-10 gap-y-16 lg:mt-16 lg:gap-x-12 ${
          articles.length === 1
            ? "max-w-md"
            : articles.length === 2
              ? "max-w-4xl sm:grid-cols-2 sm:[&>*:nth-child(2)]:mt-24"
              : "sm:grid-cols-2 lg:grid-cols-3 lg:[&>*:nth-child(3n+2)]:mt-24"
        }`}
      >
        {articles.map((article, index) => {
          const slug = getArticleSlug(article, locale);
          const title = pick(article.title, locale);
          const excerpt = pick(article.excerpt, locale);
          const href = routes.article(locale, article.category, slug);
          const section = article.subcategory
            ? subcategoryName(article.category, article.subcategory, locale)
            : categoryName(article.category, locale);

          return (
            <article key={article.id} className="group">
              <Link href={href} className="block">
                <span className="relative block">
                  {/* hover-da kənara çəkilən qızılı çərçivə */}
                  <span
                    className="pointer-events-none absolute inset-0 border border-gold/0 transition-all duration-700 ease-out group-hover:translate-x-3 group-hover:translate-y-3 group-hover:border-gold/70 rtl:group-hover:-translate-x-3"
                    aria-hidden="true"
                  />
                  <span className="media-frame relative block aspect-[3/4]">
                    <span className="absolute inset-0">
                      <CoverArt
                        src={article.coverImage}
                        alt={pick(article.coverAlt, locale) || title}
                        category={article.category}
                        seed={slug}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        objectPosition="center 20%"
                      />
                    </span>
                    <span
                      className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent"
                      aria-hidden="true"
                    />
                    {/* nömrə */}
                    <span
                      className="absolute start-5 top-4 font-display text-[2.6rem] italic leading-none text-white/95"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                </span>

                <span className="mt-7 flex items-center gap-3 font-ui text-[10.5px] uppercase tracking-[0.24em]">
                  <span className="text-bordo">{section}</span>
                  <span className="h-px w-6 bg-gold" aria-hidden="true" />
                  <span className="text-muted">{formatDate(article.publishedAt, locale)}</span>
                </span>
                <h3 className="clamp-3 mt-3 font-display text-[1.55rem] leading-[1.18] text-ink transition-colors duration-300 group-hover:text-bordo">
                  {title}
                </h3>
                {excerpt && (
                  <p className="clamp-2 mt-3 font-display text-[1.02rem] italic leading-relaxed text-ink-soft">
                    {excerpt}
                  </p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-ui text-[10.5px] uppercase tracking-[0.24em] text-ink transition-colors duration-300 group-hover:border-bordo group-hover:text-bordo">
                  {dict.common.readArticle}
                  <span aria-hidden="true" className="rtl:-scale-x-100">
                    →
                  </span>
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
