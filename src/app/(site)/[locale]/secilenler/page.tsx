import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleCard from "@/components/ArticleCard";
import { RoseMark } from "@/components/Logo";
import { getAllArticles } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

export const revalidate = 300;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return {
    title: dict.selected.title,
    description: dict.selected.intro,
    alternates: {
      canonical: `${siteUrl}${routes.selected(locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.selected(code)}`]),
      ),
    },
    openGraph: {
      title: `${dict.selected.title} · Nesreen Magazine`,
      description: dict.selected.intro,
      url: `${siteUrl}${routes.selected(locale)}`,
    },
  };
}

export default async function SelectedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  // Redaksiyanın seçimi: «kapak» məqaləsi, sonra çox oxunanlar.
  const articles = (await getAllArticles()).filter(
    (article) => article.featured || article.trending,
  );
  const [lead, ...rest] = articles;

  return (
    <>
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">{dict.selected.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
            {dict.selected.intro}
          </p>
          <p className="mt-6 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
            {articles.length} {dict.common.articles}
          </p>
        </div>
      </header>

      {articles.length === 0 ? (
        <section className="container-read py-24 text-center">
          <p className="font-display text-2xl text-ink">{dict.search.noResults}</p>
        </section>
      ) : (
        <section className="container-mag py-16 lg:py-20">
          {lead && <ArticleCard article={lead} locale={locale} variant="hero" priority />}

          {rest.length > 0 && (
            <>
              <div className="rule-gold my-14" aria-hidden="true" />
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} locale={locale} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
