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
  type OverallStats,
  type ViewRecord,
  type ArticleViews,
} from "@/lib/analytics/track-views";
import type { Article } from "@/lib/types";
import { categories, getCategory } from "@/lib/categories";

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

  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [arts, subs, stats, trend, tops, catStats] = await Promise.all([
        listArticles(),
        countSubscribers(),
        getOverallStats(),
        getDailyTrend(days),
        getTopArticles(days, 10),
        getCategoryStats(days),
      ]);
      
      setArticles(arts);
      setSubscribers(subs);
      setOverallStats(stats);
      setDailyTrend(trend);
      setTopArticlesData(tops);
      setCategoryViews(catStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
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
        <div className="flex justify-end gap-2">
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

          {/* Traffic Sources - GA4 olmadığı üçün placeholder */}
          <Panel
            title="Trafik Mənbələri"
            description="GA4 inteqrasiyası qoşulduqda real məlumat göstəriləcək"
          >
            <div className="py-8 text-center">
              <p className="font-ui text-[12px] text-muted">
                Google Analytics 4 inteqrasiyası tələb olunur
              </p>
              <p className="mt-2 font-ui text-[11px] text-muted">
                .env.local-da GA4_PROPERTY_ID və GA4_SERVICE_ACCOUNT_KEY əlavə edin
              </p>
            </div>
          </Panel>

          {/* Device Stats - GA4 olmadığı üçün placeholder */}
          <Panel
            title="Cihaz Statistikası"
            description="GA4 inteqrasiyası qoşulduqda real məlumat göstəriləcək"
          >
            <div className="py-8 text-center">
              <p className="font-ui text-[12px] text-muted">
                Cihaz məlumatları üçün GA4 lazımdır
              </p>
            </div>
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
          statistikaları göstərilir. GA4 inteqrasiyası əlavə edildikdə, trafik mənbələri, cihaz və 
          coğrafi məlumatlar da görünəcək.
          <br />
          <br />
          📌 <strong>Qeyd:</strong> Saytda məqalə səhifələrində /api/track-view endpoint-ini çağırın 
          ki, baxışlar qeydə alınsın.
        </Alert>
      </div>
    </>
  );
}
