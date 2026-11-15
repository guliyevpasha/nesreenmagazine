/**
 * Admin analitika hesabatları üçün oxuma funksiyaları (yalnız staff).
 *
 * Məqalə baxışları: `analytics_daily` (məqalə × gün) + `analytics_totals` (bütün vaxt).
 * Saytın ümumi göstəriciləri: `analytics_site` (bir gün = bir sənəd).
 * Canlı istifadəçilər: `analytics_live` (son 5 dəqiqə).
 *
 * Bütün tarixlər Bakı vaxtı ilə YYYY-MM-DD-dir.
 */

import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "../firebase/client";
import { addDays, bakuDate } from "./track-views";
import { SITE_DAILY, SITE_LIVE } from "./site-stats";

/* ───────────── Dövrlər ───────────── */

export type PeriodKey = "all" | "7d" | "30d" | "3m" | "6m" | "9m" | "12m" | "custom";

export const PERIOD_OPTIONS: { key: PeriodKey; label: string; days?: number }[] = [
  { key: "all", label: "Bütün vaxt" },
  { key: "7d", label: "7 gün", days: 7 },
  { key: "30d", label: "30 gün", days: 30 },
  { key: "3m", label: "3 ay", days: 90 },
  { key: "6m", label: "6 ay", days: 180 },
  { key: "9m", label: "9 ay", days: 270 },
  { key: "12m", label: "12 ay", days: 365 },
  { key: "custom", label: "Özəl tarix" },
];

/** İzləmənin başlamasından əvvəlki istənilən tarix — «bütün vaxt» üçün aşağı sərhəd. */
export const EPOCH = "2020-01-01";

export interface DateRange {
  from: string;
  to: string;
}

export function periodRange(key: PeriodKey, custom?: DateRange): DateRange {
  const today = bakuDate();
  if (key === "custom" && custom) {
    const from = custom.from <= custom.to ? custom.from : custom.to;
    const to = custom.from <= custom.to ? custom.to : custom.from;
    return { from, to };
  }
  const opt = PERIOD_OPTIONS.find((o) => o.key === key);
  if (!opt?.days) return { from: EPOCH, to: today };
  return { from: addDays(today, -(opt.days - 1)), to: today };
}

/** İki tarix arasındakı gün sayı (hər ikisi daxil). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
}

/* ───────────── Məqalə baxışları ───────────── */

export interface ArticleDay {
  articleId: string;
  category: string;
  date: string;
  views: number;
  uniqueVisitors: number;
  devices: Record<string, number>;
  sources: Record<string, number>;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function numMap(v: unknown): Record<string, number> {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = num(val);
  return out;
}

export async function loadArticleDays(range: DateRange): Promise<ArticleDay[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, "analytics_daily"), where("date", ">=", range.from), where("date", "<=", range.to)),
  );
  return snap.docs
    .map((d) => d.data())
    .filter((d) => typeof d.articleId === "string" && typeof d.date === "string")
    .map((d) => ({
      articleId: d.articleId as string,
      category: String(d.category || ""),
      date: d.date as string,
      views: num(d.views),
      uniqueVisitors: num(d.uniqueVisitors),
      devices: numMap(d.devices),
      sources: numMap(d.sources),
    }));
}

/** Məqalə → bütün vaxt üzrə baxış (analytics_totals). */
export async function loadArticleTotals(): Promise<Map<string, number>> {
  const db = getDb();
  const out = new Map<string, number>();
  if (!db) return out;
  const snap = await getDocs(collection(db, "analytics_totals"));
  snap.forEach((d) => out.set(d.id, num(d.data().totalViews)));
  return out;
}

/* ───────────── Saytın günlük göstəriciləri ───────────── */

export interface SiteDay {
  date: string;
  views: number;
  visitors: number;
  sessions: number;
  multiPageSessions: number;
  engagedSeconds: number;
  engagedPages: number;
  pages: Record<string, number>;
  pageTime: Record<string, number>;
  locales: Record<string, number>;
  visitorLocales: Record<string, number>;
  countries: Record<string, number>;
  cities: Record<string, number>;
  devices: Record<string, number>;
  sources: Record<string, number>;
  referrers: Record<string, number>;
  searches: Record<string, number>;
}

export async function loadSiteDays(range: DateRange): Promise<SiteDay[]> {
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, SITE_DAILY), where("date", ">=", range.from), where("date", "<=", range.to)),
  );
  return snap.docs
    .map((d) => d.data())
    .filter((d) => typeof d.date === "string")
    .map((d) => ({
      date: d.date as string,
      views: num(d.views),
      visitors: num(d.visitors),
      sessions: num(d.sessions),
      multiPageSessions: num(d.multiPageSessions),
      engagedSeconds: num(d.engagedSeconds),
      engagedPages: num(d.engagedPages),
      pages: numMap(d.pages),
      pageTime: numMap(d.pageTime),
      locales: numMap(d.locales),
      visitorLocales: numMap(d.visitorLocales),
      countries: numMap(d.countries),
      cities: numMap(d.cities),
      devices: numMap(d.devices),
      sources: numMap(d.sources),
      referrers: numMap(d.referrers),
      searches: numMap(d.searches),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Bir neçə xəritəni toplayır. */
export function sumMaps(maps: Record<string, number>[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of maps) for (const [k, v] of Object.entries(m)) out[k] = (out[k] || 0) + v;
  return out;
}

/** Xəritəni azalan sıra ilə [açar, dəyər] siyahısına çevirir. */
export function topEntries(map: Record<string, number>, n = 10): [string, number][] {
  return Object.entries(map)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/* ───────────── Canlı istifadəçilər ───────────── */

export interface LiveSnapshot {
  count: number;
  pages: [string, number][];
  countries: [string, number][];
}

export async function loadLiveUsers(windowMinutes = 5): Promise<LiveSnapshot> {
  const db = getDb();
  if (!db) return { count: 0, pages: [], countries: [] };
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const snap = await getDocs(query(collection(db, SITE_LIVE), where("lastSeen", ">=", since)));
  const pages: Record<string, number> = {};
  const countries: Record<string, number> = {};
  snap.forEach((d) => {
    const data = d.data();
    const p = String(data.path || "/");
    pages[p] = (pages[p] || 0) + 1;
    const c = String(data.country || "");
    if (c) countries[c] = (countries[c] || 0) + 1;
  });
  return { count: snap.size, pages: topEntries(pages, 8), countries: topEntries(countries, 5) };
}

/** Saniyəni «3 dəq 12 san» formatına salır. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} san`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  if (m < 60) return rest ? `${m} dəq ${rest} san` : `${m} dəq`;
  const h = Math.floor(m / 60);
  return `${h} saat ${m % 60} dəq`;
}
