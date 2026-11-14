/**
 * Bülleten göndərmə API — yalnız admin rolu
 * POST /api/admin/send-newsletter
 *   { subject, html, locale, recipients: [{ id, email, token }], test?: boolean }
 *
 * Abunəçi siyahısını admin paneli (Firestore, admin icazəsi ilə) hazırlayır və
 * kiçik hissələrlə göndərir — bir sorğu Vercel vaxt limitinə sığsın deyə.
 * `test: true` olanda məktub yalnız daxil olmuş adminin öz ünvanına gedir.
 *
 * Developed by Cradex Agency · https://cradexagency.com
 */
import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/auth/middleware";
import { sendNewsletterToRecipients } from "@/lib/email/mailer";
import { isNewsletterLocale, type NewsletterRecipient } from "@/lib/newsletter/shared";

export const maxDuration = 60;

/** Bir sorğuda ən çox neçə alıcı (2 məktub/san → ~10 san) */
const MAX_PER_REQUEST = 20;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function isRecipient(value: unknown): value is NewsletterRecipient {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    /^[A-Za-z0-9]{10,64}$/.test(r.id) &&
    typeof r.token === "string" &&
    /^[A-Za-z0-9_-]{20,64}$/.test(r.token) &&
    typeof r.email === "string" &&
    r.email.length < 200 &&
    EMAIL_RE.test(r.email)
  );
}

export async function POST(request: NextRequest) {
  const session = await requireAdminAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Yalnız admin göndərə bilər" }, { status: 401 });
  }

  if (!process.env.SMTP_PASSWORD) {
    return NextResponse.json(
      { error: "SMTP_PASSWORD təyin olunmayıb (Vercel → Environment Variables)" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Yanlış sorğu" }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const html = typeof body.html === "string" ? body.html : "";
  if (!subject || !html.trim()) {
    return NextResponse.json({ error: "Başlıq və məzmun tələb olunur" }, { status: 400 });
  }
  if (html.length > 200_000) {
    return NextResponse.json({ error: "Məzmun çox böyükdür" }, { status: 400 });
  }
  if (!isNewsletterLocale(body.locale)) {
    return NextResponse.json({ error: "Dil seçilməyib" }, { status: 400 });
  }
  const locale = body.locale;

  let recipients: NewsletterRecipient[];
  if (body.test === true) {
    // Test: yalnız adminin özünə; imtina linki işləməyən nümunədir
    recipients = [{ id: "testtesttest", email: session.email, token: "test-test-test-test-test" }];
  } else {
    const list = Array.isArray(body.recipients) ? body.recipients : [];
    if (list.length === 0 || list.length > MAX_PER_REQUEST || !list.every(isRecipient)) {
      return NextResponse.json(
        { error: `Alıcı siyahısı yanlışdır (1–${MAX_PER_REQUEST})` },
        { status: 400 },
      );
    }
    recipients = list;
  }

  try {
    const result = await sendNewsletterToRecipients(recipients, locale, subject, html);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[send-newsletter] Xəta:", error);
    return NextResponse.json({ error: "Bülleten göndərilmədi" }, { status: 500 });
  }
}
