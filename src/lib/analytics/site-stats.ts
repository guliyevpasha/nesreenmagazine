/**
 * Sayt səviyyəli günlük statistika (bütün səhifələr, yalnız məqalələr yox).
 *
 * Bir gün = bir sənəd: `analytics_site/{YYYY-MM-DD}` (Bakı vaxtı). Hər baxış bir
 * yazmadır, admin panel isə 12 aylıq hesabat üçün ən çoxu 365 sənəd oxuyur.
 *
 * Sahələr:
 *  views, visitors, sessions, multiPageSessions, engagedSeconds, engagedPages — sayğaclar
 *  pages{yol}, pageTime{yol}, locales{dil}, visitorLocales{dil}, countries{XX},
 *  cities{"XX|Şəhər"}, devices{növ}, sources{mənbə}, referrers{host}, searches{söz} — xəritələr
 *
 * Canlı istifadəçilər: `analytics_live/{sessionId}` — son görünmə vaxtı.
 * Unikal ziyarətçi: `analytics_site_visitors/{visitorId}_{tarix}` — yalnız yaradılır.
 *
 * Yazmalar /api/track (server) tərəfindən anonim Firestore SDK ilə edilir;
 * qaydalar (firestore.rules) yalnız məlum sahələrə və kiçik artımlara icazə verir.
 */

import { doc, increment, setDoc } from "firebase/firestore";
import { getDb } from "../firebase/client";
import { bakuDate } from "./track-views";
import type { DeviceType, TrafficSource } from "./classify";

export const SITE_DAILY = "analytics_site";
export const SITE_VISITORS = "analytics_site_visitors";
export const SITE_LIVE = "analytics_live";

/** Bir yazmada qəbul olunan maksimum aktiv vaxt (saniyə). Qaydalarda da eyni limit var. */
export const MAX_ENGAGED_PER_FLUSH = 120;

export interface PageviewEvent {
  path: string;
  locale: string;
  visitorId?: string;
  sessionId: string;
  newSession: boolean;
  /** Sessiyada neçənci səhifədir (1 = ilk). */
  sessionPage: number;
  device: DeviceType;
  source: TrafficSource;
  referrerHost: string;
  country: string;
  city: string;
}

async function safe(label: string, fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return true;
  } catch (error) {
    console.error(`[site-stats] ${label}:`, error);
    return false;
  }
}

export async function recordPageview(ev: PageviewEvent): Promise<void> {
  const db = getDb();
  if (!db) return;
  const date = bakuDate();
  const now = new Date().toISOString();
  const one = increment(1);

  // 1) Bu gün ilk dəfədirmi? (sənəd varsa qayda yaratmanı rədd edir)
  let newVisitor = false;
  if (ev.visitorId) {
    newVisitor = await safe("visitor", () =>
      setDoc(doc(db, SITE_VISITORS, `${ev.visitorId}_${date}`), { visitorId: ev.visitorId, date }),
    );
  }

  // 2) Günlük sənəd — bütün artımlar bir yazmada
  const data: Record<string, unknown> = {
    date,
    updatedAt: now,
    views: one,
    pages: { [ev.path]: one },
    locales: { [ev.locale]: one },
  };
  if (ev.newSession) {
    data.sessions = one;
    data.sources = { [ev.source]: one };
    if (ev.referrerHost) data.referrers = { [ev.referrerHost]: one };
  }
  if (ev.sessionPage === 2) data.multiPageSessions = one;
  if (newVisitor) {
    data.visitors = one;
    data.devices = { [ev.device]: one };
    data.visitorLocales = { [ev.locale]: one };
    if (ev.country) data.countries = { [ev.country]: one };
    if (ev.country && ev.city) data.cities = { [`${ev.country}|${ev.city}`]: one };
  }
  await safe("daily", () => setDoc(doc(db, SITE_DAILY, date), data, { merge: true }));

  // 3) Canlı istifadəçi
  await touchLive(ev.sessionId, ev.path, ev.locale, ev.country);
}

export async function recordEngagement(ev: {
  sessionId: string;
  path: string;
  locale: string;
  seconds: number;
  first: boolean;
  country: string;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  const seconds = Math.max(0, Math.min(MAX_ENGAGED_PER_FLUSH, Math.round(ev.seconds)));
  const date = bakuDate();
  if (seconds > 0) {
    const data: Record<string, unknown> = {
      date,
      updatedAt: new Date().toISOString(),
      engagedSeconds: increment(seconds),
      pageTime: { [ev.path]: increment(seconds) },
    };
    if (ev.first) data.engagedPages = increment(1);
    await safe("engagement", () => setDoc(doc(db, SITE_DAILY, date), data, { merge: true }));
  }
  await touchLive(ev.sessionId, ev.path, ev.locale, ev.country);
}

export async function recordSearch(term: string): Promise<void> {
  const db = getDb();
  if (!db || !term) return;
  const date = bakuDate();
  await safe("search", () =>
    setDoc(
      doc(db, SITE_DAILY, date),
      { date, updatedAt: new Date().toISOString(), searches: { [term]: increment(1) } },
      { merge: true },
    ),
  );
}

async function touchLive(sessionId: string, path: string, locale: string, country: string) {
  const db = getDb();
  if (!db || !sessionId) return;
  await safe("live", () =>
    setDoc(doc(db, SITE_LIVE, sessionId), {
      path,
      locale,
      country: country || "",
      lastSeen: new Date().toISOString(),
    }),
  );
}
