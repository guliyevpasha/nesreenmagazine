import { RoseMark } from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** «Həftənin seçimi» bülleteni — səhifənin ortasında abunə zolağı. */
export default function NewsletterBand({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="relative overflow-hidden bg-bordo-deep text-cream">
      <RoseMark
        className="pointer-events-none absolute -end-16 -top-20 h-72 w-72 text-cream/[0.05]"
        strokeWidth={0.5}
      />
      <div className="container-mag relative grid items-center gap-10 py-16 lg:grid-cols-12 lg:gap-16 lg:py-20">
        <div className="lg:col-span-6">
          <p className="eyebrow flex items-center gap-3 text-gold-soft">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            {dict.newsletter.badge}
          </p>
          <h2 className="mt-5 text-4xl text-cream sm:text-5xl">{dict.newsletter.title}</h2>
          <p className="mt-5 max-w-lg font-display text-[1.05rem] italic leading-relaxed text-cream/75">
            {dict.newsletter.text}
          </p>
        </div>
        <div className="lg:col-span-6">
          <NewsletterForm locale={locale} variant="dark" />
        </div>
      </div>
    </section>
  );
}
