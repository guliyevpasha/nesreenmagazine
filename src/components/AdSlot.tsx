import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import type { AdBanner, AdSlotId } from "@/lib/types";

/**
 * Reklam üçün ayrılmış sahələr.
 *
 * Sahə boşdursa səliqəli "kirayə verilir" örtüyü göstərilir; admin paneldən
 * banner əlavə ediləndə həmin şəkil bu yerdə görünür.
 *
 * Ölçülər (standart IAB formatları):
 *   leaderboard — 970×250 · geniş ekranda başlıqdan sonra
 *   billboard   — 728×90  · bölmələr arasında
 *   sidebar     — 300×600 · yan sütun
 *   inline      — 640×160 · məqalənin ortasında
 */

/**
 * Hər sahənin öz təbii ölçüsü var və banner ondan artıq dartılmır —
 * 970×250 şəkil geniş ekranda 1240 pikselə uzansaydı, həm keyfiyyəti itərdi,
 * həm də səhifədə həddindən artıq yer tutardı.
 */
const SHAPES: Record<AdSlotId, { className: string; maxWidth: number; label: string }> = {
  "home-leaderboard": { className: "aspect-[970/250]", maxWidth: 970, label: "970 × 250" },
  "home-mid": { className: "aspect-[728/90]", maxWidth: 728, label: "728 × 90" },
  "category-top": { className: "aspect-[970/250]", maxWidth: 970, label: "970 × 250" },
  "article-inline": { className: "aspect-[640/160]", maxWidth: 640, label: "640 × 160" },
  sidebar: { className: "aspect-[300/600]", maxWidth: 300, label: "300 × 600" },
};

export default function AdSlot({
  slot,
  locale,
  banner,
  className = "",
}: {
  slot: AdSlotId;
  locale: Locale;
  banner?: AdBanner | null;
  className?: string;
}) {
  const dict = getDictionary(locale);
  const shape = SHAPES[slot];

  if (banner?.active && banner.image) {
    return (
      <aside className={className} aria-label={dict.ads.label}>
        <p className="eyebrow mb-2 text-center text-muted/70">{dict.ads.label}</p>
        <a
          href={banner.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ maxWidth: shape.maxWidth }}
          className={`media-frame mx-auto block w-full ${shape.className}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.image} alt={banner.alt} className="h-full w-full object-cover" />
        </a>
      </aside>
    );
  }

  return (
    <aside className={className} aria-label={dict.ads.label}>
      <p className="eyebrow mb-2 text-center text-muted/70">{dict.ads.label}</p>
      <Link
        href={routes.contact(locale)}
        style={{ maxWidth: shape.maxWidth }}
        className={`group relative mx-auto flex w-full overflow-hidden border-2 border-dashed border-gold/30 bg-gradient-to-br from-cream via-cream-deep to-cream transition-all duration-500 hover:border-gold hover:shadow-xl ${shape.className}`}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#8b4513" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1500ms] ease-out group-hover:translate-x-full" />

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-3 p-6">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-bordo/10 transition-transform duration-500 group-hover:scale-110">
            <svg className="h-8 w-8 text-bordo/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>

          {/* Main text */}
          <div className="space-y-2">
            <p className="font-display text-xl font-semibold text-bordo transition-colors duration-300 group-hover:text-bordo-deep">
              {dict.ads.placeholder}
            </p>
            <p className="font-ui text-xs uppercase tracking-[0.2em] text-muted/80">
              {shape.label}
            </p>
          </div>

          {/* CTA button */}
          <div className="mt-2 flex items-center gap-2 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-bordo/5 px-6 py-2 opacity-0 transition-all duration-500 group-hover:opacity-100">
            <span className="font-ui text-xs font-semibold uppercase tracking-widest text-bordo">
              {dict.ads.cta}
            </span>
            <svg className="h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Pulse effect */}
          <div className="absolute inset-0 animate-pulse opacity-0 transition-opacity duration-700 group-hover:opacity-5">
            <div className="h-full w-full rounded-lg bg-gradient-to-tr from-gold via-bordo to-gold" />
          </div>
        </div>
      </Link>
    </aside>
  );
}
