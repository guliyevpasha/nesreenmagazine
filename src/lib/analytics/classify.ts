/**
 * Tracking üçün ortaq təsnifat funksiyaları (server tərəfi: /api/track, /api/track-view).
 */

export type DeviceType = "desktop" | "mobile" | "tablet";
export type TrafficSource = "organic" | "social" | "direct" | "referral";

const BOT_RE =
  /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http|java\//i;

/** Axtarış botları, link önizləyiciləri və skriptlər real oxucu sayılmır. */
export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_RE.test(userAgent);
}

export function detectDevice(ua: string): DeviceType {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

/** Referrer-in host-u (www. olmadan). Etibarsızdırsa boş sətir. */
export function referrerHost(referrer: string): string {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Saytın öz domeni (daxili keçid trafik mənbəyi sayılmır). */
export function isOwnHost(host: string): boolean {
  return !host || host.endsWith("nesreenmagazine.com") || host === "localhost" || host.endsWith(".vercel.app");
}

export function detectSource(referrer: string): TrafficSource {
  const host = referrerHost(referrer);
  if (isOwnHost(host)) return "direct";

  if (/facebook|fb\.|instagram|twitter|t\.co$|x\.com|linkedin|tiktok|youtube|pinterest|threads|vk\.com|t\.me/.test(host)) {
    return "social";
  }
  if (/google\.|bing\.|yahoo\.|duckduckgo|yandex\.|ecosia|baidu/.test(host)) {
    return "organic";
  }
  return "referral";
}

/**
 * Səhifə yolunu statistika açarına çevirir: sorğu/hash atılır, kodlaşdırma açılır
 * (kiril/ərəb slug oxunaqlı olsun), sondakı «/» silinir, uzunluq məhdudlaşdırılır.
 */
export function normalizePath(path: string): string {
  let p = String(path || "/").split(/[?#]/)[0] || "/";
  try {
    p = decodeURIComponent(p);
  } catch {
    /* olduğu kimi saxla */
  }
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  // Firestore sahə adı məhdudiyyəti: __x__ formatı ehtiyatdadır
  p = p.replace(/__/g, "_");
  return p.slice(0, 150);
}

/** Saytdaxili axtarış sözünü açar kimi normallaşdırır. */
export function normalizeSearchTerm(term: string): string {
  return String(term || "")
    .toLocaleLowerCase("az")
    .replace(/\s+/g, " ")
    .replace(/__/g, "_")
    .trim()
    .slice(0, 60);
}
