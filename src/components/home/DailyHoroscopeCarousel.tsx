"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import ZodiacIcon from "@/components/ZodiacIcon";
import type { ZodiacElement, ZodiacKey } from "@/lib/zodiac";

export type DailySlide = {
  key: ZodiacKey;
  element: ZodiacElement;
  name: string;
  dates: string;
  elementLabel: string;
  reading: string;
  href: string;
};

type Labels = {
  daily: string;
  seasonNow: string;
  readMore: string;
  previous: string;
  next: string;
};

/**
 * Günlük bürc şərhi — sürüşdürülən kartlar.
 * İlk kart hazırkı bürc dövrüdür, sonra bürclər təqvim ardıcıllığı ilə gəlir
 * (sıranı server qurur). Telefonda barmaqla sürüşdürülür (növbəti kartın kənarı
 * görünür), PC-də oxlarla; nişanlar və sayğac aktiv kartı göstərir.
 */
export default function DailyHoroscopeCarousel({
  slides,
  labels,
}: {
  slides: DailySlide[];
  labels: Labels;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Animasiya bitməmiş ardıcıl kliklər üçün son hədəf.
  const targetRef = useRef(0);
  const total = slides.length;

  // Aktiv kartı görünən hissəyə görə izləyirik (RTL-də də düzgün işləyir).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const i = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) {
              targetRef.current = i;
              setActive(i);
            }
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [total]);

  const goTo = useCallback(
    (index: number) => {
      const i = (index + total) % total;
      targetRef.current = i;
      const track = trackRef.current;
      const slide = slideRefs.current[i];
      if (!track || !slide) return;
      // Yalnız trek üfüqi sürüşür (səhifə yerində qalır); RTL-də kartın
      // başlanğıcı sağ kənardır, scroll-padding nəzərə alınır.
      const rtl = getComputedStyle(track).direction === "rtl";
      const trackBox = track.getBoundingClientRect();
      const slideBox = slide.getBoundingClientRect();
      const padStart = parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
      const delta = rtl
        ? slideBox.right - (trackBox.right - padStart)
        : slideBox.left - (trackBox.left + padStart);
      track.scrollBy({ left: delta, behavior: "smooth" });
    },
    [total],
  );

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.daily}
    >
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-10 pt-1 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        onKeyDown={(e) => {
          const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
          if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(targetRef.current + (rtl ? -1 : 1));
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(targetRef.current + (rtl ? 1 : -1));
          }
        }}
      >
        {slides.map((s, i) => {
          const current = i === 0;
          return (
            <article
              key={s.key}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-index={i}
              aria-roledescription="slide"
              aria-label={`${pad(i + 1)} / ${pad(total)} — ${s.name}`}
              className="relative flex w-[86%] shrink-0 snap-start flex-col items-center bg-paper px-7 pb-9 pt-10 text-center shadow-[0_30px_60px_-40px_rgba(26,22,20,0.35)] sm:w-full sm:px-10"
            >
              <span className="pointer-events-none absolute inset-3 border border-gold/35" aria-hidden="true" />

              {/* Üst sətir: dövr + (ilk kartda) hazırkı bürc nişanı */}
              <p className="eyebrow relative text-gold">{labels.daily}</p>
              <p
                className={`relative mt-2 font-ui text-[9px] uppercase tracking-[0.22em] ${
                  current ? "text-bordo" : "text-transparent"
                }`}
                aria-hidden={!current}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {labels.seasonNow}
                </span>
              </p>

              <Link href={s.href} className="group relative mx-auto mt-5 block w-32 sm:w-40" tabIndex={-1}>
                <span className="block transition-transform duration-700 ease-out group-hover:rotate-[8deg]">
                  <ZodiacIcon sign={s.key} element={s.element} className="w-full" strokeWidth={1.6} />
                </span>
              </Link>

              <h3 className="relative mt-6 text-[2.4rem] leading-none sm:text-[2.75rem]">
                <Link href={s.href} className="link-underline">
                  {s.name}
                </Link>
              </h3>
              <p className="relative mt-3 font-ui text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">
                {s.dates}
                <span className="mx-2 text-gold" aria-hidden="true">·</span>
                {s.elementLabel}
              </p>

              {s.reading && (
                <>
                  <div className="relative mx-auto mt-6 flex w-full max-w-[10rem] items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-gold/50" />
                    <span className="h-1 w-1 rotate-45 bg-gold" />
                    <span className="h-px flex-1 bg-gold/50" />
                  </div>
                  <p className="relative mx-auto mt-6 max-w-md font-display text-[1.05rem] italic leading-relaxed text-ink-soft sm:text-[1.15rem]">
                    {s.reading}
                  </p>
                </>
              )}

              <Link
                href={s.href}
                className="relative mt-auto inline-flex items-center gap-3 pt-8 font-ui text-[11px] uppercase tracking-[0.2em] text-bordo"
              >
                <span className="link-underline">{labels.readMore}</span>
                <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
              </Link>
            </article>
          );
        })}
      </div>

      {/* İdarəetmə: oxlar, sayğac, irəliləyiş xətti */}
      <div className="-mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => goTo(targetRef.current - 1)}
          aria-label={labels.previous}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-bordo hover:bg-bordo hover:text-cream"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">←</span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <p className="font-ui text-[10px] uppercase tracking-[0.22em] text-muted" aria-live="polite">
            <span className="font-display text-[0.95rem] normal-case tracking-normal text-ink">
              {pad(active + 1)}
            </span>
            <span className="mx-1.5">/</span>
            {pad(total)}
            <span className="mx-2 text-gold" aria-hidden="true">·</span>
            <span className="text-ink-soft">{slides[active]?.name}</span>
          </p>
          <div className="relative h-px w-full max-w-[12rem] bg-line" aria-hidden="true">
            <span
              className="absolute inset-y-0 start-0 bg-bordo transition-[width] duration-500 ease-out"
              style={{ width: `${((active + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(targetRef.current + 1)}
          aria-label={labels.next}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-bordo hover:bg-bordo hover:text-cream"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">→</span>
        </button>
      </div>
    </div>
  );
}
