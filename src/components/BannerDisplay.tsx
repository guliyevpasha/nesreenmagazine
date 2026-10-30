"use client";

import { useEffect, useState } from "react";
import type { AdvancedAdBanner } from "@/lib/types";
import { DEFAULT_BANNER_TEXT } from "@/lib/types";

interface BannerDisplayProps {
  banner?: AdvancedAdBanner;
  showPlaceholder?: boolean;
  className?: string;
}

/**
 * Banner Display Component
 * Aktiv banner və ya default placeholder göstərir
 */
export default function BannerDisplay({
  banner,
  showPlaceholder = true,
  className = "",
}: BannerDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Əgər banner yoxdursa və placeholder istənilirsə
  if (!banner && showPlaceholder) {
    return <PlaceholderBanner className={className} />;
  }

  if (!banner || !isClient) {
    return null;
  }

  // Device check
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isTablet = typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  const shouldShow =
    (isMobile && banner.showOn.mobile) ||
    (isTablet && banner.showOn.tablet) ||
    (isDesktop && banner.showOn.desktop);

  if (!shouldShow) {
    return null;
  }

  const animationClass = getAnimationClass(banner.animation || "none");

  const handleClick = async () => {
    if (banner.linkUrl) {
      // Track click
      try {
        await fetch("/api/banner-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerId: banner.id }),
        });
      } catch (err) {
        console.error("Banner click tracking failed:", err);
      }

      // Open link
      window.open(banner.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Track impression
  useEffect(() => {
    const trackImpression = async () => {
      try {
        await fetch("/api/banner-impression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerId: banner.id }),
        });
      } catch (err) {
        console.error("Banner impression tracking failed:", err);
      }
    };

    trackImpression();
  }, [banner.id]);

  return (
    <div className={`banner-display ${className}`}>
      <div
        className={`relative cursor-pointer overflow-hidden border border-line bg-cream-deep/30 ${animationClass}`}
        onClick={handleClick}
        style={{
          width: "100%",
          maxWidth: `${banner.dimensions.width}px`,
          aspectRatio: `${banner.dimensions.width} / ${banner.dimensions.height}`,
        }}
      >
        {banner.mediaType === "video" ? (
          <video
            src={banner.imageUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            aria-label={banner.altText}
          />
        ) : banner.imageUrl.endsWith(".html") ? (
          <iframe
            src={`${banner.imageUrl}?v=${Date.now()}`}
            className="h-full w-full border-0"
            title={banner.altText}
            loading="lazy"
          />
        ) : (
          <img
            src={banner.imageUrl}
            alt={banner.altText}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Reklam badge */}
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 text-[9px] uppercase tracking-wider text-white pointer-events-none">
          Reklam
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder Banner - Boş qaldığı zaman göstərilir
 * Motion/animated dizaynlı
 */
function PlaceholderBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`banner-placeholder ${className}`}>
      <div className="relative overflow-hidden border border-line bg-gradient-to-br from-[#6B0F2A] via-[#4A0A1C] to-[#2A0510] p-8 text-center">
        {/* Subtle background circles */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-gold animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white animate-pulse" style={{ animationDuration: "8s" }} />
        </div>
        
        <div className="relative z-10">
          {/* Megaphone icon - no animation */}
          <div className="mb-5 flex justify-center">
            <svg
              className="h-12 w-12 text-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3))' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          
          {/* Text */}
          <h3 className="mb-2 font-display text-xl font-semibold text-white tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {DEFAULT_BANNER_TEXT.title}
          </h3>
          <p className="mb-5 text-sm text-white/80">Peşəkar reklam xidməti</p>
          
          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${DEFAULT_BANNER_TEXT.contact.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>{DEFAULT_BANNER_TEXT.contact}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Animasiya class-ı qaytarır
 */
function getAnimationClass(animation: string): string {
  const animations: Record<string, string> = {
    fade: "animate-[fadeIn_1s_ease-in-out]",
    slide: "animate-[slideIn_0.8s_ease-out]",
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    none: "",
  };

  return animations[animation] || "";
}
