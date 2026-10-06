import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type { Ejournal } from "@/lib/types";

/**
 * E-jurnal nömrələrinin mənbəyi.
 *
 * Nömrələr yalnız Firestore-da saxlanılır — admin paneldən PDF yüklənir.
 * Firebase qoşulmayıbsa (və ya kolleksiya boşdursa) səhifə «tezliklə»
 * görünüşü ilə işləyir, heç nə sınmır.
 */
export async function getPublishedEjournals(): Promise<Ejournal[]> {
  if (!isFirebaseConfigured) return [];

  const db = getDb();
  if (!db) return [];

  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.ejournals),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
      ),
    );
    return snapshot.docs.map((item) => ({
      ...(item.data() as Omit<Ejournal, "id">),
      id: item.id,
    }));
  } catch (error) {
    console.error("[nesreen] E-jurnal nömrələri oxunmadı:", error);
    return [];
  }
}
