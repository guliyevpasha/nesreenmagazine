"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert, Empty, Button } from "@/components/admin/ui";
import { useAuth } from "@/lib/firebase/auth";
import { listArticles, countSubscribers } from "@/lib/data/admin";
import type { Article } from "@/lib/types";
import { categories } from "@/lib/categories";

/* ── mock data generator (real GA4 API inteqrasiyası üçün placeholder) ── */
function generateMockData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().slice(0, 10),
      views: Math.floor(Math.random() * 5000) + 2000,
      visitors: Math.floor(Math.random() * 3000) + 1000,
      sessions: Math.floor(Math.random() * 3500) + 1200,
    });
  }
  return data;
}

type DateRange = "7d" | "30d" | "90d";

export default function AnalyticsOverviewPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Mock analytics data
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const dailyData = generateMockData(days);
  
  const totalViews = dailyData.reduce((sum, d) => sum + d.views, 0);
  const totalVisitors = dailyData.reduce((sum, d) => sum + d.visitors, 0);
  const totalSessions = dailyData.reduce((sum, d) => sum + d.sessions, 0);
  const avgBounceRate = 42.5; // Mock
  const avgSessionDuration = 185; // saniyə

  // Traffic sources (mock)
  const trafficSources = [
    { source: "Organic Search", visits: 12450, percentage: 45 },
    { source: "Direct", visits: 8320, percentage: 30 },
    { source: "Social Media", visits: 4160, percentage: 15 },
    { source: "Referral", visits: 2775, percentage: 10 },
  ];

  // Device stats (mock)
  const deviceStats = [
    { device: "Mobile", visits: 15640, percentage: 56 },
    { device: "Desktop", visits: 10980, percentage: 40 },
    { device: "Tablet", visits: 1110, percentage: 4 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [arts, subs] = await Promise.all([
        listArticles(),
        countSubscribers(),
      ]);
      setArticles(arts);
      setSubscribers(subs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklənmə xətası");
    } finally {
      setLoading(false);
    }
  }

  // Top articles by views (simulated based on publishedAt)
  const topArticles = [...articles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 10)
    .map((article, i) => ({
      ...article,
      views: Math.floor(Math.random() * 5000) + 500,
      uniqueVisitors: Math.floor(Math.random() * 3000) + 300,
    }));

  // Category performance
  const categoryStats = categories.map((cat) => {
    const catArticles = articles.filter((a) => a.category === cat.slug);
    return {
      category: cat.name.az,
      articles: catArticles.length,
      views: Math.floor(Math.random() * 10000) + 1000,
    };
  });

  function exportCSV() {
    const csv = [
      ["Date", "Views", "Visitors", "Sessions"],
      ...dailyData.map((d) => [d.date, d.views, d.visitors, d.sessions]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}.csv`;
    a.click();
  }

  if (loading) {
    return (
      <div className="px-6 py-16 lg:px-10 text-center font-ui text-[13px] text-muted">
        Yüklənir…
      </div>
    );
  }

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
            { label: "Ümumi baxış", value: totalViews.toLocaleString() },
            { label: "Unikal ziyarətçi", value: totalVisitors.toLocaleString() },
            { label: "Sessiya", value: totalSessions.toLocaleString() },
            { label: "Bounce rate", value: `${avgBounceRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-paper px-5 py-4">
              <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Traffic Chart */}
          <Panel title="Trafik Dinamikası" description={`Son ${days} gün`}>
            <div className="space-y-3">
              {dailyData.slice(-7).map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="font-ui text-[12px] text-muted w-20">
                    {new Date(d.date).toLocaleDateString("az-AZ", { month: "short", day: "numeric" })}
                  </span>
                  <div className="flex-1 bg-cream h-8 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-bordo/20 border-r-2 border-bordo"
                      style={{ width: `${(d.views / 7000) * 100}%` }}
                    />
                  </div>
                  <span className="font-ui text-[13px] text-ink w-16 text-right">
                    {d.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Traffic Sources */}
          <Panel title="Trafik Mənbələri">
            <div className="space-y-3">
              {trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui text-[13px] text-ink">{source.source}</span>
                    <span className="font-ui text-[12px] text-muted">
                      {source.visits.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-cream overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bordo to-gold"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Device Stats */}
          <Panel title="Cihaz Statistikası">
            <div className="space-y-4">
              {deviceStats.map((device) => (
                <div key={device.device} className="flex items-center gap-4">
                  <div className="text-3xl">
                    {device.device === "Mobile" ? "📱" : device.device === "Desktop" ? "💻" : "📱"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-ui text-[13px] text-ink">{device.device}</span>
                      <span className="font-ui text-[12px] text-muted">{device.percentage}%</span>
                    </div>
                    <div className="h-2 bg-cream overflow-hidden">
                      <div
                        className="h-full bg-bordo"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Session Duration */}
          <Panel title="Performans Göstəriciləri">
            <div className="space-y-4">
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Orta sessiya müddəti
                </p>
                <p className="mt-2 font-display text-2xl text-ink">
                  {Math.floor(avgSessionDuration / 60)}:{(avgSessionDuration % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Səhifə/sessiya
                </p>
                <p className="mt-2 font-display text-2xl text-ink">3.2</p>
              </div>
              <div className="border border-line bg-paper p-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                  Abunəçi artımı
                </p>
                <p className="mt-2 font-display text-2xl text-ink">+{subscribers}</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Top Articles */}
        <Panel title="Ən çox oxunan məqalələr" description="Son 30 gündə">
          {topArticles.length === 0 ? (
            <Empty title="Məqalə yoxdur" text="Statistika görmək üçün məqalələr əlavə edin." />
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
                      Baxış
                    </th>
                    <th className="px-4 py-3 text-right font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                      Unikal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topArticles.map((article, i) => {
                    const cat = categories.find((c) => c.slug === article.category);
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
                          {article.views.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-ui text-[13px] text-muted">
                          {article.uniqueVisitors.toLocaleString()}
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
        <Panel title="Kateqoriya Performansı">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="border border-line bg-paper p-4">
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
          ℹ️ <strong>Demo data:</strong> Bu statistikalar simulyasiya edilib. Real Google Analytics 4 
          inteqrasiyası üçün GA4 API açarını əlavə edin.
        </Alert>
      </div>
    </>
  );
}
