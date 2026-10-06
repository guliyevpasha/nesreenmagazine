import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";

export interface LocalizedText {
  az: string;
  en: string;
  ru: string;
  tr: string;
  ar: string;
}

export interface Article {
  id?: string;
  slug: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  coverImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
    storagePath?: string;
  };
  category: string;
  subcategory: string | null;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  publishedAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  status: "draft" | "published" | "scheduled";
  featured: {
    isHero: boolean;
    isTrending: boolean;
    isFeatured: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  views: number;
  readingTime: number;
}

const articlesCollection = collection(db, "articles");

/**
 * Get all articles
 */
export async function getAllArticles(): Promise<Article[]> {
  const snapshot = await getDocs(
    query(articlesCollection, orderBy("publishedAt", "desc"))
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

/**
 * Get article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Article;
  }
  
  return null;
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  category: string,
  maxResults?: number
): Promise<Article[]> {
  const constraints: QueryConstraint[] = [
    where("category", "==", category),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
  ];
  
  if (maxResults) {
    constraints.push(limit(maxResults));
  }
  
  const snapshot = await getDocs(query(articlesCollection, ...constraints));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

/**
 * Get featured articles (Hero carousel)
 */
export async function getHeroArticles(maxResults = 6): Promise<Article[]> {
  const snapshot = await getDocs(
    query(
      articlesCollection,
      where("featured.isHero", "==", true),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(maxResults)
    )
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

/**
 * Get trending articles
 */
export async function getTrendingArticles(maxResults = 5): Promise<Article[]> {
  const snapshot = await getDocs(
    query(
      articlesCollection,
      where("featured.isTrending", "==", true),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(maxResults)
    )
  );
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

/**
 * Create new article
 */
export async function createArticle(article: Omit<Article, "id">): Promise<string> {
  const publishedAt = article.publishedAt instanceof Date 
    ? Timestamp.fromDate(article.publishedAt)
    : article.publishedAt;
    
  const docRef = await addDoc(articlesCollection, {
    ...article,
    publishedAt,
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

/**
 * Update article
 */
export async function updateArticle(id: string, article: Partial<Article>): Promise<void> {
  const docRef = doc(db, "articles", id);
  await updateDoc(docRef, {
    ...article,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete article
 */
export async function deleteArticle(id: string): Promise<void> {
  const docRef = doc(db, "articles", id);
  await deleteDoc(docRef);
}

/**
 * Duplicate article
 */
export async function duplicateArticle(id: string): Promise<string> {
  const article = await getArticleById(id);
  
  if (!article) {
    throw new Error("Article not found");
  }
  
  const { id: _, publishedAt, updatedAt, ...articleData } = article;
  
  // Convert Timestamp to Date if needed
  const pubDate = publishedAt instanceof Timestamp ? publishedAt.toDate() : publishedAt;
  
  // Update title to indicate it's a copy
  const newArticle: Omit<Article, "id"> = {
    ...articleData,
    title: {
      az: `${articleData.title.az} (Kopya)`,
      en: `${articleData.title.en} (Copy)`,
      ru: `${articleData.title.ru} (Копия)`,
      tr: `${articleData.title.tr} (Kopya)`,
      ar: `${articleData.title.ar} (نسخة)`,
    },
    slug: {
      az: `${articleData.slug.az}-copy`,
      en: `${articleData.slug.en}-copy`,
      ru: `${articleData.slug.ru}-copy`,
      tr: `${articleData.slug.tr}-copy`,
      ar: `${articleData.slug.ar}-copy`,
    },
    status: "draft",
    publishedAt: new Date(),
    updatedAt: new Date(),
    views: 0,
  };
  
  return await createArticle(newArticle);
}

/**
 * Increment article views
 */
export async function incrementArticleViews(id: string): Promise<void> {
  const docRef = doc(db, "articles", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentViews = docSnap.data().views || 0;
    await updateDoc(docRef, { views: currentViews + 1 });
  }
}
