"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert, Empty, Button } from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";
import { listArticles, countSubscribers } from "@/lib/data/admin";
import {
  getOverallStats,
  getDailyTrend,
  getTopArticles,
  getCategoryStats,
  getDeviceStats,
  getSourceStats,
  type OverallStats,
  type ViewRecord,
  type ArticleViews,
} from "@/lib/analytics/track-views";
import type { Article } from "@/lib/types";
import { categories, getCategory } from "@/lib/categories";
import { StatsRefreshBar, useAutoRefresh } from "@/components/admin/StatsRefreshBar";

type DateRange = "7d" | "30d" | "90d";

export default function AnalyticsOverviewPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  
  // Real analytics data
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dailyTrend, setDailyTrend] = useState<ViewRecord[]>([]);
  const [topArticlesData, setTopArticlesData] = useState<ArticleViews[]>([]);
  const [categoryViews, setCategoryViews] = useState<Record<string, number>>({});
  const [deviceStats, setDeviceStats] = useState({ desktop: 0, mobile: 0, tablet: 0 });
  const [sourceStats, setSourceStats] = useState({ organic: 0, social: 0, direct: 0, referral: 0 });

  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;

  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadData();
  }, [dateRange]);

  // Hər 15 dəqiqədən bir arxa planda yenilə (ekran «Yüklənir…» ilə bağlanmır)
  useAutoRefresh(() => void loadData(true), updatedAt !== null);

  async function loadData(background = false) {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [arts, subs, stats, trend, tops, catStats, devStats, srcStats] = await Promise.all([
        listArticles(),
        countSubscribers(),
        getOverallStats(),
        getDailyTrend(days),
        getTopArticles(days, 10),
        getCategoryStats(days),
        getDeviceStats(days),
        getSourceStats(days),
      ]);
      
      setArticles(arts);
      setSubscribers(subs);
      setOverallStats(stats);
      setDailyTrend(trend);
      setTopArticlesData(tops);
      setCategoryViews(catStats);
      setDeviceStats(devStats);
      setSourceStats(srcStats);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Məqalələr ilə analytics məlumatlarını birləşdir
  const topArticlesWithDetails = topArticlesData
    .map((viewData) => {
      const article = articles.find((a) => a.id === viewData.articleId);
      return article ? { ...article, ...viewData } : null;
    })
    .filter(Boolean);

  // Kateqoriya statistikası
  const categoryStats = categories.map((cat) => {
    const catArticles = articles.filter((a) => a.category === cat.slug);
    return {
      category: cat.name.az,
      slug: cat.slug,
      articles: catArticles.length,
      views: categoryViews[cat.slug] || 0,
    };
  }).sort((a, b) => b.views - a.views);

  function exportCSV() {
    const csv = [
      ["Date", "Views", "UniqueVisitors"],
      ...dailyTrend.map((d) => [d.date, d.views, d.uniqueVisitors]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="px-6 py-16 lg:px-10 text-center font-ui text-[13px] text-muted">
        Yüklənir…
      </div>
    );
  }

  if (!overallStats) {
    return (
      <>
        <PageHeader title="Analitika" description="Statistika məlumatları yoxdur" />
        <div className="px-6 py-8 lg:px-10">
          <Empty
            title="Məlumat yoxdur"
            text="Hələ ki view tracking məlumatları toplanmayıb. Saytda məqalələr oxunduqca statistika toplanacaq."
          />
        </div>
      </>
    );
  }

  const totalViewsPeriod = dailyTrend.reduce((sum, d) => sum + d.views, 0);
  const totalVisitorsPeriod = dailyTrend.reduce((sum, d) => sum + d.uniqueVisitors, 0);

  return (
    <>
      <PageHeader
        title="Analitika"
        description="Sayt performansı, trafik mənbələri və məqalə statistikaları."
        actions={
          <Button variant="ghost" onClick={exportCSV}>
            ↓ CSV yüklə
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatsRefreshBar
            className="mr-auto"
            updatedAt={updatedAt}
            refreshing={refreshing}
            onRefresh={() => void loadData(true)}
          />
          {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 font-ui text-[11px] uppercase tracking-[0.12em] border transition-colors ${
                dateRange === range
                  ? "border-bordo bg-bordo text-cream"
                  : "border-line bg-paper text-muted hover:border-bordo hover:text-bordo"
              }`}
            >
              {range === "7d" ? "Son 7 gün" : range === "30d" ? "Son 30 gün" : "Son 90 gün"}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Ümumi baxış (ümumi)",
              value: overallStats.totalViews.toLocaleString(),
              change: `+${overallStats.viewsLast7Days}`,
            },
            {
              label: `Son ${days} gün baxışı`,
              value: totalViewsPeriod.toLocaleString(),
              change: overallStats.viewsToday > 0 ? `Bu gün: ${overallStats.viewsToday}` : "",
            },
            {
              label: "Unikal ziyarətçi",
              value: totalVisitorsPeriod.toLocaleString(),
              change: `${days} gün`,
            },
            {
              label: "Ortalama/məqalə",
              value: overallStats.avgViewsPerArticle.toLocaleString(),
              change: `${overallStats.totalArticles} məqalə`,
            },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
              {stat.change && (
                <p className="mt-1 font-ui text-[11px] text-gold">{stat.change}</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Traffic Chart */}
          <Panel title="Trafik Dinamikası" description={`Son ${days} gün - Real məlumat`}>
            {dailyTrend.length === 0 ? (
              <Empty title="Məlumat yoxdur" text="Bu tarix aralığında view məlumatı toplanmayıb." />
            ) : (
              <div className="space-y-3">
                {dailyTrend.slice(-10).map((d) => {
                  const maxViews = Math.max(...dailyTrend.map(x => x.views), 1);
                  return (
                    <div key={d.date} className="flex items-center gap-3">
                      <span className="font-ui text-[12px] text-muted w-20">
                        {new Date(d.date).toLocaleDateString("az-AZ", { month: "short", day: "numeric" })}
                      </span>
                      <div className="flex-1 bg-cream h-8 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-bordo/20 border-r-2 border-bordo"
                          style={{ width: `${(d.views / maxViews) * 100}%` }}
                        />
                      </div>
                      <span className="font-ui text-[13px] text-ink w-20 text-right">
                        {d.views.toLocaleString()}
                      </span>
                      <span className="font-ui text-[11px] text-muted w-16 text-right">
                        {d.uniqueVisitors} UV
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Traffic Sources - Real data */}
          <Panel
            title="Trafik Mənbələri"
            description={`Son ${days} gün - Real məlumat`}
          >
            {sourceStats.organic + sourceStats.social + sourceStats.direct + sourceStats.referral === 0 ? (
              <div className="py-8 text-center">
                <p className="font-ui text-[12px] text-muted">
                  Hələ ki trafik mənbəyi məlumatı toplanmayıb
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Organic (Google, Bing)", value: sourceStats.organic, color: "bg-green-500" },
                  { label: "Social (Facebook, Instagram)", value: sourceStats.social, color: "bg-blue-500" },
                  { label: "Direct", value: sourceStats.direct, color: "bg-gray-500" },
                  { label: "Referral (Digər saytlar)", value: sourceStats.referral, color: "bg-purple-500" },
                ].map((source) => {
                  const total = sourceStats.organic + sourceStats.social + sourceStats.direct + sourceStats.referral;
                  const percentage = total > 0 ? ((source.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={source.label} className="flex items-center gap-3">
                      <span className="font-ui text-[12px] text-muted w-40">{source.label}</span>
                      <div className="flex-1 bg-cream h-6 relative overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${source.color} opacity-60`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-ui text-[13px] text-ink w-20 text-right">
                        {source.value.toLocaleString()}
                      </span>
                      <span className="font-ui text-[11px] text-muted w-12 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Device Stats - Real data */}
          <Panel
            title="Cihaz Statistikası"
            description={`Son ${days} gün - Real məlumat`}
          >
            {deviceStats.desktop + deviceStats.mobile + deviceStats.tablet === 0 ? (
              <div className="py-8 text-center">
                <p className="font-ui text-[12px] text-muted">
                  Hələ ki cihaz məlumatı toplanmayıb
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Desktop", value: deviceStats.desktop, icon: "🖥️" },
                  { label: "Mobile", value: deviceStats.mobile, icon: "📱" },
                  { label: "Tablet", value: deviceStats.tablet, icon: "📋" },
                ].map((device) => {
                  const total = deviceStats.desktop + deviceStats.mobile + deviceStats.tablet;
                  const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={device.label} className="flex items-center gap-3">
                      <span className="text-xl">{device.icon}</span>
                      <span className="font-ui text-[12px] text-muted w-20">{device.label}</span>
                      <div className="flex-1 bg-cream h-6 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-bordo opacity-60"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-ui text-[13px] text-ink w-20 text-right">
                        {device.value.toLocaleString()}
                      </span>
                      <span className="font-ui text-[11px] text-muted w-12 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Performance Metrics */}
          <Panel title="Performans Göstəriciləri">
            <div className="space-y-4">
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Ümumi məqalə sayı
                </p>
                <p className="mt-2 font-display text-2xl text-ink">
                  {overallStats.totalArticles}
                </p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Bu gün baxış
                </p>
                <p className="mt-2 font-display text-2xl text-ink">{overallStats.viewsToday}</p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Abunəçilər
                </p>
                <p className="mt-2 font-display text-2xl text-ink">{subscribers}</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Top Articles */}
        <Panel
          title="Ən çox oxunan məqalələr"
          description={`Son ${days} gün - Real tracking məlumatları`}
        >
          {topArticlesWithDetails.length === 0 ? (
            <Empty
              title="Məlumat yoxdur"
              text="Hələ ki məqalə baxış statistikası yoxdur. Saytda məqalələr oxunduqca burada göstəriləcək."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Məqalə
                    </th>
                    <th className="px-4 py-3 text-left font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Kateqoriya
                    </th>
                    <th className="px-4 py-3 text-right font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Ümumi
                    </th>
                    <th className="px-4 py-3 text-right font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      7 gün
                    </th>
                    <th className="px-4 py-3 text-right font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      30 gün
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topArticlesWithDetails.map((article: any, i) => {
                    const cat = getCategory(article.category);
                    return (
                      <tr key={article.id} className="hover:bg-cream/30">
                        <td className="px-4 py-3 font-ui text-[13px] text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="font-ui text-[13px] text-ink hover:text-bordo line-clamp-1"
                          >
                            {article.title.az || article.title.en}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-ui text-[12px] text-muted">
                          {cat?.name.az}
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-ink">
                          {article.totalViews.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-gold">
                          {article.last7Days.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-gold">
                          {article.last30Days.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Category Performance */}
        <Panel title="Kateqoriya Performansı" description={`Son ${days} gün - Real məlumat`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((cat) => (
              <div key={cat.slug} className="border border-line bg-paper p-4">
                <h3 className="font-display text-[15px] text-ink">{cat.category}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-ui text-[12px] text-muted">
                    {cat.articles} məqalə
                  </span>
                  <span className="font-ui text-[13px] text-ink">
                    {cat.views.toLocaleString()} baxış
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Info Notice */}
        <Alert tone="info">
          ℹ️ <strong>Real tracking:</strong> Bu səhifədə Firestore-da saxlanılan real məqalə baxış 
          statistikaları göstərilir (device, trafik mənbəyi və coğrafi məlumatlar daxil olmaqla).
          <br />
          <br />
          📊 <strong>Google Analytics 4:</strong> Saytda client-side GA4 tracking aktiv edilib. 
          Əlavə təfsilatlı məlumatlar üçün birbaşa Google Analytics dashboard-una keçin: 
          <a 
            href={`https://analytics.google.com/analytics/web/#/p${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.replace('G-', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-bordo hover:underline ml-1"
          >
            Analytics açın
          </a>
        </Alert>
      </div>
    </>
  );
}
