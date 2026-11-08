import { collection, getDocs, query, where } from "firebase/firestore";

import { COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type { Ejournal, PrintEdition } from "@/lib/types";

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
        // Kompozit indeks (status + publishedAt) tələb etməsin deyə sıralama yaddaşda aparılır.
        where("status", "==", "published"),
      ),
    );
    return snapshot.docs
      .map((item) => ({
        ...(item.data() as Omit<Ejournal, "id">),
        id: item.id,
      }))
      .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")));
  } catch (error) {
    console.error("[nesreen] E-jurnal nömrələri oxunmadı:", error);
    return [];
  }
}

/**
 * Saytda satışdakı çap nəşrləri (/jurnallar). Qaydalar anonim oxucuya yalnız
 * dərc olunmuşları açır, ona görə sorğuda status filtri mütləqdir; sıralama
 * yaddaşda edilir (əlavə Firestore indeksi tələb olunmur).
 */
export async function getPrintEditions(): Promise<PrintEdition[]> {
  if (!isFirebaseConfigured) return [];
  const db = getDb();
  if (!db) return [];
  try {
    const snapshot = await getDocs(
      query(collection(db, "printEditions"), where("status", "==", "published")),
    );
    return snapshot.docs
      .map((item) => ({ ...(item.data() as Omit<PrintEdition, "id">), id: item.id }))
      .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
  } catch (error) {
    console.error("[nesreen] Çap nəşrləri oxunmadı:", error);
    return [];
  }
}
