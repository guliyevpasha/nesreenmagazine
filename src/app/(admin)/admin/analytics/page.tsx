"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert } from "@/components/admin/ui";
import {
  MetricCard,
  LineChart,
  BarChart,
  PieChart,
  DateRangePicker,
  StatsList,
  type DateRange,
  type LineChartDataPoint,
  type BarChartDataPoint,
  type PieChartDataPoint,
} from "@/components/admin/analytics";
import { useAuth } from "@/lib/firebase/auth";
import {
  getAnalyticsSummary,
  getDailyAnalytics,
  getTopArticles,
  getTrendingArticles,
} from "@/lib/data/admin";
import type { AnalyticsSummary, DailyAnalytics, ArticleAnalytics } from "@/lib/types";

export default function AnalyticsOverviewPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleAnalytics[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleAnalytics[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return { start, end };
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const [summaryData, daily, top, trending] = await Promise.all([
        getAnalyticsSummary().catch(() => null),
        getDailyAnalytics(dateRange.start, dateRange.end).catch(() => [] as DailyAnalytics[]),
        getTopArticles(10).catch(() => [] as ArticleAnalytics[]),
        getTrendingArticles(10).catch(() => [] as ArticleAnalytics[]),
      ]);

      setSummary(summaryData);
      setDailyData(daily);
      setTopArticles(top);
      setTrendingArticles(trending);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  // Line chart data - gündəlik baxışlar
  const pageViewsChartData: LineChartDataPoint[] = dailyData.map((day) => ({
    label: day.date.slice(5), // MM-DD
    value: day.pageViews,
  }));

  const visitorsChartData: LineChartDataPoint[] = dailyData.map((day) => ({
    label: day.date.slice(5),
    value: day.uniqueVisitors,
  }));

  // Bar chart - device distribution
  const deviceData: BarChartDataPoint[] = dailyData.length > 0
    ? [
        {
          label: "Mobile",
          value: dailyData.reduce((sum, d) => sum + d.deviceDistribution.mobile, 0),
          color: "#8B2635",
        },
        {
          label: "Desktop",
          value: dailyData.reduce((sum, d) => sum + d.deviceDistribution.desktop, 0),
          color: "#C5A572",
        },
        {
          label: "Tablet",
          value: dailyData.reduce((sum, d) => sum + d.deviceDistribution.tablet, 0),
          color: "#E8E4E1",
        },
      ]
    : [];

  // Pie chart - traffic sources (əgər məlumat varsa)
  const trafficSourcesData: PieChartDataPoint[] = dailyData.length > 0
    ? Object.entries(
        dailyData.reduce(
          (acc, day) => {
            Object.entries(day.trafficSources).forEach(([source, count]) => {
              acc[source] = (acc[source] || 0) + count;
            });
            return acc;
          },
          {} as Record<string, number>
        )
      ).map(([source, count], i) => ({
        label: source,
        value: count,
        color: ["#8B2635", "#C5A572", "#2C2C2C", "#E8E4E1", "#8B8B8B"][i % 5],
      }))
    : [];

  return (
    <>
      <PageHeader
        title="Analitika - Ümumi Statistika"
        description="Sayt performansı, ziyarətçi davranışı və məqalə analitikası"
      />

      <div className="space-y-8 px-6 py-8 lg:px-10">
        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/analytics"
            className="border-2 border-bordo bg-bordo px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-cream"
          >
            Ümumi
          </Link>
          <Link
            href="/admin/analytics/articles"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Məqalələr
          </Link>
          <Link
            href="/admin/analytics/crm"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            CRM
          </Link>
          <Link
            href="/admin/analytics/revenue"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Gəlir
          </Link>
        </div>

        {/* Date range picker */}
        <DateRangePicker value={dateRange} onChange={setDateRange} showPresets />

        {error && (
          <Alert tone="error">
            {error}
            <br />
            <span className="text-[11px]">
              Firestore-da məlumat yoxdur. Tracking sistemi aktivləşdirildikdən sonra statistika toplanacaq.
            </span>
          </Alert>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-line border-t-bordo" />
            <p className="mt-4 font-ui text-[13px] text-muted">Yüklənir...</p>
          </div>
        ) : (
          <>
            {/* Real-time stats */}
            {summary && (
              <div>
                <h2 className="mb-4 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                  Real-time (Son 5 dəqiqə)
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="Aktiv İstifadəçi"
                    value={summary.realTime.activeUsers}
                    icon="👥"
                    loading={false}
                  />
                  <div className="lg:col-span-2">
                    <Panel title="Canlı səhifələr">
                      {summary.realTime.currentPageViews.length === 0 ? (
                        <p className="py-4 text-center font-ui text-[12px] text-muted">
                          Hazırda aktiv ziyarətçi yoxdur
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {summary.realTime.currentPageViews.map((page, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between border-b border-line py-2"
                            >
                              <span className="font-mono text-[11px] text-ink">{page.path}</span>
                              <span className="font-ui text-[12px] text-bordo">
                                {page.count} aktiv
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Panel>
                  </div>
                </div>
              </div>
            )}

            {/* Today, This Week, This Month metrics */}
            {summary && (
              <>
                <div>
                  <h2 className="mb-4 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                    Bu Gün
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      label="Səhifə Baxışı"
                      value={summary.today.pageViews.toLocaleString()}
                      icon="📄"
                    />
                    <MetricCard
                      label="Unikal Ziyarətçi"
                      value={summary.today.uniqueVisitors.toLocaleString()}
                      icon="👤"
                    />
                    <MetricCard
                      label="Sessiyalar"
                      value={summary.today.sessions.toLocaleString()}
                      icon="🔄"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                    Bu Həftə
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <MetricCard
                      label="Səhifə Baxışı"
                      value={summary.thisWeek.pageViews.toLocaleString()}
                      icon="📊"
                    />
                    <MetricCard
                      label="Unikal Ziyarətçi"
                      value={summary.thisWeek.uniqueVisitors.toLocaleString()}
                      icon="👥"
                    />
                    <MetricCard
                      label="Sessiyalar"
                      value={summary.thisWeek.sessions.toLocaleString()}
                      icon="📈"
                    />
                  </div>
                  {summary.thisWeek.topArticle && (
                    <div className="mt-4">
                      <Panel title="Bu həftənin ən çox oxunan məqaləsi">
                        <p className="font-display text-lg text-ink">
                          {summary.thisWeek.topArticle.title}
                        </p>
                        <p className="mt-1 font-ui text-[12px] text-muted">
                          {summary.thisWeek.topArticle.views.toLocaleString()} baxış
                        </p>
                      </Panel>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="mb-4 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                    Bu Ay
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <MetricCard
                      label="Səhifə Baxışı"
                      value={summary.thisMonth.pageViews.toLocaleString()}
                      icon="📄"
                    />
                    <MetricCard
                      label="Unikal Ziyarətçi"
                      value={summary.thisMonth.uniqueVisitors.toLocaleString()}
                      icon="👤"
                    />
                    <MetricCard
                      label="Sessiyalar"
                      value={summary.thisMonth.sessions.toLocaleString()}
                      icon="🔄"
                    />
                    <MetricCard
                      label="Gəlir"
                      value={`${summary.thisMonth.revenue} ₼`}
                      icon="💰"
                    />
                    <MetricCard
                      label="Yeni Abunəçi"
                      value={summary.thisMonth.newSubscribers}
                      icon="✉️"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Charts */}
            {dailyData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Gündəlik Səhifə Baxışları" description={`${dateRange.start} - ${dateRange.end}`}>
                  <LineChart data={pageViewsChartData} height={250} showGrid showPoints />
                </Panel>

                <Panel title="Gündəlik Unikal Ziyarətçilər" description={`${dateRange.start} - ${dateRange.end}`}>
                  <LineChart
                    data={visitorsChartData}
                    height={250}
                    color="#C5A572"
                    showGrid
                    showPoints
                  />
                </Panel>
              </div>
            )}

            {/* Device & Traffic sources */}
            {dailyData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Cihaz Bölgüsü" description="Mobil, Desktop və ya Tablet">
                  <div className="flex justify-center py-4">
                    <BarChart data={deviceData} height={220} />
                  </div>
                </Panel>

                {trafficSourcesData.length > 0 && (
                  <Panel title="Trafik Mənbələri" description="Ziyarətçilər haradan gəlir">
                    <div className="flex justify-center py-4">
                      <PieChart data={trafficSourcesData} size={220} showLegend />
                    </div>
                  </Panel>
                )}
              </div>
            )}

            {/* Top & Trending Articles */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Ən Çox Oxunan Məqalələr" description="Ümumi baxış sayına görə">
                {topArticles.length === 0 ? (
                  <p className="py-8 text-center font-ui text-[12px] text-muted">
                    Məlumat yoxdur
                  </p>
                ) : (
                  <StatsList
                    items={topArticles.slice(0, 10).map((article) => ({
                      label: article.articleId,
                      value: `${article.views.toLocaleString()} baxış`,
                    }))}
                  />
                )}
              </Panel>

              <Panel title="Trending Məqalələr" description="Son 7 günə görə populyar">
                {trendingArticles.length === 0 ? (
                  <p className="py-8 text-center font-ui text-[12px] text-muted">
                    Məlumat yoxdur
                  </p>
                ) : (
                  <StatsList
                    items={trendingArticles.slice(0, 10).map((article) => ({
                      label: article.articleId,
                      value: article.trendingScore.toFixed(0),
                      color: "#C5A572",
                    }))}
                  />
                )}
              </Panel>
            </div>

            {/* Performance metrics */}
            {dailyData.length > 0 && (
              <Panel title="Performans Göstəriciləri" description="Ortalama göstəricilər">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <StatsList
                      items={[
                        {
                          label: "Bounce Rate",
                          value: `${(
                            dailyData.reduce((s, d) => s + d.bounceRate, 0) / dailyData.length
                          ).toFixed(1)}%`,
                        },
                        {
                          label: "Ortalama Session Müddəti",
                          value: `${Math.floor(
                            dailyData.reduce((s, d) => s + d.avgSessionDuration, 0) /
                              dailyData.length /
                              60
                          )}:${(
                            Math.floor(
                              dailyData.reduce((s, d) => s + d.avgSessionDuration, 0) /
                                dailyData.length
                            ) % 60
                          )
                            .toString()
                            .padStart(2, "0")}`,
                        },
                        {
                          label: "Səhifə/Session",
                          value: (
                            dailyData.reduce((s, d) => s + d.avgPagesPerSession, 0) /
                            dailyData.length
                          ).toFixed(1),
                        },
                      ]}
                    />
                  </div>
                  <div>
                    <StatsList
                      items={[
                        {
                          label: "Ümumi Səhifə Baxışı",
                          value: dailyData
                            .reduce((s, d) => s + d.pageViews, 0)
                            .toLocaleString(),
                        },
                        {
                          label: "Ümumi Unikal Ziyarətçi",
                          value: dailyData
                            .reduce((s, d) => s + d.uniqueVisitors, 0)
                            .toLocaleString(),
                        },
                        {
                          label: "Ümumi Sessiya",
                          value: dailyData
                            .reduce((s, d) => s + d.sessions, 0)
                            .toLocaleString(),
                        },
                      ]}
                    />
                  </div>
                </div>
              </Panel>
            )}

            {/* Empty state */}
            {!summary && dailyData.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-3xl">
                  📊
                </div>
                <p className="font-display text-xl text-ink">Hələ məlumat yoxdur</p>
                <p className="mt-2 font-ui text-[13px] text-muted">
                  Ziyarətçi tracking aktivləşdirildikdən sonra statistika burada görünəcək.
                </p>
                <Link
                  href="/admin/analytics/setup"
                  className="btn-primary mt-6 inline-block"
                >
                  Tracking Quraşdırması
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
