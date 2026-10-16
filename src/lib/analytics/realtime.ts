/**
 * Real-time Analytics
 * Firebase onSnapshot ilə real-time data updates
 */

import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";
import type { PageView } from "@/lib/types";

/**
 * Real-time aktiv istifadəçiləri dinləyir (son 5 dəqiqə).
 */
export function subscribeToRealtimeUsers(
  callback: (activeUsers: number, recentViews: PageView[]) => void
): () => void {
  const db = getDb();
  if (!db) {
    console.warn("[Analytics] Firebase not configured");
    return () => {};
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const q = query(
    collection(db, COLLECTIONS.pageViews),
    where("viewedAt", ">=", fiveMinutesAgo),
    orderBy("viewedAt", "desc"),
    limit(50)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const views: PageView[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PageView, "id">),
      }));

      // Unikal session sayı
      const uniqueSessions = new Set(views.map((v) => v.sessionId));
      const activeUsers = uniqueSessions.size;

      callback(activeUsers, views);
    },
    (error) => {
      console.error("[Analytics] Real-time subscription error:", error);
    }
  );

  return unsubscribe;
}

/**
 * Real-time məqalə baxışlarını dinləyir.
 */
export function subscribeToArticleViews(
  articleId: string,
  callback: (views: PageView[]) => void
): () => void {
  const db = getDb();
  if (!db) return () => {};

  const q = query(
    collection(db, COLLECTIONS.pageViews),
    where("articleId", "==", articleId),
    orderBy("viewedAt", "desc"),
    limit(100)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const views: PageView[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PageView, "id">),
      }));
      callback(views);
    },
    (error) => {
      console.error("[Analytics] Article views subscription error:", error);
    }
  );

  return unsubscribe;
}
