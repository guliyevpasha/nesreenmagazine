import type { Metadata } from "next";
import { notFound } from "next/navigation";

// MÜVƏQQƏTİ: reklam sahələri gizlədilib — geri qaytarmaq üçün bu sətri silin, aşağıdakı importu bərpa edin.
// import AdSlot from "@/components/AdSlot";
import ContactForm from "@/components/ContactForm";
import { RoseMark } from "@/components/Logo";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** Redaksiyanın əlaqə məlumatları — dəyişdirmək üçün bu sətirləri redaktə edin. */
const CONTACT = {
  email: "salam@nesreenmagazine.com",
  advertising: "reklam@nesreenmagazine.com",
  phone: "+994 12 000 00 00",
  address: "Bakı, Azərbaycan",
};

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
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: {
      canonical: `${siteUrl}${routes.contact(locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.contact(code)}`]),
      ),
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <header className="border-b border-line bg-cream-deep/40">
        <div className="container-mag py-14 text-center lg:py-20">
          <RoseMark className="mx-auto h-8 w-8 text-gold" strokeWidth={1.2} />
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl">{dict.contact.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft">
            {dict.contact.subtitle}
          </p>
        </div>
      </header>

      <section className="container-mag py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Forma */}
          <div className="lg:col-span-7">
            <ContactForm locale={locale} />
          </div>

          {/* Məlumatlar */}
          <aside className="lg:col-span-5">
            <div className="border border-line bg-paper p-8">
              <p className="eyebrow text-bordo">{dict.contact.infoTitle}</p>

              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {dict.contact.emailLabel}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${CONTACT.email}`}
                      className="link-underline text-[0.9375rem] text-ink"
                    >
                      {CONTACT.email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {dict.footer.advertising}
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${CONTACT.advertising}`}
                      className="link-underline text-[0.9375rem] text-ink"
                    >
                      {CONTACT.advertising}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {dict.contact.phoneLabel}
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink">{CONTACT.phone}</dd>
                </div>

                <div>
                  <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {dict.contact.addressLabel}
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink">{CONTACT.address}</dd>
                </div>

                <div>
                  <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {dict.contact.hoursLabel}
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink">{dict.contact.hoursValue}</dd>
                </div>
              </dl>
            </div>

            {/* Reklam təklifi */}
            <div className="mt-8 border border-gold/50 bg-cream-deep/50 p-8">
              <p className="eyebrow text-gold">{dict.contact.adTitle}</p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                {dict.contact.adText}
              </p>
              <a href={`mailto:${CONTACT.advertising}`} className="btn-ghost mt-6">
                {dict.contact.adCta}
              </a>
            </div>

            {/* MÜVƏQQƏTİ: reklam sahəsi gizlədilib — bu bloku şərhdən çıxarmaqla geri qaytarın.
            <div className="mt-8">
              <AdSlot slot="sidebar" locale={locale} />
            </div>
            */}
          </aside>
        </div>
      </section>
    </>
  );
}
