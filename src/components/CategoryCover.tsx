import Link from "next/link";

import CoverArt from "@/components/CoverArt";
import { getArticleSlug } from "@/lib/article-helpers";
import { categoryName, subcategoryName, type CategorySlug } from "@/lib/categories";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, type Article } from "@/lib/types";

/**
 * Bölmə səhifəsinin üz qabığı — üç premium variant:
 *  cinema   — tam ekran enində şəkil, ağ başlıq şəklin üstündə
 *  magazine — yazının şəkli çap olunmuş jurnal üz qabığı kimi
 *  split    — ekranın yarısı bordo panel, yarısı kənara qədər şəkil
 *  mirror   — (Gözəllik) mirvari fonda oval güzgü şəkil
 *  kinfolk  — (Həyat tərzi) minimal interyer, böyük şəkil + böyüdülmüş detal
 *  boardroom — (Biznes) tünd mürəkkəb fon, qızılı çərçivəli ağ-qara portret
 *  tarot    — (Astrologiya) qızılı haşiyəli tarot kartı
 * Komponent öz konteynerini özü qurur (tam en variantlar üçün).
 */
export type CoverVariant = "cinema" | "magazine" | "split" | "mirror" | "kinfolk" | "boardroom" | "tarot";

/** Hər bölmənin üz qabığı dizaynı. */
export const COVER_BY_CATEGORY: Record<CategorySlug, CoverVariant> = {
  gundem: "cinema",
  moda: "magazine",
  gozellik: "mirror",
  "heyat-terzi": "kinfolk",
  astrologiya: "tarot",
  biznes: "boardroom",
};

type Meta = {
  href: string;
  slug: string;
  title: string;
  excerpt: string;
  alt: string;
  section: string;
  date: string;
  reading: string;
  readLabel: string;
};

function buildMeta(article: Article, locale: Locale): Meta {
  const dict = getDictionary(locale);
  const slug = getArticleSlug(article, locale);
  const title = pick(article.title, locale);
  return {
    href: routes.article(locale, article.category, slug),
    slug,
    title,
    excerpt: pick(article.excerpt, locale),
    alt: pick(article.coverAlt, locale) || title,
    section: article.subcategory
      ? subcategoryName(article.category, article.subcategory, locale)
      : categoryName(article.category, locale),
    date: formatDate(article.publishedAt, locale),
    reading: interpolate(dict.common.minRead, { n: article.readingMinutes || 1 }),
    readLabel: dict.common.readArticle,
  };
}

function CoverImage({
  article,
  meta,
  sizes,
  position = "center 25%",
}: {
  article: Article;
  meta: Meta;
  sizes: string;
  position?: string;
}) {
  return (
    <span className="absolute inset-0">
      <CoverArt
        src={article.coverImage}
        alt={meta.alt}
        category={article.category}
        seed={meta.slug}
        priority
        sizes={sizes}
        objectPosition={position}
      />
    </span>
  );
}

function Arrow() {
  return (
    <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
      →
    </span>
  );
}

export default function CategoryCover({
  article,
  locale,
  variant = "cinema",
}: {
  article: Article;
  locale: Locale;
  variant?: CoverVariant;
}) {
  const meta = buildMeta(article, locale);
  if (variant === "magazine") return <MagazineCover article={article} meta={meta} />;
  if (variant === "split") return <SplitCover article={article} meta={meta} />;
  if (variant === "mirror") return <MirrorCover article={article} meta={meta} />;
  if (variant === "kinfolk") return <KinfolkCover article={article} meta={meta} />;
  if (variant === "boardroom") return <BoardroomCover article={article} meta={meta} />;
  if (variant === "tarot") return <TarotCover article={article} meta={meta} />;
  return <CinemaCover article={article} meta={meta} />;
}

type Props = { article: Article; meta: Meta };

/* ---------------- A — Kino kadrı ---------------- */
function CinemaCover({ article, meta }: Props) {
  return (
    <article className="group relative h-[82vh] max-h-[880px] min-h-[540px] w-full overflow-hidden bg-ink">
      <Link href={meta.href} className="media-frame absolute inset-0 block" aria-label={meta.title}>
        <CoverImage article={article} meta={meta} sizes="100vw" />
      </Link>
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent rtl:bg-gradient-to-l"
        aria-hidden="true"
      />

      <div className="pointer-events-none container-mag relative flex h-full flex-col justify-end pb-14 lg:pb-20">
        <div className="max-w-3xl">
          <p className="eyebrow flex items-center gap-4 text-gold-soft">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            {meta.section}
          </p>
          <h2 className="mt-6 text-[2.4rem] leading-[1.03] text-white sm:text-6xl xl:text-[4.5rem]">
            <Link href={meta.href} className="pointer-events-auto">
              {meta.title}
            </Link>
          </h2>
          {meta.excerpt && (
            <div className="mt-6 hidden max-w-xl sm:block">
              <p className="clamp-2 font-display text-[1.15rem] italic leading-relaxed text-white/80">
                {meta.excerpt}
              </p>
            </div>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href={meta.href}
              className="pointer-events-auto inline-flex items-center gap-3 bg-white px-8 py-4 font-ui text-[11px] uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-gold"
            >
              {meta.readLabel} <Arrow />
            </Link>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-white/60">
              {meta.date} · {meta.reading}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- B — Jurnal üz qabığı ---------------- */
function MagazineCover({ article, meta }: Props) {
  return (
    <article className="group relative overflow-hidden bg-cream-deep/70">
      <div className="container-mag grid items-center gap-16 py-16 lg:grid-cols-12 lg:gap-20 lg:py-24">
        {/* jurnal */}
        <div className="relative mx-auto w-full max-w-[400px] lg:col-span-5">
          {/* arxadakı ikinci nömrə */}
          <span
            className="absolute inset-0 translate-x-5 translate-y-4 rotate-3 bg-bordo-deep shadow-[0_30px_60px_-30px_rgba(26,22,20,0.5)] rtl:-translate-x-5 rtl:-rotate-3"
            aria-hidden="true"
          />
          <Link
            href={meta.href}
            className="relative block aspect-[3/4] overflow-hidden bg-ink shadow-[0_40px_80px_-30px_rgba(26,22,20,0.6)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:-rotate-1"
            aria-label={meta.title}
          >
            <CoverImage article={article} meta={meta} sizes="(max-width: 1024px) 90vw, 400px" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" aria-hidden="true" />
            {/* masthead */}
            <span className="absolute inset-x-0 top-5 text-center" aria-hidden="true">
              <span className="block font-display text-[2.9rem] leading-none tracking-[0.12em] text-white sm:text-[3.3rem]">
                NESREEN
              </span>
              <span className="mt-1 block font-ui text-[9px] uppercase tracking-[0.6em] text-gold-soft">
                Magazine
              </span>
            </span>
            {/* üz qabığı sətirləri */}
            <span className="absolute inset-x-0 bottom-0 p-6" aria-hidden="true">
              <span className="block font-ui text-[9px] uppercase tracking-[0.3em] text-gold-soft">{meta.section}</span>
              <span className="clamp-3 mt-2 block font-display text-[1.45rem] leading-[1.12] text-white">
                {meta.title}
              </span>
              <span className="mt-3 block font-ui text-[9px] uppercase tracking-[0.3em] text-white/60">{meta.date}</span>
            </span>
          </Link>
        </div>

        {/* mətn */}
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-4 text-bordo">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            {meta.section}
          </p>
          <h2 className="mt-6 text-[2.3rem] leading-[1.06] sm:text-5xl xl:text-[3.6rem]">
            <Link href={meta.href} className="link-underline">
              {meta.title}
            </Link>
          </h2>
          {meta.excerpt && (
            <p className="clamp-4 mt-7 max-w-2xl font-display text-[1.15rem] italic leading-relaxed text-ink-soft">
              {meta.excerpt}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href={meta.href} className="btn-primary">
              {meta.readLabel} <Arrow />
            </Link>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              {meta.date} · {meta.reading}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- C — Bölünmüş ekran ---------------- */
function SplitCover({ article, meta }: Props) {
  return (
    <article className="group grid w-full lg:min-h-[82vh] lg:grid-cols-2">
      {/* şəkil — ekranın kənarına qədər */}
      <Link
        href={meta.href}
        className="media-frame relative block aspect-[4/5] sm:aspect-[4/3] lg:order-2 lg:aspect-auto"
        aria-label={meta.title}
      >
        <CoverImage article={article} meta={meta} sizes="(max-width: 1024px) 100vw, 50vw" />
      </Link>

      {/* bordo panel */}
      <div className="relative flex items-center overflow-hidden bg-bordo-deep px-6 py-16 text-cream sm:px-12 lg:order-1 lg:px-16 xl:px-24">
        <span
          className="pointer-events-none absolute -bottom-40 -start-40 h-96 w-96 rounded-full border border-gold/20"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-28 -start-28 h-72 w-72 rounded-full border border-gold/15"
          aria-hidden="true"
        />
        <div className="relative max-w-xl">
          <p className="eyebrow flex items-center gap-4 text-gold-soft">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            {meta.section}
          </p>
          <h2 className="mt-7 text-[2.3rem] leading-[1.06] text-cream sm:text-5xl xl:text-[3.5rem]">
            <Link href={meta.href} className="transition-colors duration-300 hover:text-gold-soft">
              {meta.title}
            </Link>
          </h2>
          <div className="mt-8 h-px w-16 bg-gold" aria-hidden="true" />
          {meta.excerpt && (
            <p className="clamp-4 mt-8 font-display text-[1.15rem] italic leading-relaxed text-cream/75">
              {meta.excerpt}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href={meta.href}
              className="inline-flex items-center gap-3 border border-gold px-8 py-4 font-ui text-[11px] uppercase tracking-[0.22em] text-gold-soft transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              {meta.readLabel} <Arrow />
            </Link>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-cream/55">
              {meta.date} · {meta.reading}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Gözəllik — oval güzgü ---------------- */
function MirrorCover({ article, meta }: Props) {
  return (
    <article className="group relative overflow-hidden bg-gradient-to-b from-[#f7eeea] via-[#f3e4df] to-[#efe0da]">
      {/* mirvari parıltılar */}
      <span className="pointer-events-none absolute -start-32 top-10 h-96 w-96 rounded-full bg-white/60 blur-3xl" aria-hidden="true" />
      <span className="pointer-events-none absolute -end-24 bottom-0 h-80 w-80 rounded-full bg-[#e9cfc7]/70 blur-3xl" aria-hidden="true" />

      <div className="container-mag relative flex flex-col items-center py-16 text-center lg:py-24">
        <p className="eyebrow text-bordo-soft">{meta.section}</p>

        <div className="relative mt-10 w-[72%] max-w-[330px]">
          {/* ikiqat qızılı oval çərçivə */}
          <span className="pointer-events-none absolute -inset-4 rounded-[50%] border border-gold/60" aria-hidden="true" />
          <span className="pointer-events-none absolute -inset-7 rounded-[50%] border border-gold/25" aria-hidden="true" />
          <Link
            href={meta.href}
            className="media-frame relative block aspect-[3/4] overflow-hidden rounded-[50%] shadow-[0_40px_80px_-40px_rgba(92,22,38,0.45)]"
            aria-label={meta.title}
          >
            <CoverImage article={article} meta={meta} sizes="(max-width: 640px) 80vw, 380px" />
            {/* güzgü işığı */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" aria-hidden="true" />
          </Link>
        </div>

        <h2 className="mt-12 max-w-4xl font-display text-[2.2rem] italic leading-[1.1] text-ink sm:text-5xl xl:text-[3.4rem]">
          <Link href={meta.href} className="link-underline">
            {meta.title}
          </Link>
        </h2>
        {meta.excerpt && (
          <p className="clamp-3 mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">{meta.excerpt}</p>
        )}
        <div className="mt-9 flex flex-col items-center gap-4">
          <Link
            href={meta.href}
            className="inline-flex items-center gap-3 rounded-full border border-bordo/40 bg-white/70 px-9 py-3.5 font-ui text-[11px] uppercase tracking-[0.22em] text-bordo backdrop-blur transition-colors duration-300 hover:bg-bordo hover:text-cream"
          >
            {meta.readLabel} <Arrow />
          </Link>
          <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {meta.date} · {meta.reading}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Həyat tərzi — minimal interyer ---------------- */
function KinfolkCover({ article, meta }: Props) {
  return (
    <article className="group bg-[#f4f2ec]">
      <div className="container-mag grid gap-12 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="relative lg:col-span-8">
          <Link
            href={meta.href}
            className="media-frame relative block aspect-[4/3] lg:aspect-[16/11]"
            aria-label={meta.title}
          >
            <CoverImage article={article} meta={meta} position="center 45%" sizes="(max-width: 1024px) 100vw, 66vw" />
          </Link>
          {/* böyüdülmüş detal */}
          <span
            className="absolute -bottom-10 end-6 hidden aspect-square w-40 overflow-hidden border-[6px] border-[#f4f2ec] shadow-[0_20px_40px_-20px_rgba(26,22,20,0.4)] sm:block lg:-end-10 lg:w-48"
            aria-hidden="true"
          >
            <span className="absolute inset-0 origin-center scale-[2.2] transition-transform duration-1000 group-hover:scale-[2.4]">
              <CoverArt
                src={article.coverImage}
                alt=""
                category={article.category}
                seed={`${meta.slug}-detail`}
                sizes="200px"
                objectPosition="60% 55%"
              />
            </span>
          </span>
        </div>

        <div className="flex flex-col justify-end lg:col-span-4 lg:pb-4">
          <p className="font-ui text-[11px] uppercase tracking-[0.35em] text-[#6f8063]">{meta.section}</p>
          <h2 className="mt-6 text-[2rem] font-normal leading-[1.15] text-ink sm:text-[2.6rem]">
            <Link href={meta.href} className="link-underline">
              {meta.title}
            </Link>
          </h2>
          {meta.excerpt && (
            <p className="clamp-4 mt-6 text-[1rem] leading-[1.8] text-ink-soft">{meta.excerpt}</p>
          )}
          <div className="mt-10 border-t border-ink/15 pt-6">
            <Link
              href={meta.href}
              className="group/read flex items-center justify-between font-ui text-[11px] uppercase tracking-[0.3em] text-ink"
            >
              <span>{meta.readLabel}</span>
              <span className="transition-transform duration-300 group-hover/read:translate-x-1 rtl:group-hover/read:-translate-x-1">
                <Arrow />
              </span>
            </Link>
            <p className="mt-4 font-ui text-[10px] uppercase tracking-[0.3em] text-muted">
              {meta.date} — {meta.reading}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Biznes — idarə heyəti ---------------- */
function BoardroomCover({ article, meta }: Props) {
  return (
    <article className="group relative overflow-hidden bg-[#121417] text-cream">
      {/* nazik şaquli xətlər */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(90deg,#fff_0,#fff_1px,transparent_1px,transparent_120px)]"
        aria-hidden="true"
      />
      <div className="container-mag relative grid items-center gap-14 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-4 font-ui text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
            <span className="h-[2px] w-10 bg-gold" aria-hidden="true" />
            {meta.section}
          </p>
          <h2 className="mt-7 text-[2.3rem] leading-[1.06] text-cream sm:text-5xl xl:text-[3.5rem]">
            <Link href={meta.href} className="transition-colors duration-300 hover:text-gold-soft">
              {meta.title}
            </Link>
          </h2>
          {meta.excerpt && (
            <p className="clamp-3 mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-cream/65">{meta.excerpt}</p>
          )}
          <div className="mt-10 grid max-w-md grid-cols-2 border-y border-cream/15">
            <div className="py-4 pe-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-cream/45">{meta.date}</p>
            </div>
            <div className="border-s border-cream/15 py-4 ps-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-cream/45">{meta.reading}</p>
            </div>
          </div>
          <Link
            href={meta.href}
            className="mt-9 inline-flex items-center gap-3 bg-gold px-8 py-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-gold-soft"
          >
            {meta.readLabel} <Arrow />
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] lg:col-span-6">
          <span className="pointer-events-none absolute -inset-3 border border-gold/50" aria-hidden="true" />
          <Link href={meta.href} className="media-frame relative block aspect-[4/5]" aria-label={meta.title}>
            <span className="absolute inset-0 grayscale contrast-[1.08] transition-[filter] duration-700 group-hover:grayscale-0">
              <CoverImage article={article} meta={meta} sizes="(max-width: 1024px) 90vw, 520px" />
            </span>
          </Link>
          <span className="absolute -bottom-3 -start-3 bg-gold px-4 py-2 font-ui text-[10px] font-semibold uppercase tracking-[0.3em] text-ink">
            Nesreen
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------------- Astrologiya — tarot kartı ---------------- */
function TarotCover({ article, meta }: Props) {
  return (
    <article className="group relative overflow-hidden bg-cream-deep/60">
      {/* zərif ulduzlar */}
      <span
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1.5px_1.5px_at_12%_20%,#c9a227,transparent),radial-gradient(1px_1px_at_30%_75%,#c9a227,transparent),radial-gradient(1.5px_1.5px_at_55%_12%,#c9a227,transparent),radial-gradient(1px_1px_at_78%_40%,#c9a227,transparent),radial-gradient(1.5px_1.5px_at_90%_85%,#c9a227,transparent),radial-gradient(1px_1px_at_45%_92%,#c9a227,transparent)]"
        aria-hidden="true"
      />
      <div className="container-mag relative grid items-center gap-16 py-16 lg:grid-cols-12 lg:gap-20 lg:py-24">
        {/* kart */}
        <div className="relative mx-auto w-[74%] max-w-[340px] lg:order-2 lg:col-span-5 lg:col-start-8">
          <span
            className="absolute inset-0 -rotate-6 rounded-[18px] border border-gold/50 bg-paper/60 rtl:rotate-6"
            aria-hidden="true"
          />
          <Link
            href={meta.href}
            className="relative block rounded-[18px] bg-[#1b1626] p-3 shadow-[0_40px_80px_-30px_rgba(26,22,20,0.55)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-1"
            aria-label={meta.title}
          >
            <span className="relative block rounded-[12px] border border-gold/70 p-2">
              <span className="block text-center font-display text-sm tracking-[0.4em] text-gold-soft">XVII</span>
              <span className="media-frame relative mt-2 block aspect-[3/4] overflow-hidden rounded-[6px]">
                <CoverImage article={article} meta={meta} sizes="(max-width: 1024px) 70vw, 340px" />
              </span>
              <span className="mt-2 block text-center font-ui text-[9px] uppercase tracking-[0.4em] text-gold-soft">
                ✦ {meta.section} ✦
              </span>
            </span>
          </Link>
        </div>

        {/* mətn */}
        <div className="lg:order-1 lg:col-span-7">
          <p className="eyebrow flex items-center gap-3 text-gold">
            <span aria-hidden="true">✦</span>
            {meta.section}
          </p>
          <h2 className="mt-6 text-[2.3rem] leading-[1.08] sm:text-5xl xl:text-[3.5rem]">
            <Link href={meta.href} className="link-underline">
              {meta.title}
            </Link>
          </h2>
          <div className="mt-8 flex items-center gap-3 text-gold" aria-hidden="true">
            <span className="h-px w-14 bg-gold/60" />
            <span className="text-xs">☾</span>
            <span className="h-px w-14 bg-gold/60" />
          </div>
          {meta.excerpt && (
            <p className="clamp-4 mt-8 max-w-2xl font-display text-[1.15rem] italic leading-relaxed text-ink-soft">
              {meta.excerpt}
            </p>
          )}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link href={meta.href} className="btn-primary">
              {meta.readLabel} <Arrow />
            </Link>
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              {meta.date} · {meta.reading}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
