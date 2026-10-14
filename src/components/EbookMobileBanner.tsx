"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getActiveEbookBanner } from "@/lib/data/ebook";
import type { Locale } from "@/lib/i18n/config";
import type { EbookBanner as EbookBannerType } from "@/lib/types";

export default function EbookMobileBanner({ locale = "az" }: { locale?: Locale }) {
  const [banner, setBanner] = useState<EbookBannerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    getActiveEbookBanner()
      .then(setBanner)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !banner || closed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden">
      <div className="relative overflow-hidden border-t-4 border-[#8b4513] bg-gradient-to-r from-[#f8f6f3] via-white to-[#f8f6f3] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] backdrop-blur-sm">
        {/* Decorative pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiM4YjQ1MTMiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        
        {/* Close Button - Premium style */}
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 shadow-md transition-all hover:scale-110 hover:from-gray-200 hover:to-gray-300 hover:text-gray-800"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <a
          href={banner.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center gap-3 p-3 pr-12"
        >
          {/* Image with premium frame */}
          <div className="relative flex-shrink-0">
            <div className="relative h-28 w-[85px] overflow-hidden rounded-xl shadow-lg ring-2 ring-[#8b4513]/20">
              <Image
                src={banner.coverImage}
                alt={banner.title[locale] || banner.title.az}
                fill
                className="object-cover"
              />
              {/* Shine overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
            </div>
            
            {/* Discount badge - floating */}
            <div className="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] via-[#f4e4c1] to-[#d4af37] shadow-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b4513] to-[#a0522d]">
                <span className="font-display text-[11px] font-bold leading-none text-[#f4e4c1]">
                  {banner.discountText[locale]?.replace(/[^0-9]/g, '') || "20"}%
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Badge */}
            <span className="inline-block rounded-full bg-gradient-to-r from-[#8b4513] to-[#a0522d] px-2.5 py-1 font-ui text-[9px] font-bold uppercase tracking-wide text-[#f4e4c1] shadow-sm">
              {banner.badgeText[locale] || banner.badgeText.az}
            </span>
            
            <h4 className="mt-1.5 font-display text-[15px] font-bold leading-tight text-[#8b4513]">
              {banner.title[locale] || banner.title.az}
            </h4>
            
            {/* Price row */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-display text-xl font-extrabold text-[#8b4513]">{banner.price}</span>
              <span className="font-ui text-xs text-gray-400 line-through">{banner.originalPrice}</span>
            </div>

            {/* CTA Button */}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b4513] via-[#a0522d] to-[#8b4513] px-4 py-2 shadow-lg transition-all hover:shadow-xl active:scale-95">
              <span className="font-ui text-[11px] font-bold uppercase tracking-wide text-white drop-shadow">
                {banner.ctaText[locale] || banner.ctaText.az}
              </span>
              <svg className="h-3.5 w-3.5 text-[#f4e4c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Trust indicator */}
            <div className="mt-1.5 flex items-center gap-1">
              <svg className="h-3 w-3 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-ui text-[9px] font-medium text-gray-500">Digital • Instant Access</span>
            </div>
          </div>
        </a>

        {/* Bottom glow effect */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
      </div>
    </div>
  );
}
