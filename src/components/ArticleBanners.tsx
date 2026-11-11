/**
 * Saytdakı reklam bannerləri (məqalə, kateqoriya və ana səhifə yerləşmələri)
 *
 * Developed by Cradex Agency
 * https://cradexagency.com
 */
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import BannerDisplay from "./BannerDisplay";
import type { AdvancedAdBanner, AdBannerLocation } from "@/lib/types";

interface ArticleBannersProps {
  location: AdBannerLocation;
  /** Səhifənin bölməsi (kateqoriya slug-ı). Bölmə üzrə hədəflənmiş bannerlər üçün lazımdır. */
  category?: string;
  /** Uyğun banner yoxdursa standart «Reklamınız burada ola bilər» bloku göstərilsin. */
  placeholder?: boolean;
  className?: string;
}

async function fetchBanner(location: AdBannerLocation, category?: string): Promise<AdvancedAdBanner | null> {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  try {
    const res = await fetch(`/api/banners/${location}${qs}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.banner as AdvancedAdBanner) || null;
  } catch (err) {
    console.error("Banner yüklənmədi:", err);
    return null;
  }
}

/**
 * Bir yerləşmə üçün banneri yükləyir və göstərir
 */
export default function ArticleBanners({
  location,
  category,
  placeholder = true,
  className = "",
}: ArticleBannersProps) {
  const [banner, setBanner] = useState<AdvancedAdBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchBanner(location, category).then((b) => {
      if (!alive) return;
      setBanner(b);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [location, category]);

  if (loading) return null;

  return <BannerDisplay banner={banner || undefined} showPlaceholder={placeholder} className={className} />;
}

/** Məqalə mətnində H2/H3 başlıqlar arasına qoyulan boş yer tutucunun atributu. */
export const BANNER_SLOT_ATTR = "data-nm-banner-slot";

/**
 * Məqalə mətnindəki `<div data-nm-banner-slot="article-between-h2">` yer tutucularını tapıb
 * onların içinə banner çəkir (portal). Mətn serverdə təmizlənmiş HTML olaraq qalır, banner
 * isə brauzerdə yüklənir — beləliklə ISR keşi bannerləri köhnəltmir və izləmə işləyir.
 */
export function ArticleContentBanners({ category }: { category?: string }) {
  const [slots, setSlots] = useState<{ el: Element; location: AdBannerLocation }[]>([]);
  const [banners, setBanners] = useState<Record<string, AdvancedAdBanner | null>>({});

  useEffect(() => {
    const found = Array.from(document.querySelectorAll(`[${BANNER_SLOT_ATTR}]`))
      .map((el) => ({ el, location: el.getAttribute(BANNER_SLOT_ATTR) as AdBannerLocation }))
      .filter((s) => s.location === "article-between-h2" || s.location === "article-between-h3");
    setSlots(found);

    let alive = true;
    const locations = Array.from(new Set(found.map((s) => s.location)));
    Promise.all(locations.map(async (loc) => [loc, await fetchBanner(loc, category)] as const)).then((pairs) => {
      if (alive) setBanners(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
  }, [category]);

  return (
    <>
      {slots.map(({ el, location }, i) => {
        const banner = banners[location];
        if (!banner) return null;
        return createPortal(
          <BannerDisplay banner={banner} showPlaceholder={false} className="my-8 flex justify-center" />,
          el,
          `${location}-${i}`,
        );
      })}
    </>
  );
}
