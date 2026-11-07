/**
 * Cloudinary imzalı yükləmə — yalnız daxil olmuş redaksiya heyəti üçün.
 *
 * Fayl bu serverdən KEÇMİR (Vercel 4.5 MB limiti yoxdur): server yalnız
 * qısamüddətli imza verir, brauzer faylı birbaşa Cloudinary-yə göndərir.
 * Firebase Storage pulsuz (Spark) planda aktiv olmadığı üçün media Cloudinary-dədir.
 */
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { requireStaffAuth } from "@/lib/auth/middleware";

const ALLOWED_FOLDERS = new Set([
  "covers",
  "banners",
  "inline-images",
  "ejournals",
  "ejournal-covers",
  "ebook",
  "media",
]);

export async function POST(request: NextRequest) {
  const session = await requireStaffAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Yükləmə üçün daxil olun." }, { status: 401 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary konfiqurasiya olunmayıb." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { folder?: string };
  const folder = `nesreen/${ALLOWED_FOLDERS.has(body.folder ?? "") ? body.folder : "media"}`;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary imzası: parametrlər əlifba sırası ilə + secret, SHA-1
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, folder, timestamp, signature });
}
