/**
 * API: Ana səhifə redaksiya idarəetməsi
 * 
 * GET: Bölmə konfiqurasiyasını oxuyur
 * POST: Bölmə konfiqurasiyasını saxlayır
 * 
 * Developed by Cradex Agency
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getFirebaseAdmin } from "@/lib/firebase/admin";
import type {
  HomepageSectionId,
  HomepageEditorialSectionInput,
  Locale,
} from "@/lib/types";
import { homepageSectionLimits } from "@/lib/types";
import { isLocale } from "@/lib/i18n/config";
import {
  getHomepageSectionDocId,
  getHomepageSectionWithArticles,
} from "@/lib/data/homepage-editorial";

/**
 * Verify Firebase ID token and check staff permissions
 */
async function verifyAdmin(request: NextRequest): Promise<{
  uid: string;
  email: string;
  name: string;
} | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const admin = getFirebaseAdmin();
    if (!admin) return null;

    const decodedToken = await getAuth(admin).verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    if (!email) return null;

    // Check if user is in staff collection
    const firestore = getFirestore(admin);
    const staffDoc = await firestore.collection("staff").doc(email).get();
    
    if (!staffDoc.exists) {
      // Check bootstrap admin
      const bootstrapAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      
      if (!bootstrapAdmins.includes(email)) {
        return null;
      }
    } else {
      const staffData = staffDoc.data();
      if (!staffData?.active) return null;
      
      // Only admin and editor roles can manage homepage
      if (!["admin", "editor"].includes(staffData.role)) {
        return null;
      }
    }

    return {
      uid: decodedToken.uid,
      email,
      name: decodedToken.name || email,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * GET /api/admin/homepage-editorial
 * Query params: sectionId, locale
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId") as HomepageSectionId;
    const locale = searchParams.get("locale") as Locale;

    if (!sectionId || !locale) {
      return NextResponse.json(
        { error: "sectionId and locale are required" },
        { status: 400 }
      );
    }

    if (!isLocale(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const data = await getHomepageSectionWithArticles(sectionId, locale);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching homepage section:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/homepage-editorial
 * Body: HomepageEditorialSectionInput
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = body as HomepageEditorialSectionInput;

    // Validation
    if (!input.sectionId || !input.locale || !input.articleIds) {
      return NextResponse.json(
        { error: "sectionId, locale, and articleIds are required" },
        { status: 400 }
      );
    }

    if (!isLocale(input.locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    // Check article count limit
    const limits = homepageSectionLimits[input.sectionId];
    if (!limits) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 });
    }

    if (input.articleIds.length > limits.manage) {
      return NextResponse.json(
        { error: `Maximum ${limits.manage} articles allowed for this section` },
        { status: 400 }
      );
    }

    // Check for duplicates
    const uniqueIds = new Set(input.articleIds);
    if (uniqueIds.size !== input.articleIds.length) {
      return NextResponse.json(
        { error: "Duplicate article IDs are not allowed" },
        { status: 400 }
      );
    }

    // Verify all articles exist and are published
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      return NextResponse.json(
        { error: "Firebase admin not initialized" },
        { status: 500 }
      );
    }

    const firestore = getFirestore(firebaseAdmin);
    const articleChecks = await Promise.all(
      input.articleIds.map(async (articleId) => {
        const articleDoc = await firestore.collection("articles").doc(articleId).get();
        if (!articleDoc.exists) {
          return { id: articleId, error: "Article not found" };
        }
        const article = articleDoc.data();
        if (article?.status !== "published") {
          return { id: articleId, error: "Article is not published" };
        }
        return { id: articleId, error: null };
      })
    );

    const invalidArticles = articleChecks.filter((check) => check.error);
    if (invalidArticles.length > 0) {
      return NextResponse.json(
        {
          error: "Some articles are invalid",
          details: invalidArticles,
        },
        { status: 400 }
      );
    }

    // Save section
    const docId = getHomepageSectionDocId(input.sectionId, input.locale);
    const docRef = firestore.collection("homepageEditorial").doc(docId);
    
    // Get current version for optimistic concurrency
    const existing = await docRef.get();
    const currentVersion = existing.exists ? (existing.data()?.version || 0) : 0;

    const data = {
      ...input,
      updatedBy: admin.uid,
      updatedByName: admin.name,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    await docRef.set(data);

    // Log the change
    const auditLog = {
      sectionId: input.sectionId,
      locale: input.locale,
      action: existing.exists ? "reorder" : "create",
      beforeArticleIds: existing.exists ? (existing.data()?.articleIds || []) : [],
      afterArticleIds: input.articleIds,
      description: `Updated ${input.sectionId} section for ${input.locale}`,
      performedBy: admin.uid,
      performedByName: admin.name,
      performedAt: new Date().toISOString(),
    };

    await firestore.collection("homepageEditorialAudit").add(auditLog);

    return NextResponse.json({ success: true, docId, version: data.version });
  } catch (error) {
    console.error("Error saving homepage section:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
