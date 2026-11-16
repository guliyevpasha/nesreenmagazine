import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { RoseMark } from "@/components/Logo";
import {
  PARTNERSHIP_EMAIL,
  PARTNERSHIP_INSTAGRAM,
  PARTNERSHIP_INSTAGRAM_URL,
  PARTNERSHIP_WHATSAPP,
  PARTNERSHIP_WHATSAPP_URL,
  partnershipContent,
} from "@/lib/content/partnership";
import { siteUrl } from "@/lib/firebase/config";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
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
  const c = partnershipContent[locale];

  return {
    title: dict.footer.advertising,
    description: c.lead,
    // Kanonik və dil alternativləri (əks halda ana səhifənin kanoniki miras qalır)
    alternates: {
      canonical: `${siteUrl}${routes.partnership(locale)}`,
      languages: Object.fromEntries(
        locales.map((code) => [code, `${siteUrl}${routes.partnership(code)}`]),
      ),
    },
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 font-display text-[1.9rem] leading-tight text-ink sm:text-[2.3rem]">
      <span className="h-px w-10 shrink-0 bg-gold" aria-hidden="true" />
      {children}
    </h2>
  );
}

export default async function PartnershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const c = partnershipContent[locale];
  const mailto = `mailto:${PARTNERSHIP_EMAIL}?subject=${encodeURIComponent(c.mailSubject)}`;

  return (
    <>
      {/* ---------- Giriş ---------- */}
      <section className="relative overflow-hidden bg-bordo-deep text-cream">
        <RoseMark
          className="pointer-events-none absolute -end-24 -top-24 h-[26rem] w-[26rem] text-cream/[0.05]"
          strokeWidth={0.5}
        />
        <div className="container-mag relative py-16 lg:py-24">
          <p className="flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-gold-soft">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            {c.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-[2.4rem] leading-[1.06] text-cream sm:text-5xl lg:text-[3.6rem]">
            {c.title}
          </h1>
          <p className="mt-7 max-w-2xl font-display text-[1.15rem] italic leading-relaxed text-cream/75">{c.lead}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={mailto}
              className="inline-flex items-center gap-3 bg-gold px-8 py-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-gold-soft"
            >
              {c.writeCta}
              <span aria-hidden="true" className="rtl:-scale-x-100">
                →
              </span>
            </a>
            <a
              href={PARTNERSHIP_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-cream/30 px-8 py-4 font-ui text-[11px] uppercase tracking-[0.22em] text-cream transition-colors duration-300 hover:border-gold hover:text-gold-soft"
            >
              {c.whatsappLabel}
            </a>
          </div>
        </div>

        {/* faktlar zolağı */}
        <div className="relative border-t border-cream/10">
          <dl className="container-mag grid grid-cols-2 lg:grid-cols-4">
            {c.facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`py-8 pe-4 lg:py-10 ${i % 2 === 1 ? "ps-6 border-s border-cream/10" : ""} ${
                  i >= 2 ? "border-t border-cream/10 lg:border-t-0" : ""
                } ${i === 2 ? "lg:border-s lg:ps-6" : ""}`}
              >
                <dt className="font-display text-[1.9rem] leading-none text-gold-soft sm:text-[2.3rem]">{fact.value}</dt>
                <dd className="mt-3 font-ui text-[11px] uppercase leading-relaxed tracking-[0.16em] text-cream/60">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Formatlar ---------- */}
      <section className="container-mag py-16 lg:py-24">
        <SectionTitle>{c.formatsTitle}</SectionTitle>
        <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">{c.formatsLead}</p>
        <div className="mt-12 grid border-s border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {c.formats.map((format, i) => (
            <article
              key={format.title}
              className="group relative border-b border-e border-line bg-paper/40 p-8 transition-colors duration-500 hover:bg-paper lg:p-10"
            >
              <span className="font-display text-[1.1rem] italic text-gold" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-[1.5rem] leading-snug text-ink">{format.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{format.text}</p>
              <span
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-bordo transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Reklam yerləri + prinsiplər ---------- */}
      <section className="bg-cream-deep/50">
        <div className="container-mag grid gap-14 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div>
            <SectionTitle>{c.placementsTitle}</SectionTitle>
            <ul className="mt-10 space-y-0 border-t border-line">
              {c.placements.map((place) => (
                <li key={place} className="flex items-start gap-4 border-b border-line py-5">
                  <RoseMark className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.4} />
                  <span className="text-[1.02rem] leading-relaxed text-ink">{place}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle>{c.principlesTitle}</SectionTitle>
            <ul className="mt-10 space-y-6">
              {c.principles.map((principle) => (
                <li key={principle} className="border-s-2 border-gold ps-5 font-display text-[1.15rem] italic leading-relaxed text-ink-soft">
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Necə işləyirik ---------- */}
      <section className="container-mag py-16 lg:py-24">
        <SectionTitle>{c.stepsTitle}</SectionTitle>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {c.steps.map((step, i) => (
            <li key={step.title} className="relative border-t border-ink pt-6">
              <span className="font-display text-[2.6rem] leading-none text-bordo/90">{i + 1}</span>
              <h3 className="mt-4 font-ui text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">{step.title}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Əlaqə ---------- */}
      <section className="container-mag pb-20 lg:pb-28">
        <div className="relative overflow-hidden bg-ink px-6 py-12 text-cream sm:px-12 lg:px-16 lg:py-16">
          <span className="pointer-events-none absolute inset-3 border border-gold/25" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="font-display text-[2rem] leading-tight text-cream sm:text-[2.6rem]">{c.contactTitle}</h2>
              <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-cream/70">{c.contactText}</p>

              <dl className="mt-10 space-y-6">
                <div>
                  <dt className="font-ui text-[10px] uppercase tracking-[0.28em] text-gold-soft">{c.emailLabel}</dt>
                  <dd className="mt-2">
                    <a href={mailto} className="font-display text-[1.5rem] text-cream transition-colors hover:text-gold-soft sm:text-[1.8rem]" dir="ltr">
                      {PARTNERSHIP_EMAIL}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-14 gap-y-6">
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-[0.28em] text-gold-soft">{c.whatsappLabel}</dt>
                    <dd className="mt-2">
                      <a
                        href={PARTNERSHIP_WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-ui text-[1.05rem] text-cream transition-colors hover:text-gold-soft"
                        dir="ltr"
                      >
                        {PARTNERSHIP_WHATSAPP}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-[0.28em] text-gold-soft">{c.instagramLabel}</dt>
                    <dd className="mt-2">
                      <a
                        href={PARTNERSHIP_INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-ui text-[1.05rem] text-cream transition-colors hover:text-gold-soft"
                        dir="ltr"
                      >
                        {PARTNERSHIP_INSTAGRAM}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="border border-cream/15 p-7">
                <p className="font-ui text-[10px] uppercase tracking-[0.28em] text-gold-soft">{c.briefTitle}</p>
                <ul className="mt-5 space-y-3">
                  {c.brief.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.98rem] text-cream/80">
                      <span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={mailto}
                  className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-gold px-6 py-4 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:bg-gold-soft"
                >
                  {c.writeCta}
                  <span aria-hidden="true" className="rtl:-scale-x-100">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
