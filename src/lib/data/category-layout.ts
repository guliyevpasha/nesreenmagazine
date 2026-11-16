import { doc, getDoc } from "firebase/firestore";
import { cache } from "react";

import type { CategorySlug } from "@/lib/categories";
import { COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type { Article } from "@/lib/types";
import { logger } from "@/lib/logger";

/**
 * Bölmə səhifəsinin düzülüşü (admin: «Bölmə düzülüşü»).
 *
 * Admin hər bölmə üçün ilk yerlərə (böyük kartlar, üz qabığı və s.) hansı
 * məqalələrin hansı sırada düşəcəyini seçir. Qalan yerləri ən yeni məqalələr
 * avtomatik tutur — yeni dərc olunan yazı yenə də öz-özünə görünür.
 *
 * Saxlama: mövcud `homepageEditorial` kolleksiyası (oxuma hamıya açıq,
 * yazma admin/redaktor — əlavə Firestore qaydası tələb etmir),
 * sənəd `category-layout-{bölmə}`, bütün dillər üçün bir sıra.
 */

export const CATEGORY_LAYOUT_SECTION = "category-layout";
export const CATEGORY_LAYOUT_MAX = 10;

export function categoryLayoutDocId(category: CategorySlug): string {
  return `${CATEGORY_LAYOUT_SECTION}-${category}`;
}

export type CategoryLayoutDoc = {
  sectionId: typeof CATEGORY_LAYOUT_SECTION;
  category: CategorySlug;
  articleIds: string[];
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
  version: number;
};

/** Bölmənin sabitlənmiş məqalə ID-ləri (sorğu başına bir dəfə oxunur). */
export const getCategoryPinnedIds = cache(async (category: CategorySlug): Promise<string[]> => {
  if (!isFirebaseConfigured) return [];
  const db = getDb();
  if (!db) return [];
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.homepageEditorial, categoryLayoutDocId(category)));
    const ids = snap.exists() ? (snap.data() as Partial<CategoryLayoutDoc>).articleIds : [];
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch (error) {
    logger.error(`Bölmə düzülüşü oxunmadı (${category}):`, error);
    return [];
  }
});

/**
 * Sabitlənmiş məqalələri əvvələ çəkir (admin sırası ilə), qalanları olduğu
 * kimi (tarixə görə) saxlayır. Siyahıda olmayan ID-lər (silinmiş, dərcdən
 * çıxarılmış, başqa alt bölmə) sadəcə atlanır.
 */
export function applyPinnedOrder(articles: Article[], pinnedIds: string[]): Article[] {
  if (pinnedIds.length === 0) return articles;
  const byId = new Map(articles.map((article) => [article.id, article]));
  const pinned = pinnedIds.map((id) => byId.get(id)).filter((a): a is Article => Boolean(a));
  const pinnedSet = new Set(pinned.map((a) => a.id));
  return [...pinned, ...articles.filter((article) => !pinnedSet.has(article.id))];
}
