/**
 * Admin: «Bölmə düzülüşü» — brauzer tərəfi (daxil olmuş staff-ın səlahiyyəti ilə).
 * Səlahiyyəti `firestore.rules` yoxlayır: homepageEditorial yazma — admin/editor.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";

import { authorizedFetch } from "@/lib/auth/authorized-fetch";
import { categories, type CategorySlug } from "@/lib/categories";
import { COLLECTIONS } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import { searchPublishedArticles } from "@/lib/data/admin-homepage";
import {
  CATEGORY_LAYOUT_MAX,
  CATEGORY_LAYOUT_SECTION,
  categoryLayoutDocId,
  type CategoryLayoutDoc,
} from "@/lib/data/category-layout";
import { locales } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

function requireDb() {
  const db = getDb();
  if (!db) throw new Error("Firebase əlaqəsi yoxdur");
  return db;
}

export type CategoryLayoutState = {
  /** Bölmənin bütün dərc olunmuş məqalələri (yenidən köhnəyə). */
  articles: Article[];
  /** Sabitlənmiş ID-lər (yalnız hələ də dərcdə olanlar). */
  pinnedIds: string[];
  updatedAt: string;
  updatedByName: string;
};

export async function fetchCategoryLayout(category: CategorySlug): Promise<CategoryLayoutState> {
  const db = requireDb();
  const [snap, articles] = await Promise.all([
    getDoc(doc(db, COLLECTIONS.homepageEditorial, categoryLayoutDocId(category))),
    searchPublishedArticles("", { category, limit: 500 }),
  ]);
  const data = snap.exists() ? (snap.data() as Partial<CategoryLayoutDoc>) : {};
  const available = new Set(articles.map((a) => a.id));
  const pinnedIds = (Array.isArray(data.articleIds) ? data.articleIds : []).filter((id) => available.has(id));
  return {
    articles,
    pinnedIds,
    updatedAt: data.updatedAt ?? "",
    updatedByName: data.updatedByName ?? "",
  };
}

export async function saveCategoryLayout(input: {
  category: CategorySlug;
  articleIds: string[];
  updatedBy: string;
  updatedByName: string;
}): Promise<void> {
  if (input.articleIds.length > CATEGORY_LAYOUT_MAX) {
    throw new Error(`Maksimum ${CATEGORY_LAYOUT_MAX} məqalə sabitlənə bilər`);
  }
  if (new Set(input.articleIds).size !== input.articleIds.length) {
    throw new Error("Eyni məqalə iki dəfə seçilib");
  }
  const db = requireDb();
  const ref = doc(db, COLLECTIONS.homepageEditorial, categoryLayoutDocId(input.category));
  const existing = await getDoc(ref);
  const version = (existing.exists() ? Number(existing.data().version) || 0 : 0) + 1;
  const payload: CategoryLayoutDoc = {
    sectionId: CATEGORY_LAYOUT_SECTION,
    category: input.category,
    articleIds: input.articleIds,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy,
    updatedByName: input.updatedByName,
    version,
  };
  await setDoc(ref, payload);
}

/** Bölmə və alt bölmə səhifələrinin keşini bütün dillərdə təmizləyir. */
export async function revalidateCategoryPages(category: CategorySlug): Promise<boolean> {
  const subs = categories.find((c) => c.slug === category)?.subcategories ?? [];
  const paths = locales.flatMap((locale) => [
    `/${locale}/${category}`,
    ...subs.map((sub) => `/${locale}/${category}/bolme/${sub.slug}`),
  ]);
  try {
    const response = await authorizedFetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
