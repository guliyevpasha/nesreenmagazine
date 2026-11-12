/**
 * Simple view tracking system using Firestore
 * Bu sistem GA4-ə alternativ olaraq və ya əlavə olaraq işləyir
 */

import { getDb } from "../firebase/client";
import { doc, increment, setDoc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

export interface ViewRecord {
  articleId: string;
  slug: string;
  category: string;
  date: string; // YYYY-MM-DD
  views: number;
  uniqueVisitors: number;
}

/**
 * «Son N gün» dövrünün başlanğıc tarixi (YYYY-MM-DD, UTC — yazma ilə eyni):
 * bu gün + əvvəlki N-1 gün. sinceDate(1) = bu gün.
 */
export function sinceDate(days: number): string {
  const n = Math.max(1, Math.floor(days));
  return new Date(Date.now() - (n - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export interface ArticleViews {
  articleId: string;
  totalViews: number;
  last7Days: number;
  last30Days: number;
  lastViewed: string;
}

/**
 * Məqalə baxışını qeyd et
 */
export async function trackArticleView(
  articleId: string,
  slug: string,
  category: string,
  visitorId?: string,
  metadata?: {
    userAgent?: string;
    referrer?: string;
    device?: string;
    source?: string;
  }
): Promise<void> {
  const db = getDb();
  if (!db) {
    console.warn("Firebase not configured, skipping analytics");
    return;
  }

  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const device = metadata?.device || "unknown";
  const source = metadata?.source || "direct";
  const dailyRef = doc(db, "analytics_daily", `${articleId}_${today}`);

  // Hər yazma ayrıca try/catch-dədir: biri uğursuz olsa (məs. qaydaların rədd
  // etdiyi device/source sahəsi), digərləri — xüsusən ümumi sayğac — yenə yazılır.
  // Əvvəl device yazısı rədd edilib funksiyanı dayandırırdı və analytics_totals artmırdı.
  const safe = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      return true;
    } catch (error) {
      console.error(`View tracking (${label}) error:`, error);
      return false;
    }
  };

  // 1) Ümumi sayğac
  await safe("totals", () =>
    setDoc(
      doc(db, "analytics_totals", articleId),
      { articleId, slug, category, totalViews: increment(1), lastViewed: now, updatedAt: now },
      { merge: true }
    )
  );

  // 2) Günlük sayğac
  await safe("daily", () =>
    setDoc(
      dailyRef,
      { articleId, slug, category, date: today, views: increment(1), updatedAt: now },
      { merge: true }
    )
  );

  // 3) Cihaz və trafik mənbəyi (günlük sənəddə, iç-içə xəritə kimi)
  if (device !== "unknown") {
    await safe("device", () => setDoc(dailyRef, { devices: { [device]: increment(1) } }, { merge: true }));
  }
  if (source !== "direct") {
    await safe("source", () => setDoc(dailyRef, { sources: { [source]: increment(1) } }, { merge: true }));
  }

  // 4) Unikal ziyarətçi: «yaratmağa cəhd et» — sənəd artıq varsa qaydalar yazmanı
  // rədd edir → bu ziyarətçi bu gün artıq sayılıb. Yalnız qaydaların icazə verdiyi
  // sahələr yazılır (userAgent/referrer saxlanmır).
  if (visitorId) {
    const isNewVisitor = await safe("visitor", () =>
      setDoc(doc(db, "analytics_visitors", `${articleId}_${visitorId}_${today}`), {
        articleId,
        visitorId,
        date: today,
        timestamp: now,
      })
    );
    if (isNewVisitor) {
      await safe("unique", () => setDoc(dailyRef, { uniqueVisitors: increment(1) }, { merge: true }));
    }
  }
}

/**
 * Məqalə üzrə statistika
 */
export async function getArticleViews(articleId: string): Promise<ArticleViews> {
  const empty: ArticleViews = { articleId, totalViews: 0, last7Days: 0, last30Days: 0, lastViewed: "" };
  try {
    const db = getDb();
    if (!db) return empty;

    // Bir sorğu ilə məqalənin bütün günlük sənədləri (kompozit indeks tələb etmir)
    const [totalDoc, dailyDocs] = await Promise.all([
      getDoc(doc(db, "analytics_totals", articleId)),
      getDocs(query(collection(db, "analytics_daily"), where("articleId", "==", articleId))),
    ]);

    const date7 = sinceDate(7);
    const date30 = sinceDate(30);

    let dailySum = 0;
    let last7Days = 0;
    let last30Days = 0;
    let lastDailyUpdate = "";
    dailyDocs.forEach((d) => {
      const data = d.data();
      const views = Number(data.views) || 0;
      dailySum += views;
      if (data.date >= date7) last7Days += views;
      if (data.date >= date30) last30Days += views;
      if (typeof data.updatedAt === "string" && data.updatedAt > lastDailyUpdate) lastDailyUpdate = data.updatedAt;
    });

    const totals = totalDoc.exists() ? totalDoc.data() : {};
    const storedTotal = Number(totals.totalViews) || 0;
    const storedLast = typeof totals.lastViewed === "string" ? totals.lastViewed : "";

    return {
      articleId,
      // analytics_totals bir müddət yazılmadığı üçün geridə qala bilər —
      // günlük sənədlərin cəmi böyükdürsə, onu göstər.
      totalViews: Math.max(storedTotal, dailySum),
      last7Days,
      last30Days,
      lastViewed: storedLast > lastDailyUpdate ? storedLast : lastDailyUpdate,
    };
  } catch (error) {
    console.error("Get views error:", error);
    return empty;
  }
}

/**
 * Ən çox baxılan məqalələr
 */
export async function getTopArticles(days: number = 30, limitCount: number = 10): Promise<ArticleViews[]> {
  try {
    const db = getDb();
    if (!db) return [];
    
    const since = sinceDate(days);
    
    // Günlük məlumatları topla
    const dailyQuery = query(
      collection(db, "analytics_daily"),
      where("date", ">=", since),
      orderBy("date", "desc")
    );
    
    const dailyDocs = await getDocs(dailyQuery);
    
    // Məqalə ID-yə görə qrupla
    const articleMap = new Map<string, { views: number; uniqueVisitors: number }>();
    
    dailyDocs.forEach((doc) => {
      const data = doc.data();
      const existing = articleMap.get(data.articleId) || { views: 0, uniqueVisitors: 0 };
      articleMap.set(data.articleId, {
        views: existing.views + (data.views || 0),
        uniqueVisitors: existing.uniqueVisitors + (data.uniqueVisitors || 0),
      });
    });

    // Sırala və top N-i al
    const sorted = Array.from(articleMap.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, limitCount);

    // Hər məqalə üçün tam məlumat al
    const results = await Promise.all(
      sorted.map(async ([articleId, stats]) => {
        const views = await getArticleViews(articleId);
        return views;
      })
    );

    return results;
  } catch (error) {
    console.error("Get top articles error:", error);
    return [];
  }
}

/**
 * Kateqoriya üzrə statistika
 */
export async function getCategoryStats(days: number = 30): Promise<Record<string, number>> {
  try {
    const db = getDb();
    if (!db) return {};
    
    const since = sinceDate(days);
    
    const dailyQuery = query(
      collection(db, "analytics_daily"),
      where("date", ">=", since)
    );
    
    const dailyDocs = await getDocs(dailyQuery);
    const categoryMap = new Map<string, number>();
    
    dailyDocs.forEach((doc) => {
      const data = doc.data();
      const current = categoryMap.get(data.category) || 0;
      categoryMap.set(data.category, current + (data.views || 0));
    });

    return Object.fromEntries(categoryMap);
  } catch (error) {
    console.error("Get category stats error:", error);
    return {};
  }
}

/**
 * Günlük trend məlumatları
 */
export async function getDailyTrend(days: number = 30): Promise<ViewRecord[]> {
  try {
    const db = getDb();
    if (!db) return [];
    
    const since = sinceDate(days);
    
    const dailyQuery = query(
      collection(db, "analytics_daily"),
      where("date", ">=", since),
      orderBy("date", "asc")
    );
    
    const dailyDocs = await getDocs(dailyQuery);
    
    // Günə görə qrupla
    const dailyMap = new Map<string, { views: number; uniqueVisitors: number }>();
    
    dailyDocs.forEach((doc) => {
      const data = doc.data();
      const existing = dailyMap.get(data.date) || { views: 0, uniqueVisitors: 0 };
      dailyMap.set(data.date, {
        views: existing.views + (data.views || 0),
        uniqueVisitors: existing.uniqueVisitors + (data.uniqueVisitors || 0),
      });
    });

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      articleId: "all",
      slug: "all",
      category: "all",
      date,
      views: stats.views,
      uniqueVisitors: stats.uniqueVisitors,
    }));
  } catch (error) {
    console.error("Get daily trend error:", error);
    return [];
  }
}

/**
 * Ümumi statistika özət
 */
export interface OverallStats {
  totalArticles: number;
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  avgViewsPerArticle: number;
  /** Bütün günlər üzrə cəm baxış (tarix artan sırada) — dövr filtrləri üçün. */
  daily: { date: string; views: number; uniqueVisitors: number }[];
}

const EMPTY_OVERALL: OverallStats = {
  totalArticles: 0,
  totalViews: 0,
  viewsToday: 0,
  viewsLast7Days: 0,
  viewsLast30Days: 0,
  avgViewsPerArticle: 0,
  daily: [],
};

export async function getOverallStats(): Promise<OverallStats> {
  try {
    const db = getDb();
    if (!db) return EMPTY_OVERALL;

    const [totalsDocs, dailyDocs] = await Promise.all([
      getDocs(collection(db, "analytics_totals")),
      getDocs(collection(db, "analytics_daily")),
    ]);

    // Məqalə üzrə: saxlanmış ümumi sayğac ilə günlük cəmdən böyüyü
    // (analytics_totals bir müddət yazılmadığı üçün geridə qala bilər).
    const perArticle = new Map<string, number>();
    totalsDocs.forEach((d) => {
      perArticle.set(d.id, Number(d.data().totalViews) || 0);
    });
    const dailySumByArticle = new Map<string, number>();
    const byDate = new Map<string, { views: number; uniqueVisitors: number }>();
    dailyDocs.forEach((d) => {
      const data = d.data();
      const views = Number(data.views) || 0;
      if (typeof data.articleId === "string") {
        dailySumByArticle.set(data.articleId, (dailySumByArticle.get(data.articleId) || 0) + views);
      }
      if (typeof data.date === "string") {
        const cur = byDate.get(data.date) || { views: 0, uniqueVisitors: 0 };
        cur.views += views;
        cur.uniqueVisitors += Number(data.uniqueVisitors) || 0;
        byDate.set(data.date, cur);
      }
    });
    dailySumByArticle.forEach((sum, id) => {
      perArticle.set(id, Math.max(perArticle.get(id) || 0, sum));
    });

    const totalArticles = perArticle.size;
    const totalViews = Array.from(perArticle.values()).reduce((a, b) => a + b, 0);

    const daily = Array.from(byDate.entries())
      .map(([date, s]) => ({ date, ...s }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const sumSince = (since: string) =>
      daily.filter((d) => d.date >= since).reduce((sum, d) => sum + d.views, 0);

    return {
      totalArticles,
      totalViews,
      viewsToday: sumSince(sinceDate(1)),
      viewsLast7Days: sumSince(sinceDate(7)),
      viewsLast30Days: sumSince(sinceDate(30)),
      avgViewsPerArticle: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0,
      daily,
    };
  } catch (error) {
    console.error("Get overall stats error:", error);
    return EMPTY_OVERALL;
  }
}

/**
 * Device statistikası (son N gün)
 */
export async function getDeviceStats(days: number = 30): Promise<{ desktop: number; mobile: number; tablet: number }> {
  try {
    const db = getDb();
    if (!db) return { desktop: 0, mobile: 0, tablet: 0 };
    
    const since = sinceDate(days);
    
    const dailyQuery = query(
      collection(db, "analytics_daily"),
      where("date", ">=", since)
    );
    
    const dailyDocs = await getDocs(dailyQuery);
    
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    
    dailyDocs.forEach((doc) => {
      const data = doc.data();
      if (data.devices) {
        desktop += data.devices.desktop || 0;
        mobile += data.devices.mobile || 0;
        tablet += data.devices.tablet || 0;
      }
    });

    return { desktop, mobile, tablet };
  } catch (error) {
    console.error("Get device stats error:", error);
    return { desktop: 0, mobile: 0, tablet: 0 };
  }
}

/**
 * Traffic source statistikası (son N gün)
 */
export async function getSourceStats(days: number = 30): Promise<{
  organic: number;
  social: number;
  direct: number;
  referral: number;
}> {
  try {
    const db = getDb();
    if (!db) return { organic: 0, social: 0, direct: 0, referral: 0 };
    
    const since = sinceDate(days);
    
    const dailyQuery = query(
      collection(db, "analytics_daily"),
      where("date", ">=", since)
    );
    
    const dailyDocs = await getDocs(dailyQuery);
    
    let organic = 0;
    let social = 0;
    let direct = 0;
    let referral = 0;
    
    dailyDocs.forEach((doc) => {
      const data = doc.data();
      if (data.sources) {
        organic += data.sources.organic || 0;
        social += data.sources.social || 0;
        direct += data.sources.direct || 0;
        referral += data.sources.referral || 0;
      }
    });

    return { organic, social, direct, referral };
  } catch (error) {
    console.error("Get source stats error:", error);
    return { organic: 0, social: 0, direct: 0, referral: 0 };
  }
}
