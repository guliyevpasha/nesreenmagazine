import { NextResponse, type NextRequest } from "next/server";

import { isLocale, pickLocale } from "@/lib/i18n/config";

/**
 * Nesreen Magazine — dil yönləndirməsi.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 *
 * Dil kodu olmayan ünvanları oxucunun brauzer dilinə uyğun səhifəyə yönləndirir:
 *   /            → /az   (və ya brauzerin dilinə görə /ru, /en, /tr, /ar)
 *   /moda        → /az/moda
 * Admin panel və statik fayllar toxunulmadan buraxılır.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] ?? "";
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Aşağıdakılardan başqa bütün ünvanlar:
     *   /admin        — idarə paneli
     *   /api          — server sorğuları
     *   /_next        — Next.js faylları
     *   nöqtəli fayllar (icon.svg, robots.txt, sitemap.xml, şəkillər)
     */
    "/((?!admin|api|_next|.*\\.).*)",
  ],
};
