/**
 * Cron: planlaşdırılmış məqalələri dərc edir, reklamları aktivləşdirir/bitirir.
 *
 * Vercel Cron (vercel.json) bu endpoint-i `Authorization: Bearer $CRON_SECRET`
 * ilə çağırır. Yazma əməliyyatları Firebase Admin SDK ilə edilir, çünki
 * serverdə daxil olmuş istifadəçi yoxdur və Firestore qaydaları anonim
 * yazmanı bloklayır. Bunun üçün Vercel-də FIREBASE_SERVICE_ACCOUNT_KEY
 * (service account JSON) təyin olunmalıdır.
 */

import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

import { requireAdminAuth } from "@/lib/auth/middleware";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

const LOCALES = ["az", "en", "ru", "tr", "ar"] as const;

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Vercel Cron "CRON_SECRET" göndərir; köhnə ad "CRON_SECRET_KEY" də qəbul olunur.
  // Secret təyin olunmayıbsa endpoint bağlıdır.
  const secret = process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;
  if (secret && request.headers.get("authorization") === `Bearer ${secret}`) return true;
  // Admin paneldən «İndi işə sal» düyməsi — admin Firebase tokeni ilə
  return Boolean(await requireAdminAuth(request));
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminApp = getFirebaseAdmin();
  if (!adminApp) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT_KEY təyin olunmayıb — planlaşdırılmış dərc işləyə bilməz." },
      { status: 503 },
    );
  }

  const db = getFirestore(adminApp);
  const now = new Date().toISOString();
  const results = {
    publishedArticles: 0,
    activatedAds: 0,
    deactivatedAds: 0,
    errors: [] as string[],
  };

  // 1. Vaxtı çatan məqalələr
  try {
    const due = await db
      .collection("articles")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .get();

    for (const article of due.docs) {
      try {
        await article.ref.update({ status: "published", publishedAt: now, updatedAt: now });
        results.publishedArticles++;

        const data = article.data() as { category?: string; slug?: string | Record<string, string> };
        if (data.category) {
          for (const locale of LOCALES) {
            const slug = typeof data.slug === "string" ? data.slug : data.slug?.[locale] || data.slug?.az;
            revalidatePath(`/${locale}`);
            revalidatePath(`/${locale}/${data.category}`);
            if (slug) revalidatePath(`/${locale}/${data.category}/${slug}`);
          }
        }
      } catch (error) {
        results.errors.push(`Article ${article.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    results.errors.push(`Articles query: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. Başlama vaxtı çatan reklamlar
  try {
    const toActivate = await db
      .collection("advertisements")
      .where("status", "==", "scheduled")
      .where("startsAt", "<=", now)
      .get();
    for (const ad of toActivate.docs) {
      try {
        await ad.ref.update({ status: "active", updatedAt: now });
        results.activatedAds++;
      } catch (error) {
        results.errors.push(`Ad activate ${ad.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    results.errors.push(`Ads activate query: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 3. Müddəti bitən reklamlar
  try {
    const toExpire = await db
      .collection("advertisements")
      .where("status", "==", "active")
      .where("endsAt", "<=", now)
      .get();
    for (const ad of toExpire.docs) {
      try {
        await ad.ref.update({ status: "expired", updatedAt: now });
        results.deactivatedAds++;
      } catch (error) {
        results.errors.push(`Ad deactivate ${ad.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    results.errors.push(`Ads deactivate query: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log("[CRON] Scheduled tasks completed:", { timestamp: now, ...results });
  return NextResponse.json({ success: results.errors.length === 0, timestamp: now, ...results });
}

// Bəzi xarici cron servisləri POST istifadə edir
export async function POST(request: NextRequest) {
  return GET(request);
}
