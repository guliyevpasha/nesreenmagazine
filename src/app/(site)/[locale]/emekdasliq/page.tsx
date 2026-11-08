import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
    title: dict.footer.advertising,
    description: dict.partnership.metaDescription,
    // Kanonik və dil alternativləri (əks halda ana səhifənin kanoniki miras qalır)
    alternates: {
      canonical: `${siteUrl}${routes.partnership(locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.partnership(code)}`]),
      ),
    },
  };
}

export default async function PartnershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const p = dict.partnership;

  return (
    <div className="container-mag py-16 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-display lg:text-4xl">
          {dict.footer.advertising}
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="lead text-lg text-gray-600 mb-6">{p.lead}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{p.typesTitle}</h2>

          <h3 className="text-lg font-medium mt-6 mb-3">{p.digitalTitle}</h3>
          <ul className="list-disc ps-6 space-y-2">
            {p.digital.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">{p.contentTitle}</h3>
          <ul className="list-disc ps-6 space-y-2">
            {p.content.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">{p.printTitle}</h3>
          <ul className="list-disc ps-6 space-y-2">
            {p.print.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">{p.audienceTitle}</h2>
          <p>{p.audienceText}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">{p.mediaKitTitle}</h2>
          <p>{p.mediaKitText}</p>

          <div className="bg-cream-deep/30 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-3">{p.cardTitle}</h3>
            <p className="mb-4">{p.cardText}</p>
            <p>
              <strong>{p.emailLabel}</strong>{" "}
              <a href="mailto:partnership@nesreenmagazine.com" className="text-bordo hover:text-bordo-deep">
                partnership@nesreenmagazine.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
