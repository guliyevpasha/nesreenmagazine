import Link from "next/link";

import ArticleCard from "@/components/ArticleCard";
import EditorialHeading from "@/components/home/EditorialHeading";
import ZodiacIcon from "@/components/ZodiacIcon";
import { getHoroscope } from "@/lib/content/horoscopes";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import type { Article } from "@/lib/types";
import { signForDate, zodiac, zodiacDateRange, zodiacName } from "@/lib/zodiac";

/** Bakı vaxtı ilə bu gün (UTC+4) — səhifə hər dəqiqə yenilənir (ISR). */
function bakuToday(): Date {
  return new Date(Date.now() + 4 * 3600_000);
}

/**
 * Ana səhifənin astrologiya bölməsi — açıq, jurnal üslubunda:
 *  solda «günün bürcü» kartı (cari Günəş bürcü + bugünkü şərh),
 *  sağda 12 bürcün seçimi, altda astrologiya yazıları.
 */
export default function AstroSection({
  locale,
  articles,
}: {
  locale: Locale;
  articles: Article[];
}) {
  const dict = getDictionary(locale);
  const sign = signForDate(bakuToday());
  const reading = getHoroscope(sign.key, "daily", locale);
  const posts = articles.slice(0, 3);

  return (
    <section className="bg-cream-deep/55">
      <div className="container-mag py-16 lg:py-24">
        <EditorialHeading
          title={dict.home.astroTitle}
          action={{ label: dict.astro.moreAstrology, href: routes.astrology(locale) }}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* ---------- Günün bürcü ---------- */}
          <article className="relative bg-paper px-7 py-10 text-center shadow-[0_30px_60px_-40px_rgba(26,22,20,0.35)] sm:px-10 lg:col-span-5">
            <span className="pointer-events-none absolute inset-3 border border-gold/35" aria-hidden="true" />
            <p className="eyebrow relative text-gold">{dict.astro.tabs.daily}</p>
            <Link
              href={routes.zodiac(locale, sign.key)}
              className="group relative mx-auto mt-6 block w-36 sm:w-40"
            >
              <span className="block transition-transform duration-700 ease-out group-hover:rotate-[8deg]">
                <ZodiacIcon sign={sign.key} element={sign.element} className="w-full" strokeWidth={1.6} />
              </span>
            </Link>
            <h3 className="relative mt-6 text-4xl leading-none sm:text-[2.75rem]">
              <Link href={routes.zodiac(locale, sign.key)} className="link-underline">
                {zodiacName(sign.key, locale)}
              </Link>
            </h3>
            <p className="relative mt-3 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              {zodiacDateRange(sign, locale)}
            </p>
            {reading && (
              <>
                <div className="relative mx-auto mt-7 flex max-w-[10rem] items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-gold/50" />
                  <span className="h-1 w-1 rotate-45 bg-gold" />
                  <span className="h-px flex-1 bg-gold/50" />
                </div>
                <p className="relative mx-auto mt-7 max-w-md font-display text-[1.15rem] italic leading-relaxed text-ink-soft">
                  {reading}
                </p>
              </>
            )}
            <Link
              href={routes.zodiac(locale, sign.key)}
              className="relative mt-8 inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.2em] text-bordo"
            >
              <span className="link-underline">{dict.common.readMore}</span>
              <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
            </Link>
          </article>

          {/* ---------- 12 bürc ---------- */}
          <div className="lg:col-span-7">
            <p className="eyebrow border-b border-line pb-4 text-ink">{dict.astro.chooseSign}</p>
            <ul className="grid grid-cols-3 sm:grid-cols-4">
              {zodiac.map((s) => {
                const active = s.key === sign.key;
                return (
                  <li key={s.key} className="border-b border-line">
                    <Link
                      href={routes.zodiac(locale, s.key)}
                      className={`group flex flex-col items-center px-2 py-6 text-center transition-colors duration-300 hover:bg-paper ${
                        active ? "bg-paper" : ""
                      }`}
                      aria-current={active ? "date" : undefined}
                    >
                      <span className="block w-14 transition-transform duration-500 group-hover:-translate-y-1 sm:w-16">
                        <ZodiacIcon sign={s.key} element={s.element} className="w-full" />
                      </span>
                      <span
                        className={`mt-3 font-display text-[1.05rem] leading-tight transition-colors duration-300 group-hover:text-bordo ${
                          active ? "text-bordo" : "text-ink"
                        }`}
                      >
                        {zodiacName(s.key, locale)}
                      </span>
                      <span className="mt-1 font-ui text-[10px] leading-tight tracking-wide text-muted">
                        {zodiacDateRange(s, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ---------- Astrologiya yazıları ---------- */}
        {posts.length > 0 && (
          <div className="mt-16 border-t border-line pt-14 lg:mt-20">
            {/* Yazı sayından asılı olmayaraq eyni stil: mətn şəklin üstündə.
                1 yazı — enli kart, 2 — yan-yana, 3 — üç sütun. */}
            <div
              className={`grid gap-8 ${
                posts.length === 2 ? "md:grid-cols-2" : posts.length >= 3 ? "md:grid-cols-3 md:gap-6 lg:gap-8" : ""
              }`}
            >
              {posts.map((article) => (
                <div
                  key={article.id}
                  className={`min-h-[420px] ${
                    posts.length === 1
                      ? "aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/7]"
                      : posts.length === 2
                        ? "aspect-[4/5] sm:aspect-[4/3]"
                        : "aspect-[4/5]"
                  }`}
                >
                  <ArticleCard article={article} locale={locale} variant="overlay" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
