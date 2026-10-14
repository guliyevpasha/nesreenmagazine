"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getActiveEbookBanner } from "@/lib/data/ebook";
import type { Locale } from "@/lib/i18n/config";
import type { EbookBanner as EbookBannerType } from "@/lib/types";

export default function EbookSidebarBanner({ locale = "az", side }: { locale?: Locale; side: "left" | "right" }) {
  const [banner, setBanner] = useState<EbookBannerType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveEbookBanner()
      .then(setBanner)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !banner) return null;

  return (
    <div
      className={`fixed top-24 z-40 hidden w-[180px] xl:block ${
        side === "left" ? "left-4 2xl:left-8" : "right-4 2xl:right-8"
      }`}
    >
      <a
        href={banner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-[#f8f6f3] via-white to-[#f8f6f3] shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_rgba(139,69,19,0.25)] hover:scale-[1.02]"
      >
        {/* Decorative gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
        
        {/* Badge */}
        <div className="relative bg-gradient-to-r from-[#8b4513] via-[#a0522d] to-[#8b4513] px-3 py-2 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoMjB2MjBIMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30" />
          <p className="relative font-ui text-[9px] font-bold uppercase tracking-[0.15em] text-[#f4e4c1] drop-shadow-sm">
            {banner.badgeText[locale] || banner.badgeText.az}
          </p>
        </div>

        {/* Cover Image with premium border */}
        <div className="relative p-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
            <Image
              src={banner.coverImage}
              alt={banner.title[locale] || banner.title.az}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Shine effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
          
          {/* Discount badge - floating */}
          <div className="absolute -right-1 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] via-[#f4e4c1] to-[#d4af37] shadow-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b4513] to-[#a0522d]">
              <span className="font-display text-[10px] font-bold leading-none text-[#f4e4c1]">
                {banner.discountText[locale]?.replace(/[^0-9]/g, '') || "20"}%
              </span>
            </div>
          </div>
        </div>

        {/* Content with premium styling */}
        <div className="relative space-y-3 px-4 pb-4">
          <h4 className="font-display text-sm font-bold leading-tight text-[#8b4513] transition-colors group-hover:text-[#a0522d]">
            {banner.title[locale] || banner.title.az}
          </h4>
          
          {/* Price section with gold accent */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-extrabold text-[#8b4513]">{banner.price}</span>
              <span className="font-ui text-xs text-gray-400 line-through">{banner.originalPrice}</span>
            </div>
          </div>

          {/* Premium CTA button */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#8b4513] via-[#a0522d] to-[#8b4513] p-[2px] shadow-lg transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(139,69,19,0.4)]">
            <div className="relative flex items-center justify-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#8b4513] to-[#a0522d] px-4 py-2.5 transition-all duration-300 group-hover:from-[#a0522d] group-hover:to-[#8b4513]">
              <span className="font-ui text-[11px] font-bold uppercase tracking-wide text-white drop-shadow">
                {banner.ctaText[locale] || banner.ctaText.az}
              </span>
              <svg className="h-3.5 w-3.5 text-[#f4e4c1] transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-1.5 border-t border-[#8b4513]/10 pt-3">
            <svg className="h-3 w-3 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-ui text-[9px] font-medium text-gray-500">Instant Access</span>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f4e4c1] to-[#d4af37] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />
      </a>
    </div>
  );
}
