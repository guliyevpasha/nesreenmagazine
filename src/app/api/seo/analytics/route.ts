import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const locale = searchParams.get("locale");

    if (!category || !locale) {
      return NextResponse.json(
        { error: "Category və locale parametrləri tələb olunur" },
        { status: 400 }
      );
    }

    // Firestore-dan ən performanslı açar sözlər və etiketləri yüklə
    const [topKeywords, topTags] = await Promise.all([
      fetchTopKeywords(category, locale),
      fetchTopTags(category, locale),
    ]);

    return NextResponse.json({
      topKeywords,
      topTags,
    });
  } catch (error) {
    console.error("SEO Analytics API error:", error);
    return NextResponse.json(
      { error: "Məlumat yüklənmədi", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}

async function fetchTopKeywords(category: string, locale: string) {
  try {
    // articles collection-dan ən çox traffic gətirən açar sözləri tap
    const articlesRef = collection(db, "articles");
    const q = query(
      articlesRef,
      where("category", "==", category),
      where("status", "==", "published"),
      orderBy("stats.views", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const keywordMap: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const keywords = data.seo?.[locale]?.keywords || [];
      const views = data.stats?.views || 0;

      keywords.forEach((keyword: string) => {
        keywordMap[keyword] = (keywordMap[keyword] || 0) + views;
      });
    });

    return Object.entries(keywordMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, traffic]) => ({
        keyword,
        locale,
        traffic,
      }));
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return [];
  }
}

async function fetchTopTags(category: string, locale: string) {
  try {
    const articlesRef = collection(db, "articles");
    const q = query(
      articlesRef,
      where("category", "==", category),
      where("status", "==", "published"),
      orderBy("stats.views", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const tagMap: Record<string, { count: number; totalViews: number }> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const tags = data.tags || [];
      const views = data.stats?.views || 0;

      tags.forEach((tag: string) => {
        if (!tagMap[tag]) {
          tagMap[tag] = { count: 0, totalViews: 0 };
        }
        tagMap[tag].count++;
        tagMap[tag].totalViews += views;
      });
    });

    return Object.entries(tagMap)
      .map(([tag, data]) => ({
        tag,
        locale,
        performance: Math.round((data.totalViews / data.count) / 100), // Ortalama performans
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
