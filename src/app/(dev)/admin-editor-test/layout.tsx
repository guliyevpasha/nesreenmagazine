/**
 * Yalnız lokal test (Playwright) üçün redaktor stendi — production-da 404.
 */
import { notFound } from "next/navigation";

import "@/app/globals.css";

import { fontVariables } from "@/lib/fonts";

export const metadata = { robots: { index: false, follow: false } };

export default function EditorTestLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <html lang="az" dir="ltr" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
