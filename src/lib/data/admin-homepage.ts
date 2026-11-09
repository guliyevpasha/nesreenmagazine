/**
 * Admin panel üçün ana səhifə redaksiya idarəetməsi
 * Client-side (admin panel) üçün fetch funksiyaları
 * 
 * Developed by Cradex Agency
 */

import type {
  HomepageSectionId,
  HomepageSectionData,
  HomepageEditorialSectionInput,
  Locale,
  Article,
} from "@/lib/types";
import { authorizedFetch } from "@/lib/auth/authorized-fetch";

/**
 * Bölmə konfiqurasiyasını və məqalələri yükləyir
 */
export async function fetchHomepageSection(
  sectionId: HomepageSectionId,
  locale: Locale
): Promise<HomepageSectionData | null> {
  try {
    const params = new URLSearchParams({ sectionId, locale });
    const response = await authorizedFetch(`/api/admin/homepage-editorial?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch section: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching homepage section:", error);
    throw error;
  }
}

/**
 * Bölmə konfiqurasiyasını saxlayır
 */
export async function saveHomepageSection(
  input: HomepageEditorialSectionInput
): Promise<{ success: boolean; version: number }> {
  try {
    const response = await authorizedFetch("/api/admin/homepage-editorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save section");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error saving homepage section:", error);
    throw error;
  }
}

/**
 * Məqalə axtarışı — admin panel üçün
 * Bütün dərc olunmuş məqalələri axtarır (başlıq, slug və ya ID ilə)
 */
export async function searchPublishedArticles(
  query: string,
  options?: {
    category?: string;
    subcategory?: string;
    locale?: Locale;
    limit?: number;
  }
): Promise<Article[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      status: "published",
      ...(options?.category && { category: options.category }),
      ...(options?.subcategory && { subcategory: options.subcategory }),
      ...(options?.locale && { locale: options.locale }),
      ...(options?.limit && { limit: options.limit.toString() }),
    });
    
    const response = await authorizedFetch(`/api/admin/articles/search?${params}`);
    
    if (!response.ok) {
      throw new Error("Axtarış uğursuz oldu");
    }
    
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error searching articles:", error);
    return [];
  }
}

/**
 * Məqalənin hansı homepage bölmələrindəki mövqelərini qaytarır
 */
export async function getArticleHomepagePlacements(
  articleId: string
): Promise<Array<{ sectionId: HomepageSectionId; locale: Locale; position: number }>> {
  try {
    const response = await authorizedFetch(
      `/api/admin/homepage-editorial/placements?articleId=${articleId}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch placements");
    }
    
    const data = await response.json();
    return data.placements || [];
  } catch (error) {
    console.error("Error fetching article placements:", error);
    return [];
  }
}

/**
 * Homepage cache-ini təmizləyir (yenilənmə zamanı)
 */
export async function revalidateHomepageCache(locale?: Locale): Promise<boolean> {
  try {
    const paths = locale 
      ? [`/${locale}`]
      : ["az", "en", "ru", "tr", "ar"].map(l => `/${l}`);
    
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
