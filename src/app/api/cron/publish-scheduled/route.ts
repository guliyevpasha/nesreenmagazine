/**
 * Cron Job: Planlaşdırılmış Məqalələri Dərc Et
 * 
 * Bu endpoint hər 5-10 dəqiqədə bir çağırılmalıdır (Vercel Cron və ya xarici cron service)
 * Scheduled status-da olan və vaxtı çatan məqalələri published edirik
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/client";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 500 }
      );
    }

    // Security: Cron secret key ilə qoruma
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET_KEY;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();
    const results = {
      publishedArticles: 0,
      activatedAds: 0,
      deactivatedAds: 0,
      errors: [] as string[],
    };

    // 1. Planlaşdırılmış məqalələri tap və dərc et
    try {
      const articlesQuery = query(
        collection(db, "articles"),
        where("status", "==", "scheduled"),
        where("scheduledAt", "<=", now)
      );

      const articlesSnapshot = await getDocs(articlesQuery);
      
      for (const articleDoc of articlesSnapshot.docs) {
        try {
          await updateDoc(doc(db, "articles", articleDoc.id), {
            status: "published",
            publishedAt: now,
            updatedAt: now,
          });
          results.publishedArticles++;
        } catch (error) {
          results.errors.push(`Article ${articleDoc.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    } catch (error) {
      results.errors.push(`Articles query failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // 2. Vaxtı çatan reklamları aktivləşdir
    try {
      const adsToActivateQuery = query(
        collection(db, "advertisements"),
        where("status", "==", "scheduled"),
        where("startsAt", "<=", now)
      );

      const adsToActivateSnapshot = await getDocs(adsToActivateQuery);
      
      for (const adDoc of adsToActivateSnapshot.docs) {
        try {
          await updateDoc(doc(db, "advertisements", adDoc.id), {
            status: "active",
            updatedAt: now,
          });
          results.activatedAds++;
        } catch (error) {
          results.errors.push(`Ad activate ${adDoc.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    } catch (error) {
      results.errors.push(`Ads activate query failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // 3. Müddəti bitmiş reklamları deaktiv et
    try {
      const adsToDeactivateQuery = query(
        collection(db, "advertisements"),
        where("status", "==", "active"),
        where("endsAt", "<=", now)
      );

      const adsToDeactivateSnapshot = await getDocs(adsToDeactivateQuery);
      
      for (const adDoc of adsToDeactivateSnapshot.docs) {
        try {
          await updateDoc(doc(db, "advertisements", adDoc.id), {
            status: "expired",
            updatedAt: now,
          });
          results.deactivatedAds++;
        } catch (error) {
          results.errors.push(`Ad deactivate ${adDoc.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    } catch (error) {
      results.errors.push(`Ads deactivate query failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Log results
    console.log(`[CRON] Scheduled tasks completed:`, {
      timestamp: now,
      ...results,
    });

    return NextResponse.json({
      success: true,
      timestamp: now,
      ...results,
    });
  } catch (error) {
    console.error("[CRON] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST method də dəstəklə (bəzi cron servislər POST istifadə edir)
export async function POST(request: NextRequest) {
  return GET(request);
}
