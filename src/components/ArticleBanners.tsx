"use client";

import { useEffect, useState } from "react";
import BannerDisplay from "./BannerDisplay";
import type { AdvancedAdBanner, AdBannerLocation } from "@/lib/types";

interface ArticleBannersProps {
  location: AdBannerLocation;
  className?: string;
}

/**
 * Məqalə bannerlərini yükləyir və göstərir
 */
export default function ArticleBanners({ location, className = "" }: ArticleBannersProps) {
  const [banner, setBanner] = useState<AdvancedAdBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanner();
  }, [location]);

  async function loadBanner() {
    try {
      const res = await fetch(`/api/banners/${location}`);
      if (res.ok) {
        const data = await res.json();
        setBanner(data.banner || null);
      }
    } catch (err) {
      console.error("Banner yüklənmədi:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null; // Yüklənərkən boşluq
  }

  return <BannerDisplay banner={banner || undefined} showPlaceholder={true} className={className} />;
}

/**
 * H2 və H3 başlıqlar arasında banner yerləşdirən komponent
 */
export function InjectBannersIntoContent({ html, location }: { html: string; location: AdBannerLocation }) {
  const [processedHtml, setProcessedHtml] = useState(html);
  const [banners, setBanners] = useState<AdvancedAdBanner[]>([]);

  useEffect(() => {
    loadBannersAndInject();
  }, [html, location]);

  async function loadBannersAndInject() {
    try {
      const res = await fetch(`/api/banners/${location}`);
      if (res.ok) {
        const data = await res.json();
        const banner = data.banner;
        
        if (banner) {
          // HTML-ə banner əlavə et
          const injected = injectBanners(html, banner, location);
          setProcessedHtml(injected);
        }
      }
    } catch (err) {
      console.error("Banner injection failed:", err);
    }
  }

  return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
}

/**
 * HTML-ə banner əlavə edən helper funksiya
 */
function injectBanners(html: string, banner: AdvancedAdBanner, location: AdBannerLocation): string {
  const tag = location === "article-between-h2" ? "h2" : "h3";
  const regex = new RegExp(`(</${tag}>)`, "gi");
  
  let count = 0;
  const bannerHtml = `
    <div class="my-8 flex justify-center">
      <div class="banner-injected w-full max-w-3xl">
        <div class="border border-line bg-cream-deep/30 p-4 text-center">
          <p class="text-[9px] uppercase tracking-wider text-muted mb-3">Reklam</p>
          <a href="${banner.linkUrl}" target="_blank" rel="noopener noreferrer" class="block">
            <img 
              src="${banner.imageUrl}" 
              alt="${banner.altText}"
              class="w-full h-auto mx-auto"
              style="max-width: ${banner.dimensions.width}px; max-height: ${banner.dimensions.height}px;"
            />
          </a>
        </div>
      </div>
    </div>
  `;

  return html.replace(regex, (match) => {
    count++;
    // Hər 2-ci başlıqdan sonra banner əlavə et
    if (count % 2 === 0) {
      return match + bannerHtml;
    }
    return match;
  });
}
