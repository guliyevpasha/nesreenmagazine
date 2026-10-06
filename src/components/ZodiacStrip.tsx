import Link from "next/link";

import ZodiacIcon from "@/components/ZodiacIcon";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { zodiac, zodiacDateRange, zodiacName } from "@/lib/zodiac";

/**
 * 12 bürcün yan-yana düzülmüş dairələri.
 * Mobil ekranda üfüqi sürüşür, geniş ekranda tam sığır.
 */
export default function ZodiacStrip({
  locale,
  withDates = false,
}: {
  locale: Locale;
  withDates?: boolean;
}) {
  return (
    <ul className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 sm:gap-7 lg:mx-0 lg:grid lg:grid-cols-12 lg:gap-5 lg:overflow-visible lg:px-0">
      {zodiac.map((sign) => (
        <li key={sign.key} className="w-[92px] shrink-0 snap-start lg:w-auto">
          <Link
            href={routes.zodiac(locale, sign.key)}
            className="group flex flex-col items-center text-center"
          >
            <span className="block w-full transition-transform duration-500 ease-out group-hover:-translate-y-1">
              <ZodiacIcon sign={sign.key} element={sign.element} className="w-full" />
            </span>
            <span className="mt-3 block font-display text-[0.9375rem] leading-tight text-ink dark:text-cream transition-colors duration-300 group-hover:text-bordo dark:group-hover:text-[#e88ba3]">
              {zodiacName(sign.key, locale)}
            </span>
            {withDates && (
              <span className="mt-1 block font-ui text-[10px] leading-tight tracking-wide text-muted dark:text-[#b5aca0]">
                {zodiacDateRange(sign, locale)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
