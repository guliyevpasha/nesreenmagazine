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
        className={`group mx-auto flex w-full flex-col items-center justify-center gap-2 border border-dashed border-gold/45 bg-cream-deep/40 text-center transition-colors duration-500 hover:border-gold hover:bg-cream-deep/70 ${shape.className}`}
      >
        <span className="font-display text-lg text-bordo/70">{dict.ads.placeholder}</span>
        <span className="font-ui text-[10px] uppercase tracking-[0.24em] text-muted">
          {shape.label}
        </span>
        <span className="font-ui text-[11px] uppercase tracking-[0.16em] text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {dict.ads.cta}
        </span>
      </Link>
    </aside>
  );
}
