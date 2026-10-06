import Link from "next/link";

import { RoseMark } from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

/**
 * Abunəlik və çap nəşri kimi hələ açılmamış bölmələr üçün səhifə.
 * Oxucu e-poçtunu qoyur — bölmə açılanda ona ilk xəbər verilir.
 */
export default function ComingSoon({
  locale,
  title,
  text,
}: {
  locale: Locale;
  title: string;
  text: string;
}) {
  const dict = getDictionary(locale);

  return (
    <section className="container-read py-20 text-center lg:py-28">
      <span className="eyebrow text-gold">{dict.soon.badge}</span>

      <RoseMark className="mx-auto mt-8 h-14 w-14 text-bordo/70" strokeWidth={1} />

      <h1 className="mt-8 text-4xl leading-tight sm:text-5xl">{title}</h1>

      <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft">
        {text}
      </p>

      <div className="mx-auto mt-10 max-w-lg">
        <NewsletterForm locale={locale} />
      </div>

      <div className="mt-12">
        <Link href={routes.home(locale)} className="btn-ghost">
          {dict.common.backHome}
        </Link>
      </div>
    </section>
  );
}
