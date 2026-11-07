"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RoseMark } from "@/components/Logo";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

/**
 * 404 səhifəsi.
 * Dil URL-dən oxunur; tapılmazsa standart dil (az) istifadə olunur.
 */
export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const raw = params?.locale;
  const locale = raw && isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <section className="container-read py-24 text-center lg:py-32">
      <RoseMark className="mx-auto h-12 w-12 text-bordo/60" strokeWidth={1} />
      <p className="mt-8 font-display text-6xl text-gold-soft">404</p>
      <h1 className="mt-4 text-3xl sm:text-4xl">{dict.common.notFoundTitle}</h1>
      <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
        {dict.common.notFoundText}
      </p>
      <Link href={routes.home(locale)} className="btn-primary mt-10">
        {dict.common.backHome}
      </Link>
    </section>
  );
}
