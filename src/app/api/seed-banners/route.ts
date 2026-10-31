import { NextResponse } from "next/server";
import { createBanner } from "@/lib/data/banners";
import type { AdvancedAdBannerInput } from "@/lib/types";

const defaultBanners: AdvancedAdBannerInput[] = [
  // Sidebar Banner - Maqalə Sol Sidebar
  {
    name: "Default Sidebar Banner",
    imageUrl: "/banners/sidebar-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-sidebar-left"],
    dimensions: { width: 300, height: 250 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Sidebar Banner - Maqalə Sağ Sidebar
  {
    name: "Default Right Sidebar Banner",
    imageUrl: "/banners/sidebar-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-sidebar-right"],
    dimensions: { width: 300, height: 250 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Inline H2 Banner
  {
    name: "Default H2 Inline Banner",
    imageUrl: "/banners/leaderboard-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-between-h2"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Inline H3 Banner
  {
    name: "Default H3 Inline Banner",
    imageUrl: "/banners/leaderboard-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-between-h3"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Header Banner
  {
    name: "Default Header Banner",
    imageUrl: "/banners/leaderboard-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-header"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "slide",
    createdBy: "system",
  },
  
  // Footer Banner
  {
    name: "Default Footer Banner",
    imageUrl: "/banners/leaderboard-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-inline"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Mobile Header Banner
  {
    name: "Default Mobile Header Banner",
    imageUrl: "/banners/sidebar-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-header"],
    dimensions: { width: 320, height: 100 },
    active: true,
    showOn: { desktop: false, tablet: false, mobile: true },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
  
  // Mobile Inline Banner
  {
    name: "Default Mobile Inline Banner",
    imageUrl: "/banners/sidebar-banner-v2.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-between-h2", "article-between-h3"],
    dimensions: { width: 320, height: 100 },
    active: true,
    showOn: { desktop: false, tablet: false, mobile: true },
    priority: 1,
    animation: "fade",
    createdBy: "system",
  },
];

export async function POST() {
  try {
    const results = [];
    
    for (const banner of defaultBanners) {
      const id = await createBanner(banner, "system");
      results.push({ id, name: banner.name });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${results.length} default banners`,
      banners: results,
    });
  } catch (error) {
    console.error("Error seeding banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
