import { RoseMark } from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Məqalə mətninin sonunda «Həftənin seçimi» bülleteninə abunə çağırışı.
 * Bütün məqalələrdə avtomatik görünür; mətnlər `dict.newsletter` (5 dil).
 */
export default function ArticleNewsletterCta({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <aside
      aria-label={dict.newsletter.badge}
      className="relative mt-14 overflow-hidden bg-bordo-deep px-6 py-10 text-cream shadow-[0_30px_60px_-40px_rgba(43,20,28,0.8)] sm:px-10 sm:py-12"
    >
      {/* incə qızılı daxili haşiyə */}
      <span className="pointer-events-none absolute inset-2.5 border border-gold/30" aria-hidden="true" />
      <RoseMark
        className="pointer-events-none absolute -end-14 -top-14 h-56 w-56 text-cream/[0.06]"
        strokeWidth={0.5}
      />

      <div className="relative">
        <p className="flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.24em] text-gold-soft">
          <span className="h-px w-8 bg-gold" aria-hidden="true" />
          {dict.newsletter.badge}
        </p>
        <h2 className="mt-4 font-display text-[2rem] leading-[1.1] text-cream sm:text-[2.4rem]">
          {dict.newsletter.title}
        </h2>
        <p className="mt-4 max-w-xl font-display text-[1.05rem] italic leading-relaxed text-cream/75">
          {dict.newsletter.text}
        </p>
        <div className="mt-8 max-w-xl">
          <NewsletterForm locale={locale} variant="dark" />
        </div>
      </div>
    </aside>
  );
}
