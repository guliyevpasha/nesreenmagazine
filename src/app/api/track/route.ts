/**
 * Saytın ümumi statistikası üçün tracking endpoint-i (səhifə baxışı, aktiv vaxt, axtarış).
 *
 * Açıqdır (oxucular anonimdir), amma:
 *  - yalnız məlum hadisə növləri və məhdud ölçülü sahələr qəbul olunur (zod);
 *  - botlar sayılmır; IP üzrə dəqiqədə limit var;
 *  - ölkə/şəhər Vercel-in başlıqlarından götürülür (IP saxlanmır);
 *  - Firestore qaydaları yalnız +1 / kiçik artımlara icazə verir.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  detectDevice,
  detectSource,
  isBot,
  isOwnHost,
  normalizePath,
  normalizeSearchTerm,
  referrerHost,
} from "@/lib/analytics/classify";
import { recordEngagement, recordPageview, recordSearch } from "@/lib/analytics/site-stats";

const locale = z.enum(["az", "en", "ru", "tr", "ar"]);
const id = z.string().min(4).max(80).regex(/^[A-Za-z0-9_-]+$/);

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pageview"),
    path: z.string().min(1).max(400),
    locale,
    visitorId: id.optional(),
    sessionId: id,
    newSession: z.boolean(),
    sessionPage: z.number().int().min(1).max(10000),
    referrer: z.string().max(1000).optional(),
  }),
  z.object({
    type: z.literal("engagement"),
    path: z.string().min(1).max(400),
    locale,
    sessionId: id,
    seconds: z.number().min(0).max(3600),
    first: z.boolean(),
  }),
  z.object({
    type: z.literal("search"),
    q: z.string().min(2).max(100),
    locale,
  }),
]);

// Sadə IP limiti (hər server nüsxəsində ayrıca). Mobil operatorlarda çox istifadəçi
// eyni IP-dən çıxır, ona görə limit səxavətlidir.
const hits = new Map<string, { n: number; reset: number }>();
function allow(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || cur.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return true;
  }
  cur.n += 1;
  return cur.n <= 120;
}

function geo(request: NextRequest): { country: string; city: string } {
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  let city = request.headers.get("x-vercel-ip-city") || "";
  try {
    city = decodeURIComponent(city);
  } catch {
    /* olduğu kimi */
  }
  return {
    country: /^[A-Z]{2}$/.test(country) ? country : "",
    city: city.replace(/[|_]/g, " ").trim().slice(0, 60),
  };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!allow(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const ua = request.headers.get("user-agent") || "";
  if (isBot(ua)) return NextResponse.json({ ok: true, skipped: "bot" });

  let body: unknown;
  try {
    // sendBeacon text/plain və ya application/json göndərə bilər
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const ev = parsed.data;
  const { country, city } = geo(request);

  try {
    if (ev.type === "pageview") {
      const host = referrerHost(ev.referrer || "");
      await recordPageview({
        path: normalizePath(ev.path),
        locale: ev.locale,
        visitorId: ev.visitorId,
        sessionId: ev.sessionId,
        newSession: ev.newSession,
        sessionPage: ev.sessionPage,
        device: detectDevice(ua),
        source: detectSource(ev.referrer || ""),
        referrerHost: isOwnHost(host) ? "" : host.slice(0, 80),
        country,
        city,
      });
    } else if (ev.type === "engagement") {
      await recordEngagement({
        sessionId: ev.sessionId,
        path: normalizePath(ev.path),
        locale: ev.locale,
        seconds: ev.seconds,
        first: ev.first,
        country,
      });
    } else {
      const term = normalizeSearchTerm(ev.q);
      if (term.length >= 2) await recordSearch(term);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/track]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
