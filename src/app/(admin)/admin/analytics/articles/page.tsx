"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, Panel, Alert } from "@/components/admin/ui";
import {
  MetricCard,
  LineChart,
  BarChart,
  DateRangePicker,
  StatsList,
  ProgressBar,
  type DateRange,
  type LineChartDataPoint,
  type BarChartDataPoint,
} from "@/components/admin/analytics";
import { useAuth } from "@/lib/firebase/auth";
import {
  listArticles,
  getArticleAnalytics,
  getTopArticles,
  getTrendingArticles,
  listPageViews,
} from "@/lib/data/admin";
import { categories } from "@/lib/categories";
import type { Article, ArticleAnalytics, PageView } from "@/lib/types";

export default function ArticleAnalyticsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleAnalytics[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<ArticleAnalytics[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [articleDetail, setArticleDetail] = useState<ArticleAnalytics | null>(null);
  const [articleViews, setArticleViews] = useState<PageView[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return { start, end };
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  useEffect(() => {
    if (selectedArticleId) {
      loadArticleDetail(selectedArticleId);
    }
  }, [selectedArticleId, dateRange]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [articlesData, top, trending] = await Promise.all([
        listArticles().catch(() => [] as Article[]),
        getTopArticles(20).catch(() => [] as ArticleAnalytics[]),
        getTrendingArticles(20).catch(() => [] as ArticleAnalytics[]),
      ]);

      setArticles(articlesData);
      setTopArticles(top);
      setTrendingArticles(trending);

      // İlk məqaləni seç (əgər varsa)
      if (!selectedArticleId && top.length > 0) {
        setSelectedArticleId(top[0].articleId);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  }

  async function loadArticleDetail(articleId: string) {
    try {
      const [analytics, views] = await Promise.all([
        getArticleAnalytics(articleId).catch(() => null),
        listPageViews({
          articleId,
          startDate: dateRange.start,
          endDate: dateRange.end,
          limitCount: 100,
        }).catch(() => [] as PageView[]),
      ]);

      setArticleDetail(analytics);
      setArticleViews(views);
    } catch (err) {
      console.error("Article detail load failed:", err);
    }
  }

  if (!session) return null;

  // Seçilmiş məqaləni tap
  const selectedArticle = articles.find((a) => a.id === selectedArticleId);

  // Gündəlik baxış məlumatları
  const dailyViewsMap: Record<string, number> = {};
  articleViews.forEach((view) => {
    const date = view.viewedAt.slice(0, 10);
    dailyViewsMap[date] = (dailyViewsMap[date] || 0) + 1;
  });

  const dailyViewsChartData: LineChartDataPoint[] = Object.entries(dailyViewsMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      label: date.slice(5), // MM-DD
      value: count,
    }));

  // Kateqoriya üzrə top məqalələr
  const categoryDistribution: Record<string, number> = {};
  topArticles.forEach((article) => {
    const fullArticle = articles.find((a) => a.id === article.articleId);
    if (fullArticle) {
      categoryDistribution[fullArticle.category] =
        (categoryDistribution[fullArticle.category] || 0) + article.views;
    }
  });

  const categoryChartData: BarChartDataPoint[] = Object.entries(categoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, views]) => {
      const cat = categories.find((c) => c.slug === category);
      return {
        label: cat?.name.az || category,
        value: views,
        color: "#8B2635",
      };
    });

  // Dil üzrə baxışlar (seçilmiş məqalə üçün)
  const localeDistribution: Record<string, number> = {};
  articleViews.forEach((view) => {
    localeDistribution[view.locale] = (localeDistribution[view.locale] || 0) + 1;
  });

  // Referrer statistikası
  const referrerDistribution: Record<string, number> = {};
  articleViews.forEach((view) => {
    const referrer = view.referrer || "Direct";
    referrerDistribution[referrer] = (referrerDistribution[referrer] || 0) + 1;
  });

  const topReferrers = Object.entries(referrerDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <>
      <PageHeader
        title="Məqalə Performans Analitikası"
        description="Məqalələrin baxış statistikası, populyarlıq və oxucu davranışı"
      />

      <div className="space-y-8 px-6 py-8 lg:px-10">
        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/analytics"
            className="border-2 border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo"
          >
            Ümumi
          </Link>
          <Link
            href="/admin/analytics/articles"
            className="border-2 border-bordo bg-bordo px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-cream"
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
            {/* Overview metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Ümumi Məqalə"
                value={articles.length}
                icon="📄"
              />
              <MetricCard
                label="Dərc Olunmuş"
                value={articles.filter((a) => a.status === "published").length}
                icon="✓"
              />
              <MetricCard
                label="Ümumi Baxış"
                value={topArticles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
                icon="👁️"
              />
              <MetricCard
                label="Ortalama Baxış"
                value={
                  topArticles.length > 0
                    ? Math.round(
                        topArticles.reduce((sum, a) => sum + a.views, 0) / topArticles.length
                      ).toLocaleString()
                    : "0"
                }
                icon="📊"
              />
            </div>

            {/* Top & Trending */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Ən Çox Oxunan Məqalələr (Top 20)">
                {topArticles.length === 0 ? (
                  <p className="py-8 text-center font-ui text-[12px] text-muted">
                    Məlumat yoxdur
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topArticles.map((article) => {
                      const fullArticle = articles.find((a) => a.id === article.articleId);
                      return (
                        <button
                          key={article.articleId}
                          onClick={() => setSelectedArticleId(article.articleId)}
                          className={`w-full border-b border-line py-2 text-left transition-colors hover:bg-cream-deep/30 ${
                            selectedArticleId === article.articleId ? "bg-cream-deep/50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 px-2">
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-display text-[14px] text-ink">
                                {fullArticle?.title.az || article.articleId}
                              </p>
                              <p className="mt-0.5 font-ui text-[10px] text-muted">
                                {fullArticle?.category || "—"}
                              </p>
                            </div>
                            <span className="shrink-0 font-ui text-[12px] text-bordo">
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel title="Trending Məqalələr (Son 7 gün)">
                {trendingArticles.length === 0 ? (
                  <p className="py-8 text-center font-ui text-[12px] text-muted">
                    Məlumat yoxdur
                  </p>
                ) : (
                  <div className="space-y-2">
                    {trendingArticles.map((article) => {
                      const fullArticle = articles.find((a) => a.id === article.articleId);
                      return (
                        <button
                          key={article.articleId}
                          onClick={() => setSelectedArticleId(article.articleId)}
                          className={`w-full border-b border-line py-2 text-left transition-colors hover:bg-cream-deep/30 ${
                            selectedArticleId === article.articleId ? "bg-cream-deep/50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 px-2">
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-display text-[14px] text-ink">
                                {fullArticle?.title.az || article.articleId}
                              </p>
                              <p className="mt-0.5 font-ui text-[10px] text-muted">
                                Son 7 gün: {article.viewsLast7Days.toLocaleString()} baxış
                              </p>
                            </div>
                            <span className="shrink-0 font-ui text-[12px] text-gold">
                              {article.trendingScore.toFixed(0)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>

            {/* Kateqoriya üzrə performans */}
            {categoryChartData.length > 0 && (
              <Panel
                title="Kateqoriya üzrə Baxışlar"
                description="Hansı bölmələr daha çox oxunur"
              >
                <BarChart data={categoryChartData} height={250} />
              </Panel>
            )}

            {/* Seçilmiş məqalənin detalları */}
            {selectedArticle && articleDetail && (
              <div className="space-y-6">
                <div className="border-l-4 border-bordo bg-cream-deep/30 px-6 py-4">
                  <p className="font-ui text-[10px] uppercase tracking-[0.14em] text-muted">
                    Seçilmiş Məqalə
                  </p>
                  <h3 className="mt-1 font-display text-xl text-ink">
                    {selectedArticle.title.az}
                  </h3>
                  <p className="mt-1 font-ui text-[12px] text-muted">
                    {selectedArticle.category} · {selectedArticle.slug}
                  </p>
                </div>

                {/* Məqalə metrikləri */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Ümumi Baxış"
                    value={articleDetail.views.toLocaleString()}
                    icon="👁️"
                  />
                  <MetricCard
                    label="Unikal Ziyarətçi"
                    value={articleDetail.uniqueVisitors.toLocaleString()}
                    icon="👤"
                  />
                  <MetricCard
                    label="Ortalama Müddət"
                    value={`${Math.floor(articleDetail.avgTimeOnPage / 60)}:${(
                      articleDetail.avgTimeOnPage % 60
                    )
                      .toString()
                      .padStart(2, "0")}`}
                    icon="⏱️"
                  />
                  <MetricCard
                    label="Son 7 Gün"
                    value={articleDetail.viewsLast7Days.toLocaleString()}
                    icon="📈"
                  />
                </div>

                {/* Gündəlik baxışlar */}
                {dailyViewsChartData.length > 0 && (
                  <Panel
                    title="Gündəlik Baxışlar"
                    description={`${dateRange.start} - ${dateRange.end}`}
                  >
                    <LineChart data={dailyViewsChartData} height={220} showGrid showPoints />
                  </Panel>
                )}

                {/* Dil və Referrer statistikası */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Dil bölgüsü */}
                  {Object.keys(localeDistribution).length > 0 && (
                    <Panel title="Dil üzrə Baxışlar">
                      <div className="space-y-3">
                        {Object.entries(localeDistribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([locale, count]) => {
                            const total = Object.values(localeDistribution).reduce(
                              (s, c) => s + c,
                              0
                            );
                            const percentage = ((count / total) * 100).toFixed(1);
                            return (
                              <ProgressBar
                                key={locale}
                                label={locale.toUpperCase()}
                                value={count}
                                max={total}
                                showPercentage
                              />
                            );
                          })}
                      </div>
                    </Panel>
                  )}

                  {/* Top referrerlər */}
                  {topReferrers.length > 0 && (
                    <Panel title="Trafik Mənbələri" description="Bu məqalə üçün">
                      <div className="space-y-2">
                        {topReferrers.map(([referrer, count]) => (
                          <div
                            key={referrer}
                            className="flex items-center justify-between border-b border-line py-2"
                          >
                            <span className="truncate font-ui text-[12px] text-ink">
                              {referrer === "Direct"
                                ? "Birbaşa"
                                : referrer.length > 40
                                  ? referrer.slice(0, 40) + "..."
                                  : referrer}
                            </span>
                            <span className="shrink-0 font-ui text-[12px] text-bordo">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}
                </div>

                {/* Ətraflı məlumat */}
                <Panel title="Ətraflı Statistika">
                  <StatsList
                    items={[
                      {
                        label: "Son 30 gün baxışı",
                        value: articleDetail.viewsLast30Days.toLocaleString(),
                      },
                      {
                        label: "Paylaşım sayı",
                        value: articleDetail.shares.toLocaleString(),
                      },
                      {
                        label: "Şərh sayı",
                        value: articleDetail.comments.toLocaleString(),
                      },
                      {
                        label: "Trending score",
                        value: articleDetail.trendingScore.toFixed(1),
                        color: "#C5A572",
                      },
                    ]}
                  />
                </Panel>
              </div>
            )}

            {/* Empty state */}
            {topArticles.length === 0 && trendingArticles.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream text-3xl">
                  📊
                </div>
                <p className="font-display text-xl text-ink">Hələ məlumat yoxdur</p>
                <p className="mt-2 font-ui text-[13px] text-muted">
                  Məqalələr üçün tracking aktivləşdirildikdən sonra statistika burada görünəcək.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
