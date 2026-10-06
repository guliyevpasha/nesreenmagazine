"use client";

import Link from "next/link";
import { useState } from "react";

import ZodiacIcon from "@/components/ZodiacIcon";
import type { HoroscopePeriod } from "@/lib/content/horoscopes";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { zodiac, zodiacDateRange, zodiacName } from "@/lib/zodiac";

type TabKey = HoroscopePeriod | "tarot" | "rising" | "compatibility" | "gifts";

/** Hər bürcün seçilmiş dövr üzrə qısa şərhi — serverdən gəlir. */
export type ReadingMap = Partial<Record<HoroscopePeriod, Record<string, string>>>;

/**
 * Astrologiya bölməsinin başlığı: dövr seçiciləri və 12 bürcün dairələri.
 * Günlük / Həftəlik / Aylıq seçildikdə bürc kartının altında həmin dövrün
 * şərhi görünür.
 */
export default function AstrologyTabs({
  locale,
  readings,
}: {
  locale: Locale;
  readings: ReadingMap;
}) {
  const dict = getDictionary(locale);
  const [active, setActive] = useState<TabKey>("daily");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "daily", label: dict.astro.tabs.daily },
    { key: "weekly", label: dict.astro.tabs.weekly },
    { key: "monthly", label: dict.astro.tabs.monthly },
    { key: "tarot", label: dict.astro.tabs.tarot },
    { key: "rising", label: dict.astro.tabs.rising },
    { key: "compatibility", label: dict.astro.tabs.compatibility },
    { key: "gifts", label: dict.astro.tabs.gifts },
  ];

  const isPeriod = active === "daily" || active === "weekly" || active === "monthly";
  const periodReadings = isPeriod ? readings[active] ?? {} : {};

  return (
    <div>
      {/* ---------- Dövr seçiciləri ---------- */}
      <div
        className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
        role="tablist"
        aria-label={dict.astro.title}
      >
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.key)}
              className={`shrink-0 border px-5 py-3 font-ui text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                selected
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-transparent text-ink hover:border-bordo hover:text-bordo"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---------- Məzmun ---------- */}
      <div className="mt-12" role="tabpanel">
        {isPeriod ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
            {zodiac.map((sign) => {
              const reading = periodReadings[sign.key] ?? "";
              return (
                <li key={sign.key}>
                  <Link
                    href={routes.zodiac(locale, sign.key)}
                    className="group flex h-full flex-col items-center text-center"
                  >
                    <ZodiacIcon
                      sign={sign.key}
                      element={sign.element}
                      className="w-[86px] transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:w-24"
                    />
                    <h3 className="mt-4 font-display text-xl leading-tight text-ink transition-colors duration-300 group-hover:text-bordo">
                      {zodiacName(sign.key, locale)}
                    </h3>
                    <p className="mt-1 font-ui text-[10px] tracking-wide text-muted">
                      {zodiacDateRange(sign, locale)}
                    </p>
                    {reading && (
                      <p className="clamp-3 mt-3 text-[0.875rem] leading-relaxed text-ink-soft">
                        {reading}
                      </p>
                    )}
                    <span className="mt-3 font-ui text-[10px] uppercase tracking-[0.16em] text-bordo opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {dict.astro.readSign} →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mx-auto max-w-md border border-dashed border-gold/50 bg-cream-deep/40 px-8 py-14 text-center">
            <span className="eyebrow text-gold">{dict.soon.badge}</span>
            <p className="mt-4 font-display text-2xl text-ink">
              {tabs.find((tab) => tab.key === active)?.label}
            </p>
            <p className="mt-3 text-sm text-ink-soft">{dict.astro.comingSoonTab}</p>
          </div>
        )}
      </div>
    </div>
  );
}
