import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ComingSoon from "@/components/ComingSoon";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  return { title: dict.soon.subscribeTitle, description: dict.soon.subscribeText };
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
