import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import ZodiacIcon from "@/components/ZodiacIcon";
import { getHoroscope } from "@/lib/content/horoscopes";
import { getArticlesByCategory } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { formatDate, isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import {
  isZodiacKey,
  luckyColorName,
  planetName,
  zodiac,
  zodiacByKey,
  zodiacDateRange,
  zodiacName,
  type ZodiacKey,
} from "@/lib/zodiac";

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    zodiac.map((sign) => ({ locale, sign: sign.key })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; sign: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, sign: rawSign } = await params;
  if (!isLocale(rawLocale) || !isZodiacKey(rawSign)) return {};

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sign = zodiacByKey.get(rawSign as ZodiacKey);
  if (!sign) return {};

  const name = zodiacName(sign.key, locale);
  const title = interpolate(dict.astro.dailyFor, { sign: name });

  return {
    title,
    description: `${name} · ${zodiacDateRange(sign, locale)} · ${dict.astro.subtitle}`,
    alternates: {
      canonical: `${siteUrl}${routes.zodiac(locale, sign.key)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.zodiac(code, sign.key)}`]),
      ),
    },
  };
}

export default async function ZodiacSignPage({
  params,
}: {
  params: Promise<{ locale: string; sign: string }>;
}) {
  const { locale: rawLocale, sign: rawSign } = await params;
  if (!isLocale(rawLocale) || !isZodiacKey(rawSign)) notFound();

  const locale = rawLocale as Locale;
  const dict = getDictionary(locale);
  const sign = zodiacByKey.get(rawSign as ZodiacKey);
  if (!sign) notFound();

  const name = zodiacName(sign.key, locale);
  const articles = await getArticlesByCategory("astrologiya", 3);

  const periods = [
    { key: "daily" as const, label: dict.astro.tabs.daily, template: dict.astro.dailyFor },
    { key: "weekly" as const, label: dict.astro.tabs.weekly, template: dict.astro.weeklyFor },
    { key: "monthly" as const, label: dict.astro.tabs.monthly, template: dict.astro.monthlyFor },
  ];

  const facts = [
    { label: dict.astro.dates, value: zodiacDateRange(sign, locale) },
    { label: dict.astro.element, value: dict.astro.elements[sign.element] },
    { label: dict.astro.quality, value: dict.astro.qualities[sign.quality] },
    { label: dict.astro.ruler, value: planetName(sign, locale) },
    { label: dict.astro.luckyNumber, value: String(sign.luckyNumber) },
    { label: dict.astro.luckyColor, value: luckyColorName(sign, locale) },
  ];

  return (
    <>
      {/* ---------- Başlıq ---------- */}
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 lg:py-16">
          <nav
            aria-label="breadcrumb"
            className="flex items-center justify-center gap-2 font-ui text-[10.5px] uppercase tracking-[0.18em] text-muted"
          >
            <Link href={routes.home(locale)} className="hover:text-bordo">
              {dict.nav.home}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={routes.astrology(locale)} className="text-bordo hover:opacity-70">
              {dict.astro.title}
            </Link>
          </nav>

          <div className="mt-8 flex flex-col items-center text-center">
            <ZodiacIcon
              sign={sign.key}
              element={sign.element}
              className="w-32 sm:w-40"
              strokeWidth={1.5}
            />
            <h1 className="mt-7 text-4xl sm:text-5xl lg:text-6xl">{name}</h1>
            <p className="mt-3 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
              {zodiacDateRange(sign, locale)}
            </p>
          </div>
        </div>
      </header>

      {/* ---------- Bürcün göstəriciləri ---------- */}
      <section className="container-mag py-12">
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-cream px-5 py-6 text-center">
              <dt className="eyebrow text-muted">{fact.label}</dt>
              <dd className="mt-2.5 font-display text-lg text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- Şərhlər ---------- */}
      <section className="container-read pb-8">
        <p className="text-center font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
          {formatDate(new Date().toISOString().slice(0, 10), locale)}
        </p>

        <div className="mt-10 space-y-12">
          {periods.map((period) => {
            const reading = getHoroscope(sign.key, period.key, locale);
            return (
              <div key={period.key} className="border-t border-line pt-8">
                <h2 className="text-2xl">
                  {interpolate(period.template, { sign: name })}
                </h2>
                <p className="mt-4 text-[1.0625rem] leading-[1.85] text-ink-soft">
                  {reading || dict.astro.comingSoonTab}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MÜVƏQQƏTİ: reklam sahəsi gizlədilib — bu bloku şərhdən çıxarmaqla geri qaytarın.
      <div className="container-mag py-10">
        <AdSlot slot="article-inline" locale={locale} />
      </div>
      */}

      {/* ---------- Digər bürclər ---------- */}
      <section className="container-mag py-12 lg:py-16">
        <SectionHeading title={dict.astro.chooseSign} />
        <ul className="mt-10 grid grid-cols-3 gap-x-5 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {zodiac
            .filter((item) => item.key !== sign.key)
            .map((item) => (
              <li key={item.key}>
                <Link
                  href={routes.zodiac(locale, item.key)}
                  className="group flex flex-col items-center text-center"
                >
                  <ZodiacIcon
                    sign={item.key}
                    element={item.element}
                    className="w-16 transition-transform duration-500 group-hover:-translate-y-1 sm:w-20"
                  />
                  <span className="mt-2.5 font-display text-sm text-ink transition-colors group-hover:text-bordo">
                    {zodiacName(item.key, locale)}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      {/* ---------- Astrologiya məqalələri ---------- */}
      {articles.length > 0 && (
        <section className="border-t border-line bg-cream-deep/40 py-16">
          <div className="container-mag">
            <SectionHeading title={dict.astro.moreAstrology} />
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
