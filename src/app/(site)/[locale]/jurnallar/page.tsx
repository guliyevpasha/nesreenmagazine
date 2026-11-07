import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ComingSoon from "@/components/ComingSoon";
import EditionsCatalog, { type CatalogIssue } from "@/components/EditionsCatalog";
import { RoseMark } from "@/components/Logo";
import { categoryName, isCategorySlug } from "@/lib/categories";
import { getEditions } from "@/lib/data/ejournals";
import { siteUrl } from "@/lib/firebase/config";
import { formatDate, isLocale, localizeDigits, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, SPECIAL_ISSUE_CATEGORY } from "@/lib/types";

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
    title: dict.editions.title,
    description: dict.editions.intro,
    alternates: {
      canonical: `${siteUrl}${routes.issues(locale)}`,
      languages: Object.fromEntries(locales.map((code) => [code, `${siteUrl}${routes.issues(code)}`])),
    },
  };
}

export default async function IssuesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  const editions = await getEditions();
  if (editions.length === 0) {
    return <ComingSoon locale={locale} title={dict.soon.issuesTitle} text={dict.soon.issuesText} />;
  }

  const issues: CatalogIssue[] = editions.map((issue) => {
    const category = issue.category ?? "";
    return {
      id: issue.id,
      title: pick(issue.title, locale),
      description: pick(issue.description, locale),
      highlights: pick(issue.highlights, locale)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      coverImage: issue.coverImage,
      price: issue.price ?? 0,
      category,
      categoryName:
        category === SPECIAL_ISSUE_CATEGORY
          ? dict.editions.special
          : isCategorySlug(category)
            ? categoryName(category, locale)
            : "",
      year: issue.publishedAt.slice(0, 4),
      dateLabel: formatDate(issue.publishedAt, locale),
      pagesLabel:
        issue.pages > 0 ? interpolate(dict.ejournal.pages, { n: localizeDigits(issue.pages, locale) }) : "",
    };
  });

  return (
    <>
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">{dict.editions.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
            {dict.editions.intro}
          </p>
        </div>
      </header>
      <section className="container-mag py-14 lg:py-20">
        <EditionsCatalog locale={locale} issues={issues} />
      </section>
    </>
  );
}
