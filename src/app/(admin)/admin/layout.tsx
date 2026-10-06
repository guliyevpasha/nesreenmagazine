/**
 * Nesreen Magazine — redaksiya idarə paneli.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 */
import type { Metadata } from "next";
import { Suspense } from "react";

import "@/app/globals.css";

import AdminShell from "@/components/admin/AdminShell";
import { AuthProvider } from "@/lib/firebase/auth";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "İdarə paneli · Nesreen Magazine",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" dir="ltr" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-screen bg-cream">
        <AuthProvider>
          <Suspense fallback={null}>
            <AdminShell>{children}</AdminShell>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
