/**
 * Unsplash API inteqrasiyası
 * Pulsuz, yüksək keyfiyyətli şəkillər üçün
 */

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = "https://api.unsplash.com";

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

/**
 * Unsplash-dan query əsasında şəkil axtarır
 */
export async function searchUnsplashPhoto(
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY not configured");
    return null;
  }

  try {
    const params = new URLSearchParams({
      query,
      orientation,
      per_page: "1",
      content_filter: "high", // Yalnız yüksək keyfiyyətli məzmun
    });

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?${params}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        next: { revalidate: 86400 }, // 24 saat cache
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error("Error fetching from Unsplash:", error);
    return null;
  }
}

/**
 * Kateqoriya və subcategory əsasında Unsplash query generasiya edir
 */
export function generateUnsplashQuery(
  category: string,
  subcategory?: string
): string {
  const queries: Record<string, Record<string, string> | string> = {
    moda: {
      trendler: "fashion trends runway",
      "kuce-modasi": "street style fashion",
      podium: "fashion show catwalk",
      "stil-meslehetleri": "fashion styling outfit",
      aksesuarlar: "fashion accessories",
      canta: "designer handbag luxury",
      default: "fashion style clothing",
    },
    gozellik: {
      "deri-baximi": "skincare beauty routine",
      makiyaj: "makeup beauty cosmetics",
      sac: "hair styling beauty",
      etir: "perfume fragrance bottle",
      default: "beauty cosmetics",
    },
    "heyat-terzi": {
      texnologiya: "modern technology laptop",
      seyahet: "travel destination wanderlust",
      yemek: "food cuisine cooking",
      "ev-dekorasiyasi": "interior design home decor",
      default: "lifestyle daily life",
    },
    biznes: {
      karyera: "business career professional",
      sahibkarliq: "entrepreneur startup business",
      maliyye: "finance money investment",
      liderlik: "leadership team management",
      "ilham-veren-qadinlar": "successful women business",
      default: "business professional",
    },
    gundem: {
      xeberler: "news conference event",
      magazin: "celebrity fashion event",
      medeniyyet: "culture art exhibition",
      musahibe: "interview portrait professional",
      default: "news event",
    },
    astrologiya: {
      burcler: "zodiac stars astrology",
      tarot: "tarot cards mystical",
      uygunluq: "couple relationship compatibility",
      "ay-teqvimi": "moon night sky",
      "tebii-daslar": "crystals gemstones healing",
      numerologiya: "numbers sacred geometry",
      matrix: "energy spiritual matrix",
      default: "astrology zodiac stars",
    },
  };

  const categoryQueries = queries[category];
  
  if (typeof categoryQueries === "string") {
    return categoryQueries;
  }

  if (categoryQueries && subcategory && categoryQueries[subcategory]) {
    return categoryQueries[subcategory];
  }

  if (categoryQueries && categoryQueries.default) {
    return categoryQueries.default;
  }

  return "magazine editorial";
}

/**
 * Unsplash şəkil URL-ni Unsplash guideline-a uyğun format edir
 * və müəllif məlumatını qaytarır
 */
export function formatUnsplashCredit(photo: UnsplashPhoto): {
  imageUrl: string;
  credit: string;
  creditUrl: string;
} {
  // Unsplash guideline tələb edir ki, UTM parametrləri əlavə olunmalıdır
  const creditUrl = `${photo.user.links.html}?utm_source=nesreen_magazine&utm_medium=referral`;
  const photoUrl = `${photo.links.html}?utm_source=nesreen_magazine&utm_medium=referral`;

  return {
    imageUrl: photo.urls.regular,
    credit: `Photo by ${photo.user.name} on Unsplash`,
    creditUrl,
  };
}
