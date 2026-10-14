"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getActiveEbookBanner } from "@/lib/data/ebook";
import type { Locale } from "@/lib/i18n/config";
import type { EbookBanner as EbookBannerType } from "@/lib/types";

export default function EbookBanner({ locale = "az" }: { locale?: Locale }) {
  const [banner, setBanner] = useState<EbookBannerType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveEbookBanner()
      .then(setBanner)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="my-12 flex items-center justify-center rounded-lg border-2 border-bordo/20 bg-cream py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-bordo/30 border-t-bordo"></div>
          <p className="mt-3 font-ui text-xs text-muted">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!banner) return null;

  const previewImages = banner.previewImages || [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % previewImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  return (
    <div className="not-prose my-12 overflow-hidden rounded-lg border-2 border-bordo/20 bg-gradient-to-br from-cream via-paper to-cream shadow-xl">
      {/* Badge */}
      <div className="bg-bordo px-6 py-3 text-center">
        <p className="font-ui text-xs font-semibold uppercase tracking-wider text-gold">
          {banner.badgeText[locale] || banner.badgeText.az}
        </p>
      </div>

      <div className="grid gap-8 p-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Images */}
        <div className="space-y-6">
          {/* Main Cover */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
            <Image
              src={banner.coverImage}
              alt={banner.title[locale] || banner.title.az}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Preview Slider */}
          {previewImages.length > 0 && (
            <div className="relative">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-ink/5">
                <Image
                  src={previewImages[currentSlide]}
                  alt={`Preview ${currentSlide + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Slider Controls */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="rounded-full bg-bordo p-2 text-cream transition-all hover:bg-bordo-deep hover:scale-110"
                  aria-label="Previous"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {previewImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide ? "w-8 bg-bordo" : "w-2 bg-bordo/30"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextSlide}
                  className="rounded-full bg-bordo p-2 text-cream transition-all hover:bg-bordo-deep hover:scale-110"
                  aria-label="Next"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center">
          <h3 className="font-display text-3xl text-bordo lg:text-4xl">
            {banner.title[locale] || banner.title.az}
          </h3>
          <p className="mt-3 font-display text-lg leading-snug text-ink lg:text-xl">
            {banner.subtitle[locale] || banner.subtitle.az}
          </p>
          <p className="mt-4 font-ui text-[15px] leading-relaxed text-muted">
            {banner.description[locale] || banner.description.az}
          </p>

          {/* Features */}
          {banner.features[locale] && banner.features[locale].length > 0 && (
            <ul className="mt-6 space-y-2">
              {banner.features[locale].map((feature, index) => (
                <li key={index} className="flex items-start gap-2 font-ui text-[14px] text-ink">
                  <span className="text-bordo">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Price & CTA */}
          <div className="mt-8 flex items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-bordo">{banner.price}</span>
                <span className="font-ui text-lg text-muted line-through">
                  {banner.originalPrice}
                </span>
              </div>
              <span className="mt-1 inline-block rounded-full bg-gold/20 px-3 py-1 font-ui text-xs font-semibold uppercase tracking-wide text-bordo">
                {banner.discountText[locale] || banner.discountText.az}
              </span>
            </div>
          </div>

          <a
            href={banner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-bordo px-8 py-4 font-ui text-base font-semibold uppercase tracking-wide text-cream shadow-lg transition-all hover:bg-bordo-deep hover:shadow-xl hover:scale-105"
          >
            {banner.ctaText[locale] || banner.ctaText.az}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>

          <p className="mt-4 font-ui text-xs text-muted">
            * Digital product • Instant access • Secure payment
          </p>
        </div>
      </div>
    </div>
  );
}
