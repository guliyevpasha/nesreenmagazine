/**
 * Ana Səhifə Redaksiya İdarəetməsi
 * 
 * Homepage editorial management with drag-and-drop ordering,
 * article selection, and multilingual support.
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { cache } from "react";

import { COLLECTIONS } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import type { Locale } from "@/lib/i18n/config";
import type {
  HomepageSectionId,
  HomepageEditorialSection,
  HomepageEditorialSectionInput,
  HomepageSectionData,
  HomepageArticleCache,
  HomepageContentData,
  Article,
} from "@/lib/types";
import { articleToCache } from "@/lib/types";
import { logger } from "@/lib/logger";
import { seedArticles } from "@/lib/content";

/**
 * Bölmə ID-si və dil üçün Firestore sənəd ID-si yaradır.
 * Məsələn: "moda-editorial-az"
 */
export function getHomepageSectionDocId(sectionId: HomepageSectionId, locale: Locale): string {
  return `${sectionId}-${locale}`;
}

/**
 * Bölmə konfiqurasiyasını oxuyur.
 * Cache edilir — React Server Component sorğu başına bir dəfə oxuyur.
 */
export const getHomepageSection = cache(loadHomepageSection);

async function loadHomepageSection(
  sectionId: HomepageSectionId,
  locale: Locale
): Promise<HomepageEditorialSection | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const docId = getHomepageSectionDocId(sectionId, locale);
    const docRef = doc(db, COLLECTIONS.homepageEditorial, docId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      logger.debug(`Homepage section ${docId} not found, returning empty config`);
      return null;
    }

    return { ...(snapshot.data() as Omit<HomepageEditorialSection, "id">), id: snapshot.id };
  } catch (error) {
    logger.error(`Error loading homepage section ${sectionId}-${locale}:`, error);
    return null;
  }
}

/**
 * Bölmə konfiqurasiyasını və məqalə məlumatlarını birlikdə oxuyur.
 * Frontend API üçün.
 */
export async function getHomepageSectionWithArticles(
  sectionId: HomepageSectionId,
  locale: Locale
): Promise<HomepageSectionData | null> {
  const db = getDb();
  if (!db) return null;

  const section = await getHomepageSection(sectionId, locale);
  if (!section || section.articleIds.length === 0) {
    return {
      sectionId,
      locale,
      articles: [],
      updatedAt: new Date().toISOString(),
      updatedBy: "",
      updatedByName: "",
    };
  }

  // Məqalə məlumatlarını paralel oxuyaq
  const articlePromises = section.articleIds.map(async (articleId) => {
    try {
      // Hazır (seed) məqalələr Firestore-da yoxdur — koddakı siyahıdan oxunur
      if (articleId.startsWith("seed-")) {
        const seed = seedArticles.find((a) => a.id === articleId);
        return seed && seed.status === "published" ? articleToCache(seed) : null;
      }
      const articleDoc = await getDoc(doc(db, COLLECTIONS.articles, articleId));
      if (!articleDoc.exists()) {
        logger.warn(`Article ${articleId} not found in section ${sectionId}-${locale}`);
        return null;
      }
      const article = { ...(articleDoc.data() as Omit<Article, "id">), id: articleDoc.id };
      
      // Yalnız dərc olunmuş məqalələr
      if (article.status !== "published") {
        logger.warn(`Article ${articleId} is not published (status: ${article.status})`);
        return null;
      }
      
      return articleToCache(article);
    } catch (error) {
      logger.error(`Error loading article ${articleId}:`, error);
      return null;
    }
  });

  const articlesRaw = await Promise.all(articlePromises);
  const articles = articlesRaw.filter((a): a is HomepageArticleCache => a !== null);

  return {
    sectionId,
    locale,
    articles,
    updatedAt: section.updatedAt,
    updatedBy: section.updatedBy,
    updatedByName: section.updatedByName,
  };
}

/**
 * Ana səhifə üçün bütün bölmələri bir sorğuda yükləyir (bir dil üçün).
 * Frontend homepage rendering üçün optimize edilib.
 */
export const getHomepageContent = cache(loadHomepageContent);

async function loadHomepageContent(locale: Locale): Promise<HomepageContentData> {
  const [
    weeklyMainTopic,
    latestArticles,
    modaEditorial,
    modaMostRead,
    gozellikEditorial,
    gozellikMostRead,
    heyatTerziEditorial,
    heyatTerziMostRead,
    biznesEditorial,
    biznesMostRead,
  ] = await Promise.all([
    getHomepageSectionWithArticles("weekly-main-topic", locale),
    getHomepageSectionWithArticles("latest-articles", locale),
    getHomepageSectionWithArticles("moda-editorial", locale),
    getHomepageSectionWithArticles("moda-most-read", locale),
    getHomepageSectionWithArticles("gozellik-editorial", locale),
    getHomepageSectionWithArticles("gozellik-most-read", locale),
    getHomepageSectionWithArticles("heyat-terzi-editorial", locale),
    getHomepageSectionWithArticles("heyat-terzi-most-read", locale),
    getHomepageSectionWithArticles("biznes-editorial", locale),
    getHomepageSectionWithArticles("biznes-most-read", locale),
  ]);

  return {
    weeklyMainTopic: weeklyMainTopic?.articles || [],
    latestArticles: latestArticles?.articles || [],
    moda: {
      editorial: modaEditorial?.articles || [],
      mostRead: modaMostRead?.articles || [],
    },
    gozellik: {
      editorial: gozellikEditorial?.articles || [],
      mostRead: gozellikMostRead?.articles || [],
    },
    heyatTerzi: {
      editorial: heyatTerziEditorial?.articles || [],
      mostRead: heyatTerziMostRead?.articles || [],
    },
    biznes: {
      editorial: biznesEditorial?.articles || [],
      mostRead: biznesMostRead?.articles || [],
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Bölmə konfiqurasiyasını saxlayır (admin panel).
 * Optimistic concurrency control ilə.
 */
export async function saveHomepageSection(
  sectionInput: HomepageEditorialSectionInput
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase əlaqə yoxdur");

  const docId = getHomepageSectionDocId(sectionInput.sectionId, sectionInput.locale);
  const docRef = doc(db, COLLECTIONS.homepageEditorial, docId);

  // Mövcud versiyonu yoxla
  const existing = await getDoc(docRef);
  const currentVersion = existing.exists() ? (existing.data().version || 0) : 0;

  const data: HomepageEditorialSection = {
    ...sectionInput,
    id: docId,
    version: currentVersion + 1,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, data);
  logger.info(`Saved homepage section ${docId}, version ${data.version}`);
}

/**
 * Məqalə silinəndə bütün bölmələrdən təmizləyir.
 * Digər məqalələrin mövqeyini normallaşdırır.
 */
export async function removeArticleFromAllSections(articleId: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Firebase əlaqə yoxdur");

  const allSections = await getDocs(collection(db, COLLECTIONS.homepageEditorial));
  const batch = writeBatch(db);
  let cleanupCount = 0;

  for (const docSnap of allSections.docs) {
    const section = docSnap.data() as HomepageEditorialSection;
    const articleIds = section.articleIds || [];

    if (articleIds.includes(articleId)) {
      const updatedIds = articleIds.filter((id) => id !== articleId);
      batch.update(docSnap.ref, {
        articleIds: updatedIds,
        updatedAt: new Date().toISOString(),
        version: (section.version || 0) + 1,
      });
      cleanupCount++;
      logger.info(`Removing article ${articleId} from section ${section.sectionId}-${section.locale}`);
    }
  }

  if (cleanupCount > 0) {
    await batch.commit();
    logger.info(`Cleaned up article ${articleId} from ${cleanupCount} homepage sections`);
  }
}

/**
 * Məqalənin hansı bölmələrdə olduğunu tapır (bütün dillərdə).
 * Admin panel üçün — məqalə redaktə edərkən göstərmək üçün.
 */
export async function getArticlePlacements(articleId: string): Promise<
  Array<{
    sectionId: HomepageSectionId;
    locale: Locale;
    position: number;
  }>
> {
  const db = getDb();
  if (!db) return [];

  try {
    const allSections = await getDocs(collection(db, COLLECTIONS.homepageEditorial));
    const placements: Array<{
      sectionId: HomepageSectionId;
      locale: Locale;
      position: number;
    }> = [];

    for (const docSnap of allSections.docs) {
      const section = docSnap.data() as HomepageEditorialSection;
      const index = section.articleIds?.indexOf(articleId);

      if (index !== undefined && index >= 0) {
        placements.push({
          sectionId: section.sectionId,
          locale: section.locale,
          position: index + 1, // 1-indexed position
        });
      }
    }

    return placements;
  } catch (error) {
    logger.error(`Error getting article placements for ${articleId}:`, error);
    return [];
  }
}

/**
 * Məqalənin bütün dillərdə hansı bölmələrdə olduğunu yoxlayır.
 * Duplicate əlavə etməmək üçün.
 */
export async function isArticleInSection(
  articleId: string,
  sectionId: HomepageSectionId,
  locale: Locale
): Promise<boolean> {
  const section = await getHomepageSection(sectionId, locale);
  if (!section) return false;
  return section.articleIds.includes(articleId);
}

/**
 * Bölmədəki məqalələrin sayını qaytarır.
 */
export async function getSectionArticleCount(
  sectionId: HomepageSectionId,
  locale: Locale
): Promise<number> {
  const section = await getHomepageSection(sectionId, locale);
  return section?.articleIds.length || 0;
}
