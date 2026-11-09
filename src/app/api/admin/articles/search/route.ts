/**
 * API: Məqalə axtarışı (Admin panel üçün)
 * Homepage editorial management-də istifadə olunur
 * 
 * Developed by Cradex Agency
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getFirebaseAdmin } from "@/lib/firebase/admin";
import type { Article } from "@/lib/types";

/**
 * Verify Firebase ID token
 */
async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7);
    const admin = getFirebaseAdmin();
    if (!admin) return false;

    const decodedToken = await getAuth(admin).verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    if (!email) return false;

    // Check if user is staff
    const firestore = getFirestore(admin);
    const staffDoc = await firestore.collection("staff").doc(email).get();
    
    if (!staffDoc.exists) {
      // Check bootstrap admin
      const bootstrapAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      
      return bootstrapAdmins.includes(email);
    }
    
    const staffData = staffDoc.data();
    return staffData?.active === true;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
}

/**
 * GET /api/admin/articles/search
 * Query params: q (search query), category, subcategory, locale, status, limit
 */
export async function GET(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const locale = searchParams.get("locale");
    const status = searchParams.get("status") || "published";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const admin = getFirebaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Firebase admin not initialized" },
        { status: 500 }
      );
    }

    const firestore = getFirestore(admin);
    let articlesQuery = firestore.collection("articles");

    // Filter by status
    articlesQuery = articlesQuery.where("status", "==", status) as any;

    // Filter by category if provided
    if (category) {
      articlesQuery = articlesQuery.where("category", "==", category) as any;
    }

    // Filter by subcategory if provided
    if (subcategory) {
      articlesQuery = articlesQuery.where("subcategory", "==", subcategory) as any;
    }

    // Order by publishedAt descending
    articlesQuery = articlesQuery.orderBy("publishedAt", "desc") as any;

    // Apply limit
    articlesQuery = articlesQuery.limit(limit) as any;

    const snapshot = await articlesQuery.get();
    let articles: Article[] = snapshot.docs.map(doc => ({
      ...(doc.data() as Omit<Article, "id">),
      id: doc.id,
    }));

    // Client-side filtering for search query (Firestore doesn't support full-text search natively)
    if (query) {
      const queryLower = query.toLowerCase();
      articles = articles.filter(article => {
        // Search in title (all locales)
        if (typeof article.title === "object") {
          const titleMatch = Object.values(article.title).some(
            title => title?.toLowerCase().includes(queryLower)
          );
          if (titleMatch) return true;
        }

        // Search in slug (all locales)
        if (typeof article.slug === "object") {
          const slugMatch = Object.values(article.slug).some(
            slug => slug?.toLowerCase().includes(queryLower)
          );
          if (slugMatch) return true;
        } else if (typeof article.slug === "string") {
          if (article.slug.toLowerCase().includes(queryLower)) return true;
        }

        // Search in article ID
        if (article.id.toLowerCase().includes(queryLower)) return true;

        // Search in excerpt (if locale specified)
        if (locale && typeof article.excerpt === "object") {
          const excerpt = article.excerpt[locale as keyof typeof article.excerpt];
          if (excerpt?.toLowerCase().includes(queryLower)) return true;
        }

        return false;
      });
    }

    // Sort by relevance if query provided (title match > slug match > id match)
    if (query) {
      const queryLower = query.toLowerCase();
      articles.sort((a, b) => {
        const aTitle = typeof a.title === "object" 
          ? Object.values(a.title).some(t => t?.toLowerCase().startsWith(queryLower))
          : false;
        const bTitle = typeof b.title === "object"
          ? Object.values(b.title).some(t => t?.toLowerCase().startsWith(queryLower))
          : false;
        
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        
        return 0;
      });
    }

    return NextResponse.json({ articles, count: articles.length });
  } catch (error) {
    console.error("Error searching articles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
