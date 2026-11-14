/**
 * Bülletendən imtina — POST /api/newsletter/unsubscribe?id=…&t=…
 *
 * İki yerdən çağırılır:
 *   1. Gmail / Outlook «Unsubscribe» düyməsi (RFC 8058 one-click:
 *      `List-Unsubscribe-Post: List-Unsubscribe=One-Click`).
 *   2. Saytdakı imtina səhifəsi (/{locale}/abunelikden-cix), JSON gövdə ilə;
 *      `action: "resubscribe"` göndərilsə abunəlik bərpa olunur.
 *
 * Yalnız düzgün `t` (sənəddəki gizli token) ilə imtina mümkündür — bunu
 * Firestore qaydası yoxlayır (`unsubToken == resource.data.token`).
 * GET qəsdən yoxdur: poçt skanerləri linki açanda abunəçi təsadüfən çıxmasın.
 */
import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";

import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";
import { isNewsletterLocale } from "@/lib/newsletter/shared";
import { getClientIp, publicRateLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const ID_RE = /^[A-Za-z0-9]{10,64}$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{20,64}$/;

export async function POST(request: NextRequest) {
  const { success } = await publicRateLimiter.limit(`unsubscribe:${getClientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Çox sayda sorğu" }, { status: 429 });
  }

  const params = request.nextUrl.searchParams;
  let body: Record<string, unknown> = {};
  if (request.headers.get("content-type")?.includes("application/json")) {
    body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  }

  const id = String(body.id ?? params.get("id") ?? "");
  const token = String(body.t ?? params.get("t") ?? "");
  const action = body.action === "resubscribe" ? "resubscribe" : "unsubscribe";

  if (!ID_RE.test(id) || !TOKEN_RE.test(token)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database əlaqə xətası" }, { status: 500 });
  }
  const ref = doc(db, COLLECTIONS.subscribers, id);
  const now = new Date().toISOString();

  try {
    if (action === "resubscribe") {
      const locale = isNewsletterLocale(body.locale) ? body.locale : "az";
      await updateDoc(ref, { active: true, locale, resubscribedAt: now });
    } else {
      await updateDoc(ref, { active: false, unsubscribedAt: now, unsubToken: token });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Yanlış token və ya mövcud olmayan sənəd → qaydalar rədd edir
    logger.warn("[unsubscribe] rədd edildi:", error);
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
}
