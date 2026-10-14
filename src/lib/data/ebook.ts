import { collection, getDocs, query, where } from "firebase/firestore";

import { getDb } from "@/lib/firebase/client";
import type { EbookBanner } from "@/lib/types";

/**
 * Aktiv e-kitab bannerini oxuyur.
 * Firebase qoşulmayıbsa və ya banner yoxdursa null qaytarır.
 */
export async function getActiveEbookBanner(): Promise<EbookBanner | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const snapshot = await getDocs(
      query(collection(db, "ebookBanners"), where("active", "==", true)),
    );

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      ...(doc.data() as Omit<EbookBanner, "id">),
      id: doc.id,
    };
  } catch (error) {
    console.error("[nesreen] E-kitab banneri oxunmadı:", error);
    return null;
  }
}
