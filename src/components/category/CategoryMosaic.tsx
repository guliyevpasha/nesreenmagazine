import Link from "next/link";

import CoverArt from "@/components/CoverArt";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, subcategoryName, type CategorySlug } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

/**
 * Bölmə səhifəsi üçün «mozaika» düzülüşü (Gündəm, Gözəllik, Həyat tərzi, Biznes):
 *  1) iki böyük kart — şəkil üstündə tarix + başlıq (ağ serif);
 *  2) dörd sütunlu şəbəkə — yuvarlaq künclü şəkil, küncündə qara bölmə nişanı, altda başlıq.
 * Ritm hər 10 məqalədə təkrarlanır (2 böyük + 8 kiçik), uzun siyahı monoton görünməsin deyə.
 */

/** Bu düzülüşü istifadə edən bölmələr. */
export const MOSAIC_CATEGORIES: ReadonlySet<CategorySlug> = new Set<CategorySlug>(["gundem", "gozellik", "heyat-terzi", "biznes"]);

type Meta = { href: string; slug: string; title: string; alt: string; section: string; date: string };

function buildMeta(article: Article, locale: Locale): Meta {
  const slug = getArticleSlug(article, locale);
  const title = pick(article.title, locale);
  return {
    href: routes.article(locale, article.category, slug),
    slug,
    title,
    alt: pick(article.coverAlt, locale) || title,
    section: article.subcategory
      ? subcategoryName(article.category, article.subcategory, locale)
      : categoryName(article.category, locale),
    date: formatDate(article.publishedAt, locale),
  };
}

/* ---------------- Böyük kart ---------------- */
function FeatureCard({
  article,
  locale,
  priority,
  wide,
}: {
  article: Article;
  locale: Locale;
  priority?: boolean;
  wide?: boolean;
}) {
  const meta = buildMeta(article, locale);
  return (
    <article className="group relative">
      <Link
        href={meta.href}
        className={`media-frame relative block overflow-hidden rounded-[14px] bg-ink shadow-[0_30px_60px_-35px_rgba(26,22,20,0.55)] ${
          wide ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]"
        }`}
      >
        <span className="absolute inset-0">
          <CoverArt
            src={article.coverImage}
            alt={meta.alt}
            category={article.category}
            seed={meta.slug}
            priority={priority}
            sizes={wide ? "(max-width: 1280px) 100vw, 1280px" : "(max-width: 1024px) 100vw, 640px"}
            objectPosition="center 30%"
          />
        </span>
        {/* oxunaqlıq üçün aşağıdan qaralma */}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
          aria-hidden="true"
        />
        {/* incə daxili haşiyə — premium hiss */}
        <span
          className="pointer-events-none absolute inset-3 rounded-[10px] border border-white/0 transition-colors duration-700 group-hover:border-white/25"
          aria-hidden="true"
        />
        <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <span className="flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.22em] text-white/80">
            <span>{meta.date}</span>
            <span className="h-px w-6 bg-gold-soft/80" aria-hidden="true" />
            <span className="text-gold-soft">{meta.section}</span>
          </span>
          <h2
            className={`clamp-3 mt-3 font-display leading-[1.08] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.35)] ${
              wide ? "text-[1.9rem] sm:text-[2.6rem] lg:text-[3.1rem]" : "text-[1.6rem] sm:text-[1.85rem] xl:text-[2.15rem]"
            }`}
          >
            {meta.title}
          </h2>
        </span>
      </Link>
    </article>
  );
}

/* ---------------- Kiçik kart ---------------- */
function TileCard({ article, locale }: { article: Article; locale: Locale }) {
  const meta = buildMeta(article, locale);
  return (
    <article className="group">
      <Link href={meta.href} className="block">
        <span className="relative block">
          <span className="media-frame relative block aspect-[16/11] overflow-hidden rounded-[12px] shadow-[0_22px_40px_-30px_rgba(26,22,20,0.6)]">
            <span className="absolute inset-0">
              <CoverArt
                src={article.coverImage}
                alt={meta.alt}
                category={article.category}
                seed={meta.slug}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
            </span>
          </span>
          {/* qara bölmə nişanı — şəklin aşağı küncündən çıxır */}
          <span className="absolute -bottom-4 start-0 inline-flex items-center border-[5px] border-cream bg-ink px-3.5 py-2 font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 group-hover:bg-bordo">
            {meta.section}
          </span>
        </span>
        <h3 className="clamp-3 mt-8 font-display text-[1.25rem] leading-[1.25] text-ink transition-colors duration-300 group-hover:text-bordo">
          {meta.title}
        </h3>
        <p className="mt-3 font-ui text-[10px] uppercase tracking-[0.22em] text-muted">{meta.date}</p>
      </Link>
    </article>
  );
}

export default function CategoryMosaic({ articles, locale }: { articles: Article[]; locale: Locale }) {
  // 2 böyük + 8 kiçik bloklar
  const blocks: { features: Article[]; tiles: Article[] }[] = [];
  for (let i = 0; i < articles.length; i += 10) {
    blocks.push({ features: articles.slice(i, i + 2), tiles: articles.slice(i + 2, i + 10) });
  }

  return (
    <section className="container-mag py-12 lg:py-16">
      {blocks.map((block, index) => (
        <div key={index} className={index > 0 ? "mt-20 lg:mt-24" : undefined}>
          <div className={`grid gap-6 lg:gap-8 ${block.features.length > 1 ? "md:grid-cols-2" : ""}`}>
            {block.features.map((article, i) => (
              <FeatureCard
                key={article.id}
                article={article}
                locale={locale}
                priority={index === 0 && i < 2}
                wide={block.features.length === 1}
              />
            ))}
          </div>

          {block.tiles.length > 0 && (
            <div className="mt-14 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {block.tiles.map((article) => (
                <TileCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
