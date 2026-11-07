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
import { logger } from "@/lib/logger";

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
  logger.debug('📖 Fetching published articles from Firestore...');
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.articles),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
    ),
  );
  logger.debug(`✅ Found ${snapshot.docs.length} published articles in Firestore`);
  const articles = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<Article, "id">;
    logger.debug(`  📄 Article: ${doc.id} | status: ${data.status} | publishedAt: ${data.publishedAt}`);
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
    logger.error("Firestore-dan oxumaq alınmadı, seed məzmuna keçilir:", error);
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

/** Məqalənin `slug` sahəsi verilmiş dəyərə uyğundurmu (köhnə string və ya 5 dilli obyekt). */
function matchesSlug(article: Article, slug: string, locale: string): boolean {
  if (typeof article.slug === "string") return article.slug === slug;
  const slugs = article.slug as Record<string, string | undefined> | undefined;
  if (!slugs) return false;
  // Əvvəl həmin dilin slug-ı, sonra digər dillər (linklər AZ slug-a fallback edir)
  return slugs[locale] === slug || Object.values(slugs).includes(slug);
}

function findSeedBySlug(slug: string, locale: string): Article | null {
  return seedArticles.find((article) => matchesSlug(article, slug, locale)) ?? null;
}

/**
 * Saytda göstəriləcək DƏRC OLUNMUŞ məqaləni slug-a görə tapır.
 *
 * Vacib: Firestore qaydaları anonim oxucuya yalnız `status == "published"`
 * sənədləri oxumağa icazə verir. Sorğuda bu filtr olmasa, Firestore bütün
 * sorğunu rədd edir və məqalə «tapılmır» (əvvəlki «Tezliklə» xətası).
 */
export async function getArticleBySlug(slug: string, locale: string = "az"): Promise<Article | null> {
  if (!isFirebaseConfigured) return findSeedBySlug(slug, locale);

  const db = getDb();
  if (!db) return findSeedBySlug(slug, locale);

  const published = collection(db, COLLECTIONS.articles);
  const fields = [`slug.${locale}`, ...["az", "en", "ru", "tr", "ar"].filter((code) => code !== locale).map((code) => `slug.${code}`), "slug"];

  try {
    for (const field of fields) {
      const snapshot = await getDocs(
        query(published, where("status", "==", "published"), where(field, "==", slug)),
      );
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { ...(doc.data() as Omit<Article, "id">), id: doc.id };
      }
    }
    return findSeedBySlug(slug, locale);
  } catch (error) {
    logger.error("Məqalə oxumaq alınmadı, seed-ə baxılır:", error);
    return findSeedBySlug(slug, locale);
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

/** Statik yolların yaradılması üçün bütün slug-lar (hər dil üçün). */
export async function getAllSlugs(): Promise<Array<{locale: string; slug: string; category: string}>> {
  const articles = await getAllArticles();
  const locales = ["az", "en", "ru", "tr", "ar"];
  const slugs: Array<{locale: string; slug: string; category: string}> = [];
  
  for (const article of articles) {
    for (const locale of locales) {
      let slug: string;
      
      // Köhnə format - string slug
      if (typeof article.slug === "string") {
        slug = article.slug;
      } else {
        // Yeni format - LocalizedText slug
        slug = article.slug?.[locale as keyof typeof article.slug] || "";
      }
      
      if (slug) {
        slugs.push({ locale, slug, category: article.category });
      }
    }
  }
  
  return slugs;
}
