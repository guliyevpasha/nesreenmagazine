import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type Firestore,
} from "firebase/firestore";

import type { CategorySlug } from "@/lib/categories";
import { seedArticles } from "@/lib/content";
import { COLLECTIONS, isFirebaseConfigured } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type { Article } from "@/lib/types";

/**
 * Məqalələrin mənbəyi.
 *
 * Firebase açarları varsa Firestore-dan, yoxdursa (və ya Firestore cavab
 * vermirsə) `src/lib/content` qovluğundakı hazır məqalələrdən oxuyur.
 * Beləliklə sayt hər halda işləyir.
 */

function sortByDateDesc(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function publishedSeed(): Article[] {
  return sortByDateDesc(seedArticles.filter((article) => article.status === "published"));
}

async function fetchFromFirestore(db: Firestore): Promise<Article[]> {
  console.log('[DEBUG] Fetching articles from Firestore...');
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.articles),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
    ),
  );
  console.log('[DEBUG] Found', snapshot.docs.length, 'published articles');
  const articles = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Article, "id">;
    console.log('[DEBUG] Article:', doc.id, 'status:', data.status, 'publishedAt:', data.publishedAt);
    return { ...data, id: doc.id };
  });
  return articles;
}

/** Dərc olunmuş bütün məqalələr, tarixə görə yenidən köhnəyə. */
export async function getAllArticles(): Promise<Article[]> {
  if (!isFirebaseConfigured) return publishedSeed();

  const db = getDb();
  if (!db) return publishedSeed();

  try {
    const articles = await fetchFromFirestore(db);
    // Firestore boşdursa (məsələn seed hələ yüklənməyibsə) hazır məzmuna qayıdırıq.
    return articles.length > 0 ? articles : publishedSeed();
  } catch (error) {
    console.error("[nesreen] Firestore-dan oxumaq alınmadı, seed məzmuna keçilir:", error);
    return publishedSeed();
  }
}

export async function getArticlesByCategory(
  category: CategorySlug,
  limit?: number,
): Promise<Article[]> {
  const articles = (await getAllArticles()).filter((article) => article.category === category);
  return typeof limit === "number" ? articles.slice(0, limit) : articles;
}

/** Bölmə daxilində seçilmiş alt bölmənin məqalələri. */
export async function getArticlesBySubcategory(
  category: CategorySlug,
  subcategory: string,
  limit?: number,
): Promise<Article[]> {
  const articles = (await getArticlesByCategory(category)).filter(
    (article) => article.subcategory === subcategory,
  );
  return typeof limit === "number" ? articles.slice(0, limit) : articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // Admin paneldən fərqli olaraq, saytda BÜTÜN məqalələri yoxlayırıq
  // (draft, scheduled, published) və sonra səhifədə status yoxlayırıq
  if (!isFirebaseConfigured) {
    return seedArticles.find((article) => article.slug === slug) ?? null;
  }

  const db = getDb();
  if (!db) {
    return seedArticles.find((article) => article.slug === slug) ?? null;
  }

  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.articles),
        where("slug", "==", slug),
      ),
    );
    
    if (snapshot.empty) {
      // Firestore-da yoxdursa seed-də yoxlayırıq
      return seedArticles.find((article) => article.slug === slug) ?? null;
    }
    
    const doc = snapshot.docs[0];
    return { ...(doc.data() as Omit<Article, "id">), id: doc.id };
  } catch (error) {
    console.error("[nesreen] Məqalə oxumaq alınmadı, seed-ə baxılır:", error);
    return seedArticles.find((article) => article.slug === slug) ?? null;
  }
}

/** Ana səhifədəki böyük "kapak" məqaləsi. */
export async function getFeaturedArticle(): Promise<Article | null> {
  const articles = await getAllArticles();
  return articles.find((article) => article.featured) ?? articles[0] ?? null;
}

export async function getTrendingArticles(limit = 4): Promise<Article[]> {
  const articles = await getAllArticles();
  const trending = articles.filter((article) => article.trending);
  const rest = articles.filter((article) => !article.trending);
  return [...trending, ...rest].slice(0, limit);
}

/** Eyni bölmədən, sonra digər bölmələrdən oxşar məqalələr. */
export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const articles = (await getAllArticles()).filter((item) => item.id !== article.id);
  const sameCategory = articles.filter((item) => item.category === article.category);
  const others = articles.filter((item) => item.category !== article.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/** Statik yolların yaradılması üçün bütün slug-lar. */
export async function getAllSlugs(): Promise<string[]> {
  return (await getAllArticles()).map((article) => article.slug);
}
