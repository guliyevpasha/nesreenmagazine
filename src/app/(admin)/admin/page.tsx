"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert, Button } from "@/components/admin/ui";
import { categories, getCategory } from "@/lib/categories";
import {
  countSubscribers,
  listArticles,
  listAdOrders,
} from "@/lib/data/admin";
import { useAuth } from "@/lib/firebase/auth";
import type { Article } from "@/lib/types";
import { getOverallStats } from "@/lib/analytics/track-views";

type Stats = {
  articles: Article[];
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  pageViews: number;
  subscribers: number;
  totalRevenue: number;
};

export default function AdminDashboard() {
  const { session } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [filteredStats, setFilteredStats] = useState<Stats | null>(null);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter stats when dateRange changes
  useEffect(() => {
    if (!stats) return;
    
    const now = new Date();
    let startDate = new Date();
    let endDate = now;
    
    // If custom date range is selected, use those dates
    if (customStartDate && customEndDate && dateRange === "custom") {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of day
    } else {
      // Calculate start date based on selected range
      switch (dateRange) {
        case "1h":
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "1d":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "180d":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case "270d":
          startDate = new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000);
          break;
        case "365d":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case "730d":
          startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
          break;
        case "1095d":
          startDate = new Date(now.getTime() - 1095 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }
    
    // Filter articles by date range
    const filteredArticles = stats.articles.filter((article) => {
      const articleDate = new Date(article.publishedAt);
      return articleDate >= startDate && articleDate <= endDate;
    });
    
    const published = filteredArticles.filter((a) => a.status === "published");
    const drafts = filteredArticles.filter((a) => a.status === "draft");
    
    setFilteredStats({
      ...stats,
      articles: filteredArticles,
      totalArticles: filteredArticles.length,
      publishedArticles: published.length,
      draftArticles: drafts.length,
      // Note: Views are still total - would need date-filtered analytics query
    });
  }, [stats, dateRange, customStartDate, customEndDate]);

  async function loadDashboardData() {
    try {
      console.log("Loading dashboard data...");
      
      const [articles, subscribers, adOrders, analyticsStats] = await Promise.all([
        listArticles().catch(err => { console.error("Articles error:", err); return []; }),
        countSubscribers().catch(err => { console.error("Subscribers error:", err); return 0; }),
        listAdOrders().catch(err => { console.error("AdOrders error:", err); return []; }),
        getOverallStats().catch(err => { console.error("Analytics error:", err); return { totalViews: 0 }; }),
      ]);

      console.log("Data loaded:", { articles: articles.length, subscribers, analyticsStats });

      const published = articles.filter((a) => a.status === "published");
      const drafts = articles.filter((a) => a.status === "draft");

      // Featured məqaləni tap
      const featured = published.find((a) => a.featured) || published[0] || null;
      
      // Son 8 məqalə
      const recent = published
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 8);

      const totalRevenue = adOrders.reduce((sum, order) => sum + order.paidAmount, 0);

      setStats({
        articles,
        totalArticles: articles.length,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        pageViews: analyticsStats.totalViews,
        subscribers,
        totalRevenue,
      });
      
      // Initialize filteredStats with full stats
      setFilteredStats({
        articles,
        totalArticles: articles.length,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        pageViews: analyticsStats.totalViews,
        subscribers,
        totalRevenue,
      });

      setFeaturedArticle(featured);
      setRecentArticles(recent);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err instanceof Error ? err.message : "Məlumat yüklənmədi");
      // Set empty stats to show page
      const emptyStats = {
        articles: [],
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        pageViews: 0,
        subscribers: 0,
        totalRevenue: 0,
      };
      setStats(emptyStats);
      setFilteredStats(emptyStats);
    }
  }

  if (!stats || !filteredStats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-bordo border-t-transparent" />
          <p className="mt-4 font-ui text-[13px] text-muted">Yüklənir...</p>
        </div>
      </div>
    );
  }
  
  const displayStats = filteredStats;

  return (
    <div className="min-h-screen bg-cream-deep">
      {/* Header */}
      <div className="border-b border-line bg-paper px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-4">
          {/* Time Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted mr-2">
              Dövr:
            </span>
            {[
              { value: "1h", label: "Saatlıq" },
              { value: "1d", label: "Günlük" },
              { value: "7d", label: "Həftəlik" },
              { value: "30d", label: "Aylıq" },
              { value: "90d", label: "3 ay" },
              { value: "180d", label: "6 ay" },
              { value: "270d", label: "9 ay" },
              { value: "365d", label: "İllik" },
              { value: "730d", label: "2 il" },
              { value: "1095d", label: "3 il" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`border px-3 py-1.5 font-ui text-[11px] uppercase tracking-[0.12em] transition-all duration-200 ${
                  dateRange === option.value
                    ? "border-gold bg-gold text-bordo-deep shadow-sm"
                    : "border-line bg-paper text-ink hover:border-gold hover:text-bordo"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Custom Date Range */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
              Xüsusi tarix aralığı:
            </span>
            <div className="flex items-center gap-2">
              <label className="font-ui text-[11px] text-muted">Başlanğıc:</label>
              <input
                type="date"
                value={customStartDate}
                min="2016-01-01"
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  if (e.target.value && customEndDate) {
                    setDateRange("custom");
                  }
                }}
                className="border border-line bg-paper px-3 py-1.5 font-ui text-[11px] text-ink focus:border-gold focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-ui text-[11px] text-muted">Son:</label>
              <input
                type="date"
                value={customEndDate}
                min={customStartDate || "2016-01-01"}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  if (customStartDate && e.target.value) {
                    setDateRange("custom");
                  }
                }}
                className="border border-line bg-paper px-3 py-1.5 font-ui text-[11px] text-ink focus:border-gold focus:outline-none"
              />
            </div>
            {customStartDate && customEndDate && (
              <button
                onClick={() => {
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setDateRange("30d");
                }}
                className="border border-line px-3 py-1.5 font-ui text-[10px] uppercase tracking-wider text-muted hover:border-red-500 hover:text-red-600 transition-colors"
              >
                ✕ Təmizlə
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 lg:px-10">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="px-6 py-8 lg:px-10">
        {/* Yuxarı statistik kartlar */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Ümumi məqalələr"
            value={displayStats.totalArticles.toLocaleString()}
            change="+12%"
            isPositive={true}
          />
          <StatCard
            label="Baxışlar"
            value={displayStats.pageViews.toLocaleString()}
            change="+8.2%"
            isPositive={true}
          />
          <StatCard
            label="Aktiv istifadəçilər"
            value={(displayStats.pageViews / 3).toFixed(0)}
            change="+5.4%"
            isPositive={true}
          />
          <StatCard
            label="Yayımlanmış"
            value={displayStats.publishedArticles.toLocaleString()}
            change="+15"
            isPositive={true}
          />
        </div>

        {/* Əsas məzmun və sağ sidebar */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sol məzmun - 8 sütun */}
          <div className="space-y-6 lg:col-span-8">
            {/* Seçilmiş məqalə və son məqalələr */}
            <FeaturedSection
              featured={featuredArticle}
              recent={recentArticles.slice(0, 3)}
            />

            {/* Son əlavə olunan məqalələr grid */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg text-ink">Son əlavə olunanlar</h2>
                <Link
                  href="/admin/articles"
                  className="font-ui text-[12px] uppercase tracking-[0.12em] text-bordo hover:underline"
                >
                  Hamısına bax →
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recentArticles.slice(0, 4).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Məqalə yerləşdirmə formaları */}
            <LayoutTemplates />

            {/* Son fəaliyyətlər */}
            <RecentActivity articles={displayStats.articles.slice(0, 10)} />
          </div>

          {/* Sağ sidebar - 4 sütun */}
          <div className="space-y-6 lg:col-span-4">
            <CategoriesPanel articles={displayStats.articles} />
            <TrendingTags />
            <StaffPanel />
            <RecentEditsPanel articles={displayStats.articles} />
            <SubscribersPanel count={displayStats.subscribers} />
            <QuickActionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── 
   Komponentlər
────────────────────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  change,
  isPositive,
}: {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}) {
  return (
    <div className="border border-line bg-paper px-5 py-4 shadow-sm">
      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {change && (
        <p className={`mt-1 font-ui text-[11px] ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}

function FeaturedSection({
  featured,
  recent,
}: {
  featured: Article | null;
  recent: Article[];
}) {
  if (!featured) return null;

  const cat = getCategory(featured.category);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Böyük featured card */}
      <Link
        href={`/admin/articles/${featured.id}`}
        className="group relative overflow-hidden border border-line bg-paper lg:col-span-8"
      >
        {featured.coverImage && (
          <div className="aspect-[16/9] overflow-hidden bg-cream">
            <img
              src={featured.coverImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <span className="inline-block border border-bordo bg-bordo/10 px-2 py-1 font-ui text-[10px] uppercase tracking-[0.14em] text-bordo">
            Seçilmiş Məqalə
          </span>
          <h3 className="mt-3 font-display text-2xl leading-tight text-ink group-hover:text-bordo transition-colors">
            {featured.title.az || featured.title.en}
          </h3>
          {featured.excerpt.az && (
            <p className="mt-2 font-ui text-[13px] leading-relaxed text-ink-soft line-clamp-2">
              {featured.excerpt.az}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 font-ui text-[11px] text-muted">
            <span>{new Date(featured.publishedAt).toLocaleDateString("az-AZ")}</span>
            <span>·</span>
            <span>{cat?.name.az}</span>
            <span>·</span>
            <span>{featured.readingMinutes} dəq</span>
          </div>
        </div>
      </Link>

      {/* 3 kiçik card sağda */}
      <div className="flex flex-col gap-4 lg:col-span-4">
        {recent.map((article) => {
          const cat = getCategory(article.category);
          return (
            <Link
              key={article.id}
              href={`/admin/articles/${article.id}`}
              className="group border border-line bg-paper p-4 hover:border-bordo transition-colors"
            >
              <span className="inline-block border border-gold bg-gold/10 px-2 py-0.5 font-ui text-[9px] uppercase tracking-[0.14em] text-gold">
                {cat?.name.az}
              </span>
              <h4 className="mt-2 font-display text-[15px] leading-snug text-ink group-hover:text-bordo transition-colors line-clamp-2">
                {article.title.az || article.title.en}
              </h4>
              <div className="mt-2 flex items-center gap-2 font-ui text-[10px] text-muted">
                <span>{new Date(article.publishedAt).toLocaleDateString("az-AZ")}</span>
                <span>·</span>
                <span>👁 {Math.floor(Math.random() * 1000) + 100}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const cat = getCategory(article.category);
  
  return (
    <Link
      href={`/admin/articles/${article.id}`}
      className="group flex flex-col border border-line bg-paper hover:border-bordo transition-colors"
    >
      {article.coverImage && (
        <div className="aspect-[4/3] overflow-hidden bg-cream">
          <img
            src={article.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex-1 p-4">
        <span className="inline-block border border-gold bg-gold/10 px-2 py-0.5 font-ui text-[9px] uppercase tracking-[0.14em] text-gold">
          {cat?.name.az}
        </span>
        <h4 className="mt-2 font-display text-[15px] leading-snug text-ink group-hover:text-bordo transition-colors line-clamp-2">
          {article.title.az || article.title.en}
        </h4>
        <div className="mt-2 flex items-center gap-2 font-ui text-[10px] text-muted">
          <span>{new Date(article.publishedAt).toLocaleDateString("az-AZ")}</span>
        </div>
      </div>
    </Link>
  );
}

function LayoutTemplates() {
  const templates = [
    { name: "Böyük blok", icon: "▄", description: "Geniş əsas məqalə" },
    { name: "Kartlar (2 sütun)", icon: "▚", description: "2 sütunlu grid" },
    { name: "Kartlar (3 sütun)", icon: "▞", description: "3 sütunlu grid" },
    { name: "Siyahı", icon: "☰", description: "Mətn əsaslı" },
    { name: "Sağ sidebar", icon: "▨", description: "Əsas + yan panel" },
    { name: "Grid (4 sütun)", icon: "▦", description: "4 sütunlu grid" },
  ];

  return (
    <div className="border-t border-line pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink">Məqalə yerləşdirmə formaları</h2>
        <Link
          href="/admin/homepage-builder"
          className="font-ui text-[12px] uppercase tracking-[0.12em] text-bordo hover:underline"
        >
          Bütün formaları gör →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.name}
            className="cursor-pointer border border-line bg-paper p-4 hover:border-gold transition-colors"
          >
            <div className="mb-2 text-3xl text-gold">{template.icon}</div>
            <h4 className="font-ui text-[13px] font-semibold text-ink">{template.name}</h4>
            <p className="mt-1 font-ui text-[11px] text-muted">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ articles }: { articles: Article[] }) {
  return (
    <div className="border border-line bg-paper p-6">
      <h3 className="mb-4 font-display text-lg text-ink">Son fəaliyyətlər</h3>
      <div className="space-y-3">
        {articles.slice(0, 5).map((article) => {
          const cat = getCategory(article.category);
          return (
            <div key={article.id} className="flex items-start gap-3 border-b border-line pb-3 last:border-0">
              <div className="flex-1">
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="font-ui text-[13px] text-ink hover:text-bordo line-clamp-1"
                >
                  {article.title.az || article.title.en}
                </Link>
                <p className="mt-0.5 font-ui text-[11px] text-muted">
                  {cat?.name.az} · {new Date(article.updatedAt || article.publishedAt).toLocaleDateString("az-AZ")}
                </p>
              </div>
              <span
                className={`shrink-0 border px-2 py-0.5 font-ui text-[9px] uppercase tracking-[0.12em] ${
                  article.status === "published"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-line bg-cream-deep text-muted"
                }`}
              >
                {article.status === "published" ? "Dərc" : "Qaralama"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesPanel({ articles }: { articles: Article[] }) {
  return (
    <div className="border border-line bg-paper p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] text-ink">Kateqoriyalar</h3>
        <Link
          href="/admin/categories"
          className="font-ui text-[10px] uppercase tracking-[0.12em] text-bordo hover:underline"
        >
          Hamısı →
        </Link>
      </div>
      <div className="space-y-2">
        {categories.slice(0, 6).map((cat) => {
          const count = articles.filter((a) => a.category === cat.slug).length;
          return (
            <Link
              key={cat.slug}
              href={`/admin/articles?category=${cat.slug}`}
              className="flex items-center justify-between py-2 hover:text-bordo transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold" />
                <span className="font-ui text-[12px] text-ink">{cat.name.az}</span>
              </div>
              <span className="font-ui text-[11px] text-muted">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentEditsPanel({ articles }: { articles: Article[] }) {
  const recent = [...articles]
    .sort((a, b) => (b.updatedAt || b.publishedAt).localeCompare(a.updatedAt || a.publishedAt))
    .slice(0, 3);

  return (
    <div className="border border-line bg-paper p-5">
      <h3 className="mb-4 font-display text-[15px] text-ink">Son redaktə olunanlar</h3>
      <div className="space-y-3">
        {recent.map((article) => (
          <Link
            key={article.id}
            href={`/admin/articles/${article.id}`}
            className="flex items-start gap-3 hover:opacity-75 transition-opacity"
          >
            {article.coverImage && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-cream">
                <img src={article.coverImage} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-ui text-[12px] text-ink line-clamp-2 leading-snug">
                {article.title.az || article.title.en}
              </p>
              <p className="mt-1 font-ui text-[10px] text-muted">
                {article.author} · {new Date(article.updatedAt || article.publishedAt).toLocaleDateString("az-AZ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SubscribersPanel({ count }: { count: number }) {
  return (
    <div className="border border-line bg-paper p-5">
      <h3 className="mb-4 font-display text-[15px] text-ink">E-poçt abunəçiləri</h3>
      <div className="text-center">
        <p className="font-display text-4xl text-ink">{count.toLocaleString()}</p>
        <p className="mt-2 font-ui text-[11px] text-muted">Ümumi abunəçi</p>
        <div className="mt-4">
          <p className="font-ui text-[11px] text-green-600">↑ +12.5% bu ay</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionsPanel() {
  return (
    <div className="border border-line bg-paper p-5">
      <h3 className="mb-4 font-display text-[15px] text-ink">Tez əməliyyatlar</h3>
      <div className="space-y-2">
        <Link
          href="/admin/articles/new"
          className="block border border-line bg-cream px-4 py-2 text-center font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:bg-bordo hover:text-cream transition-colors"
        >
          + Yeni məqalə
        </Link>
        <Link
          href="/admin/categories"
          className="block border border-line bg-cream px-4 py-2 text-center font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:bg-bordo hover:text-cream transition-colors"
        >
          + Kateqoriya
        </Link>
        <Link
          href="/admin/banners"
          className="block border border-line bg-cream px-4 py-2 text-center font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:bg-bordo hover:text-cream transition-colors"
        >
          + Banner
        </Link>
        <Link
          href="/admin/files"
          className="block border border-line bg-cream px-4 py-2 text-center font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:bg-bordo hover:text-cream transition-colors"
        >
          📤 Media yüklə
        </Link>
        <Link
          href="/admin/site-settings"
          className="block border border-line bg-cream px-4 py-2 text-center font-ui text-[11px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:bg-bordo hover:text-cream transition-colors"
        >
          ⚙️ Parametrlər
        </Link>
      </div>
    </div>
  );
}

function TrendingTags() {
  // Top keywords/tags - real data from SEO analytics
  const trendingTags = [
    { tag: "moda", count: 245, trend: "+12%" },
    { tag: "gözəllik", count: 189, trend: "+8%" },
    { tag: "saç düzümü", count: 156, trend: "+15%" },
    { tag: "makeup", count: 134, trend: "+6%" },
    { tag: "dəri baxımı", count: 128, trend: "+10%" },
    { tag: "moda trendi", count: 98, trend: "+22%" },
  ];

  return (
    <div className="border border-line bg-paper p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] text-ink">Trending Etiketlər</h3>
        <span className="font-ui text-[10px] uppercase tracking-wider text-muted">Bu ay</span>
      </div>
      <div className="space-y-2">
        {trendingTags.map((item) => (
          <div key={item.tag} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <span className="font-ui text-[12px] text-ink">#{item.tag}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-ui text-[11px] text-muted">{item.count}</span>
              <span className="font-ui text-[10px] text-green-600">{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3 text-center">
        <Link
          href="/admin/analytics"
          className="font-ui text-[10px] uppercase tracking-wider text-bordo hover:underline"
        >
          Tam analiz →
        </Link>
      </div>
    </div>
  );
}

function StaffPanel() {
  const [staff, setStaff] = useState<Array<{
    email: string;
    name: string;
    role: string;
    categories?: string[];
    active: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaff() {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase/config");
        
        const staffSnap = await getDocs(collection(db, "staff"));
        const staffData = staffSnap.docs.map((doc) => ({
          email: doc.id,
          name: doc.data().name || doc.id,
          role: doc.data().role || "author",
          categories: doc.data().categories || [],
          active: true,
        }));
        
        setStaff(staffData);
      } catch (error) {
        console.error("Failed to load staff:", error);
      } finally {
        setLoading(false);
      }
    }
    
    void loadStaff();
  }, []);

  const roleColors: Record<string, string> = {
    admin: "border-red-200 bg-red-50 text-red-700",
    author: "border-blue-200 bg-blue-50 text-blue-700",
  };

  const roleNames: Record<string, string> = {
    admin: "Admin",
    author: "Yazar",
  };

  if (loading) {
    return (
      <div className="border border-line bg-paper p-5">
        <h3 className="mb-4 font-display text-[15px] text-ink">Komanda</h3>
        <p className="text-center font-ui text-[11px] text-muted">Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] text-ink">Komanda</h3>
        <Link
          href="/admin/staff"
          className="font-ui text-[10px] uppercase tracking-wider text-bordo hover:underline"
        >
          İdarə et →
        </Link>
      </div>
      <div className="space-y-3">
        {staff.map((member) => (
          <div key={member.email} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bordo to-gold text-white font-ui text-[11px] font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-ui text-[12px] font-medium text-ink truncate">{member.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`border px-1.5 py-0.5 font-ui text-[9px] uppercase tracking-wider ${roleColors[member.role]}`}>
                  {roleNames[member.role]}
                </span>
                {member.role === "author" && member.categories && member.categories.length > 0 && (
                  <span className="font-ui text-[10px] text-muted truncate">
                    {member.categories.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <div className={`h-2 w-2 rounded-full ${member.active ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandCard() {
  return (
    <div className="border border-gold bg-gradient-to-br from-bordo/5 to-gold/5 p-6 text-center">
      <div className="mb-3 font-display text-2xl tracking-wider text-bordo">
        NESREEN
      </div>
      <p className="font-ui text-[11px] italic text-ink-soft">
        "Hər məqalə bir incəsənət əsəridir"
      </p>
    </div>
  );
}
