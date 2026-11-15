/**
 * YALNIZ DEV: ana səhifənin astrologiya bölməsinin 1 / 2 / 3 yazı ilə görünüşü.
 * Nümunə yazılar mövcud yazıların surətidir (Firestore-a heç nə yazılmır).
 * Production-da 404 qaytarır.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AstroSection from "@/components/home/AstroSection";
import { getArticlesByCategory } from "@/lib/data/articles";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

const SAMPLE_TITLES = [
  "Nümunə yazı 1 — Taleyin Matrisi: doğum tarixi bizə nə deyir?",
  "Nümunə yazı 2 — Noyabrda Venera: sevgi münasibətlərində nə dəyişəcək?",
  "Nümunə yazı 3 — Tarot kartları ilə həftəyə necə başlamalı?",
];

export default async function AstroDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const [astro, moda, gozellik, gundem] = await Promise.all([
    getArticlesByCategory("astrologiya", 3),
    getArticlesByCategory("moda", 3),
    getArticlesByCategory("gozellik", 3),
    getArticlesByCategory("gundem", 3),
  ]);
  // Şəkilli mövcud yazılardan 3 nümunə düzəldilir
  const pool = [...astro, ...moda, ...gozellik, ...gundem].filter((a) => a.coverImage);
  const samples: Article[] = pool.slice(0, 3).map((a, i) => ({
    ...a,
    id: `demo-${i}`,
    title: { az: SAMPLE_TITLES[i], en: SAMPLE_TITLES[i], ru: SAMPLE_TITLES[i], tr: SAMPLE_TITLES[i], ar: SAMPLE_TITLES[i] },
  }));

  return (
    <>
      {[1, 2, 3].map((n) => (
        <div key={n}>
          <div className="bg-bordo py-3 text-center font-ui text-xs uppercase tracking-[0.2em] text-cream">
            Nümunə: {n} astrologiya yazısı
          </div>
          <AstroSection locale={locale} articles={samples.slice(0, n)} />
        </div>
      ))}
    </>
  );
}
