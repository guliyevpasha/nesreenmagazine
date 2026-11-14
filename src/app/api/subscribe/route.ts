/**
 * Bülletenə abunə olma — POST /api/subscribe  { email, locale }
 *
 * Sənəd id-si e-poçtun heşidir, ona görə eyni e-poçt təkrar yazılmır.
 * Artıq varsa (məs. əvvəl imtina edib) qeyd yenidən aktivləşdirilir və
 * dili son istifadə etdiyi dilə yenilənir. Yazma anonim Firestore
 * müştərisi ilə gedir — icazələri `firestore.rules` (subscribers) məhdudlaşdırır.
 */
import { NextRequest, NextResponse } from "next/server";
import { doc, setDoc, updateDoc } from "firebase/firestore";

import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";
import { emailSchema, safeValidate } from "@/lib/validation/schemas";
import {
  isNewsletterLocale,
  newUnsubscribeToken,
  subscriberIdFor,
} from "@/lib/newsletter/shared";
import { getClientIp, publicRateLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

export async function POST(request: NextRequest) {
  const { success } = await publicRateLimiter.limit(`subscribe:${getClientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Çox sayda sorğu" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu" }, { status: 400 });
  }

  const validation = safeValidate(emailSchema, body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const email = validation.data.email;
  const rawLocale = (body as { locale?: unknown }).locale;
  const locale = isNewsletterLocale(rawLocale) ? rawLocale : "az";

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database əlaqə xətası" }, { status: 500 });
  }

  const ref = doc(db, COLLECTIONS.subscribers, await subscriberIdFor(email));
  const now = new Date().toISOString();

  try {
    // Yeni abunəçi
    await setDoc(ref, {
      email,
      locale,
      active: true,
      createdAt: now,
      token: newUnsubscribeToken(),
      source: "website",
    });
    logger.info("[subscribe] yeni abunəçi", locale);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Sənəd artıq var → qaydalar tam yazmanı rədd edir; yenidən aktivləşdir
    if (errorCode(error) !== "permission-denied") {
      logger.error("[subscribe] xəta:", error);
      return NextResponse.json({ error: "Xəta baş verdi" }, { status: 500 });
    }
  }

  try {
    await updateDoc(ref, { active: true, locale, resubscribedAt: now });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[subscribe] yenidən aktivləşdirmə xətası:", error);
    return NextResponse.json({ error: "Xəta baş verdi" }, { status: 500 });
  }
}
