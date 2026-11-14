import type { Metadata } from "next";
import { notFound } from "next/navigation";

import UnsubscribeView from "@/components/UnsubscribeView";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Bülletendən imtina səhifəsi — məktubun altındakı «Abunəlikdən çıx» linki
 * bura gəlir: /{locale}/abunelikden-cix?id=…&t=…
 * Axtarış sistemlərində indekslənmir.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    title: getDictionary(raw as Locale).newsletter.emailUnsubscribe,
    robots: { index: false, follow: false },
  };
}

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; t?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const { id = "", t = "" } = await searchParams;

  return <UnsubscribeView locale={raw as Locale} id={id} token={t} />;
}
