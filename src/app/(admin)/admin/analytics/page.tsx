"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";
import { listArticles, countSubscribers } from "@/lib/data/admin";
import { addDays, bakuDate, sinceDate } from "@/lib/analytics/track-views";
import {
  PERIOD_OPTIONS,
  EPOCH,
  daysBetween,
  formatDuration,
  loadArticleDays,
  loadArticleTotals,
  loadLiveUsers,
  loadSiteDays,
  periodRange,
  sumMaps,
  topEntries,
  type ArticleDay,
  type DateRange,
  type LiveSnapshot,
  type PeriodKey,
  type SiteDay,
} from "@/lib/analytics/reports";
import type { Article } from "@/lib/types";
import { categories, getCategory, subcategoryName } from "@/lib/categories";
import { StatsRefreshBar, useAutoRefresh } from "@/components/admin/StatsRefreshBar";
import { BarList, KpiCard, LiveDot, Th, TrendChart, type TrendPoint } from "./parts";

const LOCALE_NAMES: Record<string, string> = {
  az: "Azərbaycan dili",
  en: "İngilis dili",
  ru: "Rus dili",
  tr: "Türk dili",
  ar: "Ərəb dili",
};

const PAGE_NAMES: Record<string, string> = {
  abunelik: "Abunəlik",
  "abunelikden-cix": "Abunəlikdən çıxış",
  elaqe: "Əlaqə",
  haqqimizda: "Haqqımızda",
  emekdasliq: "Əməkdaşlıq",
  jurnallar: "Jurnallar (çap)",
  "e-jurnal": "E-jurnal",
  secilenler: "Seçilənlər",
  astrologiya: "Astrologiya",
  mexfilik: "Məxfilik siyasəti",
  sertler: "İstifadə şərtləri",
  loqo: "Loqo",
};

function regionName(code: string): string {
  try {
    return new Intl.DisplayNames(["az"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function articleTitle(a: Article): string {
  return a.title.az || a.title.en || a.title.ru || a.title.tr || a.title.ar || a.id;
}

// Brauzerlərin «az» lokalı ay adlarını bəzən «M10» kimi verir — adlar burada sabitdir.
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avq", "sen", "okt", "noy", "dek"];
const WEEKDAYS = ["bazar", "b.e.", "ç.a.", "çər.", "c.a.", "cümə", "şənbə"];

function fmtDate(
  date: string,
  opts: { day?: unknown; month?: "short" | "long"; year?: unknown; weekday?: unknown },
): string {
  const d = new Date(`${date}T12:00:00Z`);
  const parts: string[] = [];
  if (opts.day) parts.push(String(d.getUTCDate()));
  if (opts.month) parts.push((opts.month === "long" ? MONTHS : MONTHS_SHORT)[d.getUTCMonth()]);
  if (opts.year) parts.push(opts.year === "2-digit" ? `'${String(d.getUTCFullYear()).slice(2)}` : String(d.getUTCFullYear()));
  const text = parts.join(" ");
  return opts.weekday ? `${text}, ${WEEKDAYS[d.getUTCDay()]}` : text;
}

/** Trend qrafiki üçün qruplaşdırma: qısa dövr gün, orta həftə, uzun ay üzrə. */
function bucketOf(date: string, mode: "day" | "week" | "month"): string {
  if (mode === "day") return date;
  if (mode === "month") return date.slice(0, 7);
  const d = new Date(`${date}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // bazar ertəsi = 0
  return addDays(date, -dow);
}

export default function AnalyticsOverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const today = bakuDate();
  const [customDraft, setCustomDraft] = useState<DateRange>({ from: sinceDate(30), to: today });
  const [custom, setCustom] = useState<DateRange>({ from: sinceDate(30), to: today });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [totals, setTotals] = useState<Map<string, number>>(new Map());
  const [articleDays, setArticleDays] = useState<ArticleDay[]>([]);
  const [siteDays, setSiteDays] = useState<SiteDay[]>([]);
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [showAllArticles, setShowAllArticles] = useState(false);

  const range = useMemo(() => periodRange(period, custom), [period, custom]);

  const loadData = useCallback(
    async (background = false) => {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        // Məqalə cədvəlindəki 7/30 gün sütunları üçün ən azı son 30 gün yüklənir
        const articleRange: DateRange = {
          from: range.from < sinceDate(30) ? range.from : sinceDate(30),
          to: range.to > today ? range.to : today,
        };
        const [arts, subs, tot, aDays, sDays] = await Promise.all([
          listArticles(),
          countSubscribers().catch(() => 0),
          loadArticleTotals(),
          loadArticleDays(articleRange),
          loadSiteDays(range).catch(() => [] as SiteDay[]),
        ]);
        setArticles(arts);
        setSubscribers(subs);
        setTotals(tot);
        setArticleDays(aDays);
        setSiteDays(sDays);
        setUpdatedAt(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklənmə xətası");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range, today],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useAutoRefresh(() => void loadData(true), updatedAt !== null);

  // Canlı istifadəçilər — hər 30 saniyədən bir
  useEffect(() => {
    let alive = true;
    const tick = () =>
      loadLiveUsers()
        .then((s) => alive && setLive(s))
        .catch(() => alive && setLive({ count: 0, pages: [], countries: [] }));
    void tick();
    const timer = window.setInterval(tick, 30_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  /* ───────────── Hesablamalar ───────────── */

  const articleById = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);

  const inPeriod = useMemo(
    () => articleDays.filter((d) => d.date >= range.from && d.date <= range.to),
    [articleDays, range],
  );

  // Dövrün real başlanğıcı («bütün vaxt» üçün ilk məlumat günü)
  const effectiveFrom = useMemo(() => {
    if (range.from !== EPOCH) return range.from;
    const first = [...inPeriod.map((d) => d.date), ...siteDays.map((d) => d.date)].sort()[0];
    return first || today;
  }, [range.from, inPeriod, siteDays, today]);

  const periodDays = daysBetween(effectiveFrom, range.to);
  const periodLabel =
    period === "custom"
      ? `${fmtDate(range.from, { day: "numeric", month: "short", year: "numeric" })} – ${fmtDate(range.to, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : period === "all"
        ? "Bütün vaxt"
        : period === "today"
          ? `Bu gün (${fmtDate(range.to, { day: "numeric", month: "long" })})`
          : period === "yesterday"
            ? `Dünən (${fmtDate(range.to, { day: "numeric", month: "long" })})`
            : `Son ${PERIOD_OPTIONS.find((o) => o.key === period)?.label}`;

  const articleViewsPeriod = inPeriod.reduce((s, d) => s + d.views, 0);

  // Saytın ümumi göstəriciləri
  const site = useMemo(() => {
    const sum = (k: "views" | "visitors" | "sessions" | "multiPageSessions" | "engagedSeconds" | "engagedPages") =>
      siteDays.reduce((s, d) => s + d[k], 0);
    return {
      views: sum("views"),
      visitors: sum("visitors"),
      sessions: sum("sessions"),
      multi: sum("multiPageSessions"),
      engagedSeconds: sum("engagedSeconds"),
      engagedPages: sum("engagedPages"),
      pages: sumMaps(siteDays.map((d) => d.pages)),
      pageTime: sumMaps(siteDays.map((d) => d.pageTime)),
      locales: sumMaps(siteDays.map((d) => d.locales)),
      visitorLocales: sumMaps(siteDays.map((d) => d.visitorLocales)),
      countries: sumMaps(siteDays.map((d) => d.countries)),
      cities: sumMaps(siteDays.map((d) => d.cities)),
      devices: sumMaps(siteDays.map((d) => d.devices)),
      sources: sumMaps(siteDays.map((d) => d.sources)),
      referrers: sumMaps(siteDays.map((d) => d.referrers)),
      searches: sumMaps(siteDays.map((d) => d.searches)),
      firstDate: siteDays[0]?.date,
    };
  }, [siteDays]);
  const hasSite = site.views > 0;

  // Trend
  const trend: TrendPoint[] = useMemo(() => {
    const mode: "day" | "week" | "month" = periodDays <= 31 ? "day" : periodDays <= 190 ? "week" : "month";
    const map = new Map<string, TrendPoint>();
    const ensure = (date: string) => {
      const key = bucketOf(date, mode);
      let p = map.get(key);
      if (!p) {
        const label =
          mode === "month"
            ? fmtDate(`${key}-15`, { month: "short", year: "2-digit" })
            : fmtDate(key, { day: "numeric", month: "short" });
        const title =
          mode === "day"
            ? fmtDate(key, { day: "numeric", month: "long", year: "numeric", weekday: "short" })
            : mode === "week"
              ? `${fmtDate(key, { day: "numeric", month: "short" })} həftəsi`
              : fmtDate(`${key}-15`, { month: "long", year: "numeric" });
        p = { key, label, title, articleViews: 0, pageViews: 0 };
        map.set(key, p);
      }
      return p;
    };
    // Boş günlər/həftələr/aylar da görünsün ki, qrafik dövrü tam əks etdirsin
    for (let d = effectiveFrom; d <= range.to; d = addDays(d, 1)) ensure(d);
    inPeriod.forEach((d) => (ensure(d.date).articleViews += d.views));
    siteDays.forEach((d) => (ensure(d.date).pageViews += d.views));
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [inPeriod, siteDays, periodDays, effectiveFrom, range.to]);

  // Məqalələr cədvəli
  const articleRows = useMemo(() => {
    const d7 = sinceDate(7);
    const d30 = sinceDate(30);
    const yesterday = addDays(today, -1);
    const blank = () => ({ period: 0, unique: 0, today: 0, yesterday: 0, d7: 0, d30: 0, loaded: 0 });
    const acc = new Map<string, ReturnType<typeof blank>>();
    for (const d of articleDays) {
      const r = acc.get(d.articleId) || blank();
      r.loaded += d.views;
      if (d.date >= range.from && d.date <= range.to) {
        r.period += d.views;
        r.unique += d.uniqueVisitors;
      }
      if (d.date === today) r.today += d.views;
      if (d.date === yesterday) r.yesterday += d.views;
      if (d.date >= d7) r.d7 += d.views;
      if (d.date >= d30) r.d30 += d.views;
      acc.set(d.articleId, r);
    }
    totals.forEach((_, id) => {
      if (!acc.has(id)) acc.set(id, blank());
    });
    return [...acc.entries()]
      .map(([id, r]) => ({
        id,
        article: articleById.get(id),
        allTime: Math.max(totals.get(id) || 0, r.loaded),
        ...r,
      }))
      .filter((r) => r.article && (period === "all" ? r.allTime > 0 : r.period > 0))
      .sort((a, b) => (period === "all" ? b.allTime - a.allTime : b.period - a.period || b.allTime - a.allTime));
  }, [articleDays, totals, articleById, range, period, today]);

  const showPeriodColumn = !["today", "yesterday", "7d", "30d"].includes(period);

  // Kateqoriya və alt kateqoriya
  const categoryRows = useMemo(() => {
    const views: Record<string, number> = {};
    inPeriod.forEach((d) => (views[d.category] = (views[d.category] || 0) + d.views));
    return categories
      .map((c) => ({
        slug: c.slug,
        name: c.name.az,
        articles: articles.filter((a) => a.category === c.slug && a.status === "published").length,
        views: views[c.slug] || 0,
      }))
      .sort((a, b) => b.views - a.views);
  }, [inPeriod, articles]);

  const subcategoryRows = useMemo(() => {
    const views: Record<string, number> = {};
    inPeriod.forEach((d) => {
      const a = articleById.get(d.articleId);
      if (!a) return;
      const key = `${a.category}/${a.subcategory || ""}`;
      views[key] = (views[key] || 0) + d.views;
    });
    return topEntries(views, 30).map(([key, value]) => {
      const [cat, sub] = key.split("/");
      const catName = getCategory(cat)?.name.az || cat;
      return {
        key,
        label: sub ? subcategoryName(cat, sub, "az") || sub : "Alt bölməsiz",
        sub: catName,
        value,
      };
    });
  }, [inPeriod, articleById]);

  // Cihaz və mənbə: sayt məlumatı varsa onu, yoxdursa məqalə baxışlarını göstər
  const deviceMap = hasSite ? site.devices : sumMaps(inPeriod.map((d) => d.devices));
  const sourceMap = hasSite ? site.sources : sumMaps(inPeriod.map((d) => d.sources));

  // Səhifə yolu → oxunaqlı ad
  const pageTitles = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of articles) {
      const slugs = typeof a.slug === "string" ? { az: a.slug, en: a.slug, ru: a.slug, tr: a.slug, ar: a.slug } : a.slug;
      for (const [loc, slug] of Object.entries(slugs || {})) {
        if (slug) m.set(`/${loc}/${a.category}/${slug}`, articleTitle(a));
      }
    }
    return m;
  }, [articles]);

  function pageLabel(path: string): string {
    const known = pageTitles.get(path);
    if (known) return known;
    const seg = path.split("/").filter(Boolean);
    if (seg.length === 0) return "Kök ünvan (/)";
    if (seg.length === 1) return "Ana səhifə";
    const cat = getCategory(seg[1]);
    if (cat && seg.length === 2) return `${cat.name.az} bölməsi`;
    if (cat && seg[2] === "bolme" && seg[3]) return `${cat.name.az} › ${subcategoryName(cat.slug, seg[3], "az") || seg[3]}`;
    if (seg[1] === "astrologiya" && seg[2] === "burc") return `Bürc: ${seg[3] || ""}`;
    if (PAGE_NAMES[seg[1]]) return PAGE_NAMES[seg[1]];
    return path;
  }

  function exportCSV() {
    const rows = [
      ["Tarix/Dövr", "Məqalə baxışı", "Səhifə baxışı"],
      ...trend.map((p) => [p.key, p.articleViews, p.pageViews]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analitika-${range.from}_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ───────────── Görünüş ───────────── */

  const visibleArticles = showAllArticles ? articleRows : articleRows.slice(0, 15);
  const avgSession = site.sessions > 0 ? site.engagedSeconds / site.sessions : 0;
  const avgPageTime = site.engagedPages > 0 ? site.engagedSeconds / site.engagedPages : 0;
  const pagesPerSession = site.sessions > 0 ? site.views / site.sessions : 0;
  const bounce = site.sessions > 0 ? Math.max(0, 1 - site.multi / site.sessions) : 0;

  return (
    <>
      <PageHeader
        title="Analitika"
        description="Sayt trafiki, oxucu davranışı və məqalə statistikası."
        actions={
          <Button variant="ghost" onClick={exportCSV}>
            ↓ CSV yüklə
          </Button>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-10">
        {error && <Alert tone="error">{error}</Alert>}

        {/* Dövr seçimi */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatsRefreshBar
              className="mr-auto"
              updatedAt={updatedAt}
              refreshing={refreshing}
              onRefresh={() => void loadData(true)}
            />
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                className={`border px-3 py-2 font-ui text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  period === opt.key
                    ? "border-bordo bg-bordo text-cream"
                    : "border-line bg-paper text-muted hover:border-bordo hover:text-bordo"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <form
              className="flex flex-wrap items-end justify-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setCustom({ ...customDraft });
              }}
            >
              <label className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                Başlanğıc
                <input
                  type="date"
                  value={customDraft.from}
                  max={today}
                  onChange={(e) => setCustomDraft((c) => ({ ...c, from: e.target.value }))}
                  className="mt-1 block border border-line bg-paper px-3 py-2 font-ui text-[13px] text-ink"
                  required
                />
              </label>
              <label className="font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
                Son
                <input
                  type="date"
                  value={customDraft.to}
                  max={today}
                  onChange={(e) => setCustomDraft((c) => ({ ...c, to: e.target.value }))}
                  className="mt-1 block border border-line bg-paper px-3 py-2 font-ui text-[13px] text-ink"
                  required
                />
              </label>
              <Button type="submit">Tətbiq et</Button>
            </form>
          )}
          <p className="text-right font-ui text-[12px] text-muted">
            Göstərilən dövr: <strong className="text-ink">{periodLabel}</strong>
            {loading && " · yüklənir…"}
          </p>
        </div>

        {!hasSite && !loading && (
          <Alert tone="info">
            Sessiya müddəti, dil, ölkə/şəhər, səhifələr və axtarış sözləri yeni izləmə sistemi ilə toplanır.
            Bu dövr üçün hələ məlumat yoxdur — yeni versiya saytda yayımlandıqdan və Firestore qaydaları
            yeniləndikdən sonra rəqəmlər görünməyə başlayacaq. Məqalə baxışları köhnə məlumatla göstərilir.
          </Alert>
        )}

        {/* KPI */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            accent={<LiveDot />}
            label="Canlı istifadəçi"
            value={live ? live.count : "…"}
            hint="son 5 dəqiqədə aktiv"
          />
          <KpiCard
            label="Səhifə baxışı"
            value={hasSite ? site.views.toLocaleString("az-AZ") : "—"}
            hint={`Məqalə baxışı: ${articleViewsPeriod.toLocaleString("az-AZ")}`}
          />
          <KpiCard
            label="Unikal ziyarətçi"
            value={hasSite ? site.visitors.toLocaleString("az-AZ") : "—"}
            hint="günlük unikalların cəmi"
          />
          <KpiCard
            label="Sessiya"
            value={hasSite ? site.sessions.toLocaleString("az-AZ") : "—"}
            hint={hasSite ? `${pagesPerSession.toFixed(1)} səhifə / sessiya` : undefined}
          />
          <KpiCard
            label="Ort. sessiya müddəti"
            value={hasSite ? formatDuration(avgSession) : "—"}
            hint="tab açıq və görünən vaxt"
          />
          <KpiCard
            label="Ort. aktiv vaxt / səhifə"
            value={hasSite ? formatDuration(avgPageTime) : "—"}
          />
          <KpiCard
            label="Tək səhifəli sessiya"
            value={hasSite ? `${(bounce * 100).toFixed(0)}%` : "—"}
            hint="bounce rate"
          />
          <KpiCard label="Abunəçilər" value={subscribers.toLocaleString("az-AZ")} />
        </div>

        {/* Trend */}
        <Panel title="Trafik dinamikası" description={periodLabel}>
          <TrendChart points={trend} />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Canlı */}
          <Panel title="Hazırda saytda" description="Son 5 dəqiqə · hər 30 saniyədən bir yenilənir">
            {!live || live.count === 0 ? (
              <p className="py-6 text-center font-ui text-[12px] text-muted">Hazırda aktiv oxucu yoxdur</p>
            ) : (
              <BarList
                rows={live.pages.map(([path, n]) => ({ key: path, label: pageLabel(path), sub: path, value: n }))}
              />
            )}
          </Panel>

          {/* Dil */}
          <Panel title="Dil üzrə ziyarətçilər" description={periodLabel}>
            <BarList
              extraHeader="Baxış"
              rows={["az", "en", "ru", "tr", "ar"]
                .map((loc) => ({
                  key: loc,
                  label: `${LOCALE_NAMES[loc]} (${loc.toUpperCase()})`,
                  value: site.visitorLocales[loc] || 0,
                  extra: (site.locales[loc] || 0).toLocaleString("az-AZ"),
                }))
                .sort((a, b) => b.value - a.value)}
            />
          </Panel>
        </div>

        {/* Səhifələr */}
        <Panel title="Ən çox ziyarət edilən səhifələr" description={`${periodLabel} · bütün sayt`}>
          <BarList
            extraHeader="Ort. vaxt"
            rows={topEntries(site.pages, 20).map(([path, n]) => ({
              key: path,
              label: pageLabel(path),
              sub: path,
              value: n,
              extra: site.pageTime[path] ? formatDuration(site.pageTime[path] / n) : "—",
            }))}
          />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Ölkə üzrə ziyarətçilər" description={periodLabel}>
            <BarList
              rows={topEntries(site.countries, 15).map(([code, n]) => ({
                key: code,
                label: `${flag(code)} ${regionName(code)}`,
                value: n,
              }))}
            />
          </Panel>
          <Panel title="Şəhər üzrə ziyarətçilər" description={periodLabel}>
            <BarList
              rows={topEntries(site.cities, 15).map(([key, n]) => {
                const [code, city] = key.split("|");
                return { key, label: `${flag(code)} ${city}`, sub: regionName(code), value: n };
              })}
            />
          </Panel>

          <Panel
            title="Trafik mənbələri"
            description={hasSite ? `${periodLabel} · sessiya üzrə` : `${periodLabel} · məqalə baxışları üzrə`}
          >
            <BarList
              rows={[
                { key: "organic", label: "Axtarış (Google, Bing, Yandex)", value: sourceMap.organic || 0 },
                { key: "social", label: "Sosial şəbəkələr", value: sourceMap.social || 0 },
                { key: "direct", label: "Birbaşa (ünvan, əlfəcin, mesajlaşma)", value: sourceMap.direct || 0 },
                { key: "referral", label: "Digər saytlar", value: sourceMap.referral || 0 },
              ].sort((a, b) => b.value - a.value)}
            />
            {topEntries(site.referrers, 8).length > 0 && (
              <div className="mt-6">
                <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Hansı saytlardan gəlirlər
                </p>
                <BarList
                  rows={topEntries(site.referrers, 8).map(([host, n]) => ({ key: host, label: host, value: n }))}
                />
              </div>
            )}
          </Panel>

          <Panel
            title="Cihazlar"
            description={hasSite ? `${periodLabel} · ziyarətçi üzrə` : `${periodLabel} · məqalə baxışları üzrə`}
          >
            <BarList
              rows={[
                { key: "mobile", label: "📱 Telefon", value: deviceMap.mobile || 0 },
                { key: "desktop", label: "🖥️ Kompüter", value: deviceMap.desktop || 0 },
                { key: "tablet", label: "📋 Planşet", value: deviceMap.tablet || 0 },
              ].sort((a, b) => b.value - a.value)}
            />
          </Panel>
        </div>

        {/* Məqalələr */}
        <Panel
          title="Ən çox oxunan məqalələr"
          description={`${periodLabel} üzrə sıralanıb · «Son 7 gün» «Son 30 gün»ün içindədir, ona görə sütunlar toplanmır`}
        >
          {articleRows.length === 0 ? (
            <p className="py-6 text-center font-ui text-[12px] text-muted">Bu dövr üçün məqalə baxışı yoxdur</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-line">
                      <Th>#</Th>
                      <Th>Məqalə</Th>
                      <Th>Kateqoriya</Th>
                      <Th right>Bu gün</Th>
                      <Th right>Dünən</Th>
                      <Th right>Son 7 gün</Th>
                      <Th right>Son 30 gün</Th>
                      {showPeriodColumn && <Th right>{period === "all" ? "Bütün vaxt" : "Seçilmiş dövr"}</Th>}
                      {period !== "all" && <Th right>Unikal</Th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {visibleArticles.map((r, i) => {
                      const a = r.article as Article;
                      return (
                        <tr key={r.id} className="hover:bg-cream/30">
                          <td className="px-3 py-3 font-ui text-[13px] text-muted">{i + 1}</td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/admin/articles/${r.id}`}
                              className="line-clamp-1 font-ui text-[13px] text-ink hover:text-bordo"
                            >
                              {articleTitle(a)}
                            </Link>
                          </td>
                          <td className="px-3 py-3 font-ui text-[12px] text-muted">
                            {getCategory(a.category)?.name.az}
                            {a.subcategory && (
                              <span className="block text-[11px]">
                                {subcategoryName(a.category, a.subcategory, "az") || a.subcategory}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-ui text-[13px] text-ink">
                            {r.today.toLocaleString("az-AZ")}
                          </td>
                          <td className="px-3 py-3 text-right font-ui text-[13px] text-ink">
                            {r.yesterday.toLocaleString("az-AZ")}
                          </td>
                          <td className="px-3 py-3 text-right font-ui text-[13px] text-gold">
                            {r.d7.toLocaleString("az-AZ")}
                          </td>
                          <td className="px-3 py-3 text-right font-ui text-[13px] text-gold">
                            {r.d30.toLocaleString("az-AZ")}
                          </td>
                          {showPeriodColumn && (
                            <td className="px-3 py-3 text-right font-ui text-[13px] font-semibold text-bordo">
                              {(period === "all" ? r.allTime : r.period).toLocaleString("az-AZ")}
                            </td>
                          )}
                          {period !== "all" && (
                            <td className="px-3 py-3 text-right font-ui text-[12px] text-muted">
                              {r.unique.toLocaleString("az-AZ")}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {articleRows.length > 15 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={() => setShowAllArticles((v) => !v)}>
                    {showAllArticles ? "Qısalt" : `Hamısını göstər (${articleRows.length})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Kateqoriya performansı" description={`${periodLabel} · məqalə baxışı`}>
            <BarList
              rows={categoryRows.map((c) => ({
                key: c.slug,
                label: c.name,
                sub: `${c.articles} dərc olunmuş məqalə`,
                value: c.views,
              }))}
            />
          </Panel>
          <Panel title="Alt kateqoriya performansı" description={`${periodLabel} · məqalə baxışı`}>
            <BarList rows={subcategoryRows} />
          </Panel>
        </div>

        {/* Açar sözlər */}
        <Panel title="Açar sözlər" description={`${periodLabel} · saytdaxili axtarışda yazılan sözlər`}>
          <BarList
            empty="Bu dövrdə saytda axtarış edilməyib"
            rows={topEntries(site.searches, 25).map(([q, n]) => ({ key: q, label: q, value: n }))}
          />
          <p className="mt-6 border-t border-line pt-4 font-ui text-[12px] leading-relaxed text-muted">
            Google-da hansı sözlərlə axtarıb sayta gəldikləri saytın öz statistikasına düşmür — Google bu
            məlumatı yalnız{" "}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bordo hover:underline"
            >
              Google Search Console
            </a>
            -da göstərir. Ətraflı davranış hesabatları üçün{" "}
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bordo hover:underline"
            >
              Google Analytics
            </a>
            .
          </p>
        </Panel>

        <Alert tone="info">
          Admin panelə daxil olmuş brauzerlər (işçilər) və axtarış botları statistikaya daxil edilmir. Günlər
          Bakı vaxtı ilə hesablanır. Ziyarətçi göstəriciləri {site.firstDate ? fmtDate(site.firstDate, { day: "numeric", month: "long", year: "numeric" }) : "yeni versiyanın yayımlandığı gün"} tarixindən toplanır.
          {period === "all" && periodDays > 0 && ` Bütün vaxt: ${periodDays} gün.`}
        </Alert>
      </div>
    </>
  );
}
