/**
 * Admin panel üçün ana səhifə redaksiya idarəetməsi (brauzer tərəfi).
 *
 * Developed by Cradex Agency
 *
 * Firestore-a birbaşa brauzer SDK-sı ilə (daxil olmuş staff-ın səlahiyyəti
 * ilə) müraciət edir. Əvvəlki API route-lar `firebase-admin` + service
 * account tələb edirdi; Vercel-də o açar olmadığı üçün hər sorğu 401 qaytarır
 * və «Məlumatlar yüklənmədi» görünürdü. Səlahiyyəti `firestore.rules` yoxlayır
 * (homepageEditorial yazma: admin/editor).
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type {
  HomepageSectionId,
  HomepageSectionData,
  HomepageEditorialSection,
  HomepageEditorialSectionInput,
  HomepageArticleCache,
  Locale,
  Article,
} from "@/lib/types";
import { articleToCache, homepageSectionLimits } from "@/lib/types";
import { authorizedFetch } from "@/lib/auth/authorized-fetch";

function requireDb(): Firestore {
  const db = getDb();
  if (!db) throw new Error("Firebase əlaqəsi yoxdur");
  return db;
}

const sectionDocId = (sectionId: HomepageSectionId, locale: Locale) => `${sectionId}-${locale}`;

async function seedList(): Promise<Article[]> {
  const { seedArticles } = await import("@/lib/content");
  return seedArticles.filter((a) => a.status === "published");
}

/** Bir məqaləni ID ilə oxuyur (Firestore və ya hazır seed); yalnız dərc olunmuş. */
async function loadPublishedArticle(db: Firestore, id: string): Promise<Article | null> {
  if (id.startsWith("seed-")) {
    return (await seedList()).find((a) => a.id === id) ?? null;
  }
  const snap = await getDoc(doc(db, COLLECTIONS.articles, id));
  if (!snap.exists()) return null;
  const article = { ...(snap.data() as Omit<Article, "id">), id: snap.id };
  return article.status === "published" ? article : null;
}

/**
 * Bütün dərc olunmuş məqalələr: Firestore + Firestore-da olmayan hazır (seed)
 * məqalələr — admin «Məqalələr» siyahısı ilə eyni mənbə.
 */
async function loadAllPublished(db: Firestore): Promise<Article[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.articles), where("status", "==", "published")),
  );
  const firestoreArticles = snapshot.docs.map(
    (d) => ({ ...(d.data() as Omit<Article, "id">), id: d.id }) as Article,
  );
  const slugs = new Set(
    firestoreArticles.flatMap((a) =>
      typeof a.slug === "string" ? [a.slug] : Object.values(a.slug ?? {}),
    ),
  );
  const ids = new Set(firestoreArticles.map((a) => a.id));
  const seeds = (await seedList()).filter((a) => {
    if (ids.has(a.id) || ids.has(a.id.replace(/^seed-/, ""))) return false;
    const s = a.slug as unknown;
    if (typeof s === "string") return !slugs.has(s);
    return !Object.values(s as Record<string, string>).some((v) => slugs.has(v));
  });
  return [...firestoreArticles, ...seeds].sort((a, b) =>
    String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")),
  );
}

/** Bölmə konfiqurasiyasını və məqalələri yükləyir. Sənəd yoxdursa boş bölmə. */
export async function fetchHomepageSection(
  sectionId: HomepageSectionId,
  locale: Locale,
): Promise<HomepageSectionData> {
  const db = requireDb();
  const snap = await getDoc(doc(db, COLLECTIONS.homepageEditorial, sectionDocId(sectionId, locale)));
  const section = snap.exists() ? (snap.data() as HomepageEditorialSection) : null;
  const ids = Array.isArray(section?.articleIds) ? section.articleIds : [];

  const loaded = await Promise.all(
    ids.map((id) => loadPublishedArticle(db, id).catch(() => null)),
  );
  const articles = loaded
    .filter((a): a is Article => a !== null)
    .map((a) => articleToCache(a) as HomepageArticleCache);

  return {
    sectionId,
    locale,
    articles,
    updatedAt: section?.updatedAt ?? "",
    updatedBy: section?.updatedBy ?? "",
    updatedByName: section?.updatedByName ?? "",
  };
}

/** Bölmə konfiqurasiyasını saxlayır (validasiya + audit qeydi). */
export async function saveHomepageSection(
  input: HomepageEditorialSectionInput,
): Promise<{ success: boolean; version: number }> {
  const db = requireDb();
  const limits = homepageSectionLimits[input.sectionId];
  if (!limits) throw new Error("Yanlış bölmə");
  if (input.articleIds.length > limits.manage) {
    throw new Error(`Maksimum ${limits.manage} məqalə seçilə bilər`);
  }
  if (new Set(input.articleIds).size !== input.articleIds.length) {
    throw new Error("Eyni məqalə iki dəfə seçilib");
  }

  const checks = await Promise.all(input.articleIds.map((id) => loadPublishedArticle(db, id)));
  const invalid = input.articleIds.filter((_, i) => !checks[i]);
  if (invalid.length > 0) {
    throw new Error(`Dərc olunmamış və ya tapılmayan məqalə: ${invalid.join(", ")}`);
  }

  const id = sectionDocId(input.sectionId, input.locale);
  const ref = doc(db, COLLECTIONS.homepageEditorial, id);
  const existing = await getDoc(ref);
  const before = existing.exists() ? ((existing.data().articleIds as string[]) ?? []) : [];
  const version = (existing.exists() ? Number(existing.data().version) || 0 : 0) + 1;
  const updatedAt = new Date().toISOString();

  await setDoc(ref, {
    sectionId: input.sectionId,
    locale: input.locale,
    articleIds: input.articleIds,
    updatedBy: input.updatedBy,
    updatedByName: input.updatedByName,
    updatedAt,
    version,
  });

  // Audit loqu — alınmasa saxlamanı pozmasın
  try {
    await addDoc(collection(db, COLLECTIONS.homepageEditorialAudit), {
      sectionId: input.sectionId,
      locale: input.locale,
      action: existing.exists() ? "reorder" : "create",
      beforeArticleIds: before,
      afterArticleIds: input.articleIds,
      description: `Updated ${input.sectionId} section for ${input.locale}`,
      performedBy: input.updatedBy,
      performedByName: input.updatedByName,
      performedAt: updatedAt,
    });
  } catch (error) {
    console.warn("Audit qeydi yazılmadı:", error);
  }

  return { success: true, version };
}

/** Dərc olunmuş məqalələrdə axtarış (başlıq, slug, ID). Boş sorğu = hamısı. */
export async function searchPublishedArticles(
  searchQuery: string,
  options?: {
    category?: string;
    subcategory?: string;
    locale?: Locale;
    limit?: number;
  },
): Promise<Article[]> {
  const db = requireDb();
  let articles = await loadAllPublished(db);

  if (options?.category) articles = articles.filter((a) => a.category === options.category);
  if (options?.subcategory) articles = articles.filter((a) => a.subcategory === options.subcategory);

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    const texts = (v: unknown): string[] =>
      typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).map(String) : [];
    articles = articles.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        [...texts(a.title), ...texts(a.slug), ...texts(a.excerpt)].some((t) =>
          t.toLowerCase().includes(q),
        ),
    );
  }

  return articles.slice(0, options?.limit ?? 200);
}

/** Məqalənin hansı ana səhifə bölmələrində olduğunu qaytarır. */
export async function getArticleHomepagePlacements(
  articleId: string,
): Promise<Array<{ sectionId: HomepageSectionId; locale: Locale; position: number }>> {
  try {
    const db = requireDb();
    const snapshot = await getDocs(collection(db, COLLECTIONS.homepageEditorial));
    return snapshot.docs.flatMap((d) => {
      const s = d.data() as HomepageEditorialSection;
      const index = Array.isArray(s.articleIds) ? s.articleIds.indexOf(articleId) : -1;
      return index >= 0 ? [{ sectionId: s.sectionId, locale: s.locale, position: index + 1 }] : [];
    });
  } catch (error) {
    console.error("Error fetching article placements:", error);
    return [];
  }
}

/** Ana səhifə cache-ini təmizləyir (yenilənmə zamanı). */
export async function revalidateHomepageCache(locale?: Locale): Promise<boolean> {
  try {
    const paths = locale ? [`/${locale}`] : ["az", "en", "ru", "tr", "ar"].map((l) => `/${l}`);
    const response = await authorizedFetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error revalidating homepage cache:", error);
    return false;
  }
}

/** Məqalə redaktorunda göstərilən ana səhifə bölmələri (Ana Səhifə İdarəsi ilə eyni sıra). */
export const HOMEPAGE_SECTION_OPTIONS: Array<{ id: HomepageSectionId; hint: string; icon: string }> = [
  { id: "weekly-main-topic", hint: "Ən üst karusel", icon: "⭐" },
  { id: "latest-articles", hint: "Yeni məqalələr lenti", icon: "🆕" },
  { id: "moda-editorial", hint: "Sol tərəf", icon: "👗" },
  { id: "moda-most-read", hint: "Sağ tərəf", icon: "📊" },
  { id: "gozellik-editorial", hint: "Sol tərəf", icon: "💄" },
  { id: "gozellik-most-read", hint: "Sağ tərəf", icon: "📊" },
  { id: "heyat-terzi-editorial", hint: "Sol tərəf", icon: "🌟" },
  { id: "heyat-terzi-most-read", hint: "Sağ tərəf", icon: "📊" },
  { id: "biznes-editorial", hint: "Sol tərəf", icon: "💼" },
  { id: "biznes-most-read", hint: "Sağ tərəf", icon: "📊" },
];

const ALL_LOCALES: Locale[] = ["az", "en", "ru", "tr", "ar"];

/**
 * Məqalə redaktorundan: məqaləni seçilmiş bölmələrə (bütün 5 dildə) əlavə edir,
 * seçimi götürülmüş bölmələrdən çıxarır. Yeni əlavə olunan məqalə bölmənin
 * əvvəlinə düşür; bölmə limiti aşılarsa sonuncu məqalə çıxır.
 * Yalnız dərc olunmuş məqalə üçün çağırılmalıdır (rules: admin/editor).
 */
export async function syncArticleHomepageSections(
  articleId: string,
  selected: HomepageSectionId[],
  by: { email: string; name: string },
): Promise<{ added: number; removed: number }> {
  const db = requireDb();
  const wanted = new Set(selected);
  let added = 0;
  let removed = 0;

  for (const option of HOMEPAGE_SECTION_OPTIONS) {
    for (const locale of ALL_LOCALES) {
      const ref = doc(db, COLLECTIONS.homepageEditorial, sectionDocId(option.id, locale));
      const snap = await getDoc(ref);
      const before: string[] =
        snap.exists() && Array.isArray(snap.data().articleIds) ? (snap.data().articleIds as string[]) : [];
      const has = before.includes(articleId);
      const want = wanted.has(option.id);
      if (has === want) continue;

      const after = want
        ? [articleId, ...before].slice(0, homepageSectionLimits[option.id].manage)
        : before.filter((id) => id !== articleId);
      if (want) added += 1;
      else removed += 1;

      const updatedAt = new Date().toISOString();
      await setDoc(ref, {
        sectionId: option.id,
        locale,
        articleIds: after,
        updatedBy: by.email,
        updatedByName: by.name,
        updatedAt,
        version: (snap.exists() ? Number(snap.data().version) || 0 : 0) + 1,
      });
      try {
        await addDoc(collection(db, COLLECTIONS.homepageEditorialAudit), {
          sectionId: option.id,
          locale,
          action: want ? "add" : "remove",
          beforeArticleIds: before,
          afterArticleIds: after,
          description: `Article editor: ${want ? "added" : "removed"} ${articleId}`,
          performedBy: by.email,
          performedByName: by.name,
          performedAt: updatedAt,
        });
      } catch (error) {
        console.warn("Audit qeydi yazılmadı:", error);
      }
    }
  }

  return { added, removed };
}
