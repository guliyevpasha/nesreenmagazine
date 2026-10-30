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

  useEffect(() => {
    loadDashboardData();
  }, []);

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

      setFeaturedArticle(featured);
      setRecentArticles(recent);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err instanceof Error ? err.message : "Məlumat yüklənmədi");
      // Set empty stats to show page
      setStats({
        articles: [],
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        pageViews: 0,
        subscribers: 0,
        totalRevenue: 0,
      });
    }
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-bordo border-t-transparent" />
          <p className="mt-4 font-ui text-[13px] text-muted">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-deep">
      {/* Header */}
      <div className="border-b border-line bg-paper px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink">Ana səhifə</h1>
            <p className="mt-1 font-ui text-[13px] text-muted">
              Saytın ümumi statistikası və son fəaliyyətlər
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-line bg-paper px-3 py-2 font-ui text-[12px] text-ink rounded"
            >
              <option value="7d">Son 7 gün</option>
              <option value="30d">Son 30 gün</option>
              <option value="90d">Son 90 gün</option>
            </select>
            <Button onClick={() => router.push("/admin/articles/new")}>
              + Yeni məqalə
            </Button>
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
            value={stats.totalArticles.toLocaleString()}
            change="+12%"
            isPositive={true}
          />
          <StatCard
            label="Bu ay baxış"
            value={stats.pageViews.toLocaleString()}
            change="+8.2%"
            isPositive={true}
          />
          <StatCard
            label="Aktiv istifadəçilər"
            value={(stats.pageViews / 3).toFixed(0)}
            change="+5.4%"
            isPositive={true}
          />
          <StatCard
            label="Yayımlanmış"
            value={stats.publishedArticles.toLocaleString()}
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
            <RecentActivity articles={stats.articles.slice(0, 10)} />
          </div>

          {/* Sağ sidebar - 4 sütun */}
          <div className="space-y-6 lg:col-span-4">
            <CategoriesPanel articles={stats.articles} />
            <RecentEditsPanel articles={stats.articles} />
            <SubscribersPanel count={stats.subscribers} />
            <QuickActionsPanel />
            <BrandCard />
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
