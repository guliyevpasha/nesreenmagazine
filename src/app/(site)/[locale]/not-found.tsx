import Link from "next/link";

import { RoseMark } from "@/components/Logo";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

/**
 * 404 səhifəsi.
 * Bu səhifə dil parametrinə çata bilmir, ona görə standart dildə göstərilir.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <section className="container-read py-24 text-center lg:py-32">
      <RoseMark className="mx-auto h-12 w-12 text-bordo/60" strokeWidth={1} />
      <p className="mt-8 font-display text-6xl text-gold-soft">404</p>
      <h1 className="mt-4 text-3xl sm:text-4xl">{dict.common.notFoundTitle}</h1>
      <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
        {dict.common.notFoundText}
      </p>
      <Link href={routes.home(defaultLocale)} className="btn-primary mt-10">
        {dict.common.backHome}
      </Link>
    </section>
  );
}
