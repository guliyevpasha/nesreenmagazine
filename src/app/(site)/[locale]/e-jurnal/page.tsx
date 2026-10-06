import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ComingSoon from "@/components/ComingSoon";
import { RoseMark } from "@/components/Logo";
import { getPublishedEjournals } from "@/lib/data/ejournals";
import { siteUrl } from "@/lib/firebase/config";
import {
  formatDate,
  isLocale,
  localizeDigits,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick } from "@/lib/types";

export const revalidate = 600;

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
    title: dict.ejournal.title,
    description: dict.ejournal.intro,
    alternates: {
      canonical: `${siteUrl}${routes.ejournal(locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.ejournal(code)}`]),
      ),
    },
    openGraph: {
      title: `${dict.ejournal.title} · Nesreen Magazine`,
      description: dict.ejournal.intro,
      url: `${siteUrl}${routes.ejournal(locale)}`,
    },
  };
}

/** Üz qabığı şəkli yüklənməyən nömrələr üçün naxışlı örtük. */
function CoverPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-cream-deep to-[#e2d4d7]">
      <RoseMark className="h-16 w-16 text-bordo/25" strokeWidth={1} />
    </div>
  );
}

export default async function EjournalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const issues = await getPublishedEjournals();

  // Hələ nömrə dərc olunmayıbsa oxucuya «tezliklə» səhifəsi göstərilir.
  if (issues.length === 0) {
    return (
      <ComingSoon
        locale={locale}
        title={dict.ejournal.empty}
        text={dict.ejournal.emptyText}
      />
    );
  }

  return (
    <>
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">{dict.ejournal.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
            {dict.ejournal.intro}
          </p>
        </div>
      </header>

      <section className="container-mag py-16 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {issues.map((issue) => {
            const title = pick(issue.title, locale);
            const description = pick(issue.description, locale);

            return (
              <article key={issue.id} className="flex flex-col">
                <a
                  href={issue.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[3/4] overflow-hidden border border-line"
                >
                  {issue.coverImage ? (
                    // Üz qabıqları Firebase Storage-dan gəlir; ölçü CSS ilə idarə olunur.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.coverImage}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <CoverPlaceholder />
                  )}
                </a>

                <p className="mt-5 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                  {formatDate(issue.publishedAt, locale)}
                  {issue.pages > 0 && (
                    <>
                      {" · "}
                      {interpolate(dict.ejournal.pages, {
                        n: localizeDigits(issue.pages, locale),
                      })}
                    </>
                  )}
                </p>

                <h2 className="mt-2 font-display text-2xl leading-snug text-ink">{title}</h2>

                {description && (
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={issue.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !py-3 !text-[11px]"
                  >
                    {dict.ejournal.open}
                  </a>
                  <a
                    href={issue.pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !py-3 !text-[11px]"
                  >
                    {dict.ejournal.download}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
