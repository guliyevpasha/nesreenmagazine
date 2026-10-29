import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";

/**
 * Debug endpoint - bütün məqalələri göstərir (status filter olmadan)
 */

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
    }

    // Status filter OLMADAN bütün məqalələri oxu
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.articles),
        orderBy("publishedAt", "desc")
      )
    );

    const articles = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title?.az || data.title,
        status: data.status,
        publishedAt: data.publishedAt,
        category: data.category,
      };
    });

    return NextResponse.json({
      total: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      draft: articles.filter((a) => a.status === "draft").length,
      scheduled: articles.filter((a) => a.status === "scheduled").length,
      articles: articles,
    });
  } catch (error) {
    console.error("Debug articles error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch articles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
