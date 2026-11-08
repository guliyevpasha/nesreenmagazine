import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ComingSoon from "@/components/ComingSoon";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

export const revalidate = 3600;

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
  const dict = getDictionary(raw as Locale);
  return {
    title: dict.soon.subscribeTitle,
    description: dict.soon.subscribeText,
    // Kanonik və dil alternativləri (əks halda ana səhifənin kanoniki miras qalır)
    alternates: {
      canonical: `${siteUrl}${routes.subscribe(raw as Locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.subscribe(code)}`]),
      ),
    },
  };
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <ComingSoon
      locale={locale}
      title={dict.soon.subscribeTitle}
      text={dict.soon.subscribeText}
    />
  );
}
