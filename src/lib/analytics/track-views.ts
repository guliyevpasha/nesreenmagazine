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
  visitorId?: string
): Promise<void> {
  try {
    const db = getDb();
    if (!db) {
      console.warn("Firebase not configured, skipping analytics");
      return;
    }
    
    const today = new Date().toISOString().slice(0, 10);
    
    // Günlük statistika
    const dailyRef = doc(db, "analytics_daily", `${articleId}_${today}`);
    await setDoc(
      dailyRef,
      {
        articleId,
        slug,
        category,
        date: today,
        views: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Ümumi statistika
    const totalRef = doc(db, "analytics_totals", articleId);
    await setDoc(
      totalRef,
      {
        articleId,
        slug,
        category,
        totalViews: increment(1),
        lastViewed: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Unikal ziyarətçi tracking (opsional)
    if (visitorId) {
      const visitorRef = doc(db, "analytics_visitors", `${articleId}_${visitorId}_${today}`);
      const visitorDoc = await getDoc(visitorRef);
      
      if (!visitorDoc.exists()) {
        await setDoc(visitorRef, {
          articleId,
          visitorId,
          date: today,
          timestamp: new Date().toISOString(),
        });

        // Unikal ziyarətçi sayını artır
        await setDoc(
          dailyRef,
          { uniqueVisitors: increment(1) },
          { merge: true }
        );
      }
    }
  } catch (error) {
    console.error("View tracking error:", error);
    // Xəta olsa belə, səhifə yüklənməni bloklamasın
  }
}

/**
 * Məqalə üzrə statistika
 */
export async function getArticleViews(articleId: string): Promise<ArticleViews> {
  try {
    const db = getDb();
    if (!db) {
      return {
        articleId,
        totalViews: 0,
        last7Days: 0,
        last30Days: 0,
        lastViewed: "",
      };
    }
    
    const totalRef = doc(db, "analytics_totals", articleId);
    const totalDoc = await getDoc(totalRef);

    if (!totalDoc.exists()) {
      return {
        articleId,
        totalViews: 0,
        last7Days: 0,
        last30Days: 0,
        lastViewed: "",
      };
    }

    const data = totalDoc.data();
    const today = new Date();
    
    // Son 7 gün
    const date7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const dailyQuery7 = query(
      collection(db, "analytics_daily"),
      where("articleId", "==", articleId),
      where("date", ">=", date7)
    );
    const daily7Docs = await getDocs(dailyQuery7);
    const last7Days = daily7Docs.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);

    // Son 30 gün
    const date30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const dailyQuery30 = query(
      collection(db, "analytics_daily"),
      where("articleId", "==", articleId),
      where("date", ">=", date30)
    );
    const daily30Docs = await getDocs(dailyQuery30);
    const last30Days = daily30Docs.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);

    return {
      articleId,
      totalViews: data.totalViews || 0,
      last7Days,
      last30Days,
      lastViewed: data.lastViewed || "",
    };
  } catch (error) {
    console.error("Get views error:", error);
    return {
      articleId,
      totalViews: 0,
      last7Days: 0,
      last30Days: 0,
      lastViewed: "",
    };
  }
}

/**
 * Ən çox baxılan məqalələr
 */
export async function getTopArticles(days: number = 30, limitCount: number = 10): Promise<ArticleViews[]> {
  try {
    const db = getDb();
    if (!db) return [];
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
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
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
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
    
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    
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
}

export async function getOverallStats(): Promise<OverallStats> {
  try {
    const db = getDb();
    if (!db) {
      return {
        totalArticles: 0,
        totalViews: 0,
        viewsToday: 0,
        viewsLast7Days: 0,
        viewsLast30Days: 0,
        avgViewsPerArticle: 0,
      };
    }
    
    const totalsQuery = query(collection(db, "analytics_totals"));
    const totalsDocs = await getDocs(totalsQuery);
    
    const totalArticles = totalsDocs.size;
    const totalViews = totalsDocs.docs.reduce((sum, doc) => sum + (doc.data().totalViews || 0), 0);
    
    const today = new Date().toISOString().slice(0, 10);
    const todayQuery = query(
      collection(db, "analytics_daily"),
      where("date", "==", today)
    );
    const todayDocs = await getDocs(todayQuery);
    const viewsToday = todayDocs.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
    
    const date7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const query7 = query(
      collection(db, "analytics_daily"),
      where("date", ">=", date7)
    );
    const docs7 = await getDocs(query7);
    const viewsLast7Days = docs7.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
    
    const date30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const query30 = query(
      collection(db, "analytics_daily"),
      where("date", ">=", date30)
    );
    const docs30 = await getDocs(query30);
    const viewsLast30Days = docs30.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
    
    return {
      totalArticles,
      totalViews,
      viewsToday,
      viewsLast7Days,
      viewsLast30Days,
      avgViewsPerArticle: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0,
    };
  } catch (error) {
    console.error("Get overall stats error:", error);
    return {
      totalArticles: 0,
      totalViews: 0,
      viewsToday: 0,
      viewsLast7Days: 0,
      viewsLast30Days: 0,
      avgViewsPerArticle: 0,
    };
  }
}
