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
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { AdvancedAdBanner, AdvancedAdBannerInput, AdBannerLocation } from "@/lib/types";

const COLLECTION = "advancedBanners";

/**
 * Bütün bannerləri gətir
 */
export async function getAllBanners(): Promise<AdvancedAdBanner[]> {
  const q = query(collection(db, COLLECTION), orderBy("priority", "desc"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AdvancedAdBanner[];
}

/**
 * Aktiv bannerləri gətir
 */
export async function getActiveBanners(): Promise<AdvancedAdBanner[]> {
  const q = query(
    collection(db, COLLECTION),
    where("active", "==", true),
    orderBy("priority", "desc")
  );
  const snap = await getDocs(q);
  
  const now = new Date().toISOString();
  
  return snap.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((banner: AdvancedAdBanner) => {
      // Tarix yoxlaması
      if (banner.startsAt && banner.startsAt > now) return false;
      if (banner.endsAt && banner.endsAt < now) return false;
      return true;
    }) as AdvancedAdBanner[];
}

/**
 * Müəyyən yerləşmə üçün aktiv bannerləri gətir
 */
export async function getBannersByLocation(location: AdBannerLocation): Promise<AdvancedAdBanner[]> {
  const allActiveBanners = await getActiveBanners();
  return allActiveBanners.filter((banner) => banner.locations.includes(location));
}

/**
 * Bir banner gətir
 */
export async function getBanner(id: string): Promise<AdvancedAdBanner | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as AdvancedAdBanner;
}

/**
 * Yeni banner yarat
 */
export async function createBanner(
  input: AdvancedAdBannerInput,
  createdBy: string
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    clicks: 0,
    impressions: 0,
    createdAt: new Date().toISOString(),
    createdBy,
  });
  
  return docRef.id;
}

/**
 * Banner-i yenilə
 */
export async function updateBanner(
  id: string,
  updates: Partial<AdvancedAdBannerInput>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Banner-i sil
 */
export async function deleteBanner(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Banner-i kopyala
 */
export async function duplicateBanner(
  id: string,
  createdBy: string
): Promise<string> {
  const original = await getBanner(id);
  if (!original) throw new Error("Banner tapılmadı");
  
  const { id: _, clicks, impressions, createdAt, updatedAt, createdBy: __, ...rest } = original;
  
  return createBanner(
    {
      ...rest,
      name: `${rest.name} (Kopya)`,
      active: false, // Kopya default deaktiv
    },
    createdBy
  );
}

/**
 * Banner impressions artır
 */
export async function incrementImpressions(id: string): Promise<void> {
  const banner = await getBanner(id);
  if (!banner) return;
  
  await updateBanner(id, {
    impressions: banner.impressions + 1,
  } as any);
}

/**
 * Banner clicks artır
 */
export async function incrementClicks(id: string): Promise<void> {
  const banner = await getBanner(id);
  if (!banner) return;
  
  await updateBanner(id, {
    clicks: banner.clicks + 1,
  } as any);
}

/**
 * Banner statusunu dəyiş (aktiv/deaktiv)
 */
export async function toggleBannerStatus(id: string): Promise<boolean> {
  const banner = await getBanner(id);
  if (!banner) throw new Error("Banner tapılmadı");
  
  const newStatus = !banner.active;
  await updateBanner(id, { active: newStatus } as any);
  return newStatus;
}

/**
 * Banner statistikaları
 */
export async function getBannerStats() {
  const banners = await getAllBanners();
  
  const total = banners.length;
  const active = banners.filter((b) => b.active).length;
  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0);
  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  return {
    total,
    active,
    inactive: total - active,
    totalImpressions,
    totalClicks,
    avgCTR: avgCTR.toFixed(2),
    topPerformers: banners
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((b) => ({
        id: b.id,
        name: b.name,
        clicks: b.clicks,
        impressions: b.impressions,
        ctr: b.impressions > 0 ? ((b.clicks / b.impressions) * 100).toFixed(2) : "0",
      })),
  };
}
