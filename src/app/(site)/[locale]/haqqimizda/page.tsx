import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

export const revalidate = 86400; // 24 saatlıq cache

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "az") as Locale;
  const dict = getDictionary(locale);

  return {
    title: dict.footer.about,
    description: dict.about.metaDescription,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const a = dict.about;

  // Əlaqə cümləsindəki {link} yerinə əlaqə səhifəsinə keçid qoyulur
  const [contactBefore, contactAfter = ""] = a.contactText.split("{link}");

  return (
    <div className="container-mag py-16 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-display lg:text-4xl">
          {dict.footer.about}
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="lead text-lg text-gray-600 mb-6">{a.lead}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{a.missionTitle}</h2>
          <p>{a.missionText}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{a.meaningTitle}</h2>
          <p>{a.meaningText}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{a.teamTitle}</h2>
          <p>{a.teamText}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{a.contactTitle}</h2>
          <p>
            {contactBefore}
            <Link href={routes.contact(locale)} className="text-bordo hover:text-bordo-deep">
              {a.contactLink}
            </Link>
            {contactAfter}
          </p>
        </div>
      </div>
    </div>
  );
}
