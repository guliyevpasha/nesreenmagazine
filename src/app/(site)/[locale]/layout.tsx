/**
 * Nesreen Magazine — saytın əsas çərçivəsi.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "@/app/globals.css";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import type { SearchItem } from "@/components/SearchOverlay";
import { AGENCY } from "@/lib/agency";
import { categoryName } from "@/lib/categories";
import { getAllArticles } from "@/lib/data/articles";
import { siteUrl } from "@/lib/firebase/config";
import { fontVariables } from "@/lib/fonts";
import {
  isLocale,
  localeDirection,
  localeHtmlLang,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { pick, pickTags } from "@/lib/types";

export const revalidate = 3600; // 1 saat

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "az") as Locale;
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Nesreen Magazine",
      template: "%s · Nesreen Magazine",
    },
    description: dict.footer.tagline,
    applicationName: "Nesreen Magazine",
    authors: [{ name: AGENCY.name, url: AGENCY.url }],
    creator: AGENCY.name,
    publisher: "Nesreen Magazine",
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: Object.fromEntries(
        locales.map((code) => [localeHtmlLang[code], `${siteUrl}/${code}`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: "Nesreen Magazine",
      title: "Nesreen Magazine",
      description: dict.footer.tagline,
      url: `${siteUrl}/${locale}`,
      locale: localeHtmlLang[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nesreen Magazine",
      description: dict.footer.tagline,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  // Axtarış üçün yüngül indeks — yalnız başlıq, xülasə və ünvan.
  const articles = await getAllArticles();
  const searchIndex: SearchItem[] = articles.map((article) => ({
    title: pick(article.title, locale),
    excerpt: pick(article.excerpt, locale),
    section: categoryName(article.category, locale),
    href: routes.article(locale, article.category, article.slug),
    tags: pickTags(article.tags, locale),
  }));

  return (
    <html
      lang={localeHtmlLang[locale]}
      dir={localeDirection[locale]}
      className={fontVariables}
      // globals.css-də `scroll-behavior: smooth` var — Next.js bunu bilməlidir.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="paper-grain min-h-screen">
        <AnalyticsProvider locale={locale} />
        <Header locale={locale} searchIndex={searchIndex} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
