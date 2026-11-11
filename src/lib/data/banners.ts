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
  increment,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";

/** Server və brauzerdə işləyən Firestore nüsxəsi (config.ts-dəki db yalnız brauzerdədir). */
function firestore() {
  const d = getDb();
  if (!d) throw new Error("Firebase konfiqurasiya olunmayıb");
  return d;
}
import type { AdvancedAdBanner, AdvancedAdBannerInput, AdBannerLocation } from "@/lib/types";

const COLLECTION = "advancedBanners";

/**
 * Bütün bannerləri gətir
 */
export async function getAllBanners(): Promise<AdvancedAdBanner[]> {
  const q = query(collection(firestore(), COLLECTION), orderBy("priority", "desc"), orderBy("createdAt", "desc"));
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
    collection(firestore(), COLLECTION),
    // Kompozit indeks (active + priority) tələb etməsin deyə sıralama yaddaşda aparılır.
    where("active", "==", true),
  );
  const snap = await getDocs(q);
  
  const now = new Date().toISOString();
  
  return snap.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AdvancedAdBanner))
    .filter((banner) => {
      // Tarix yoxlaması
      if (banner.startsAt && banner.startsAt > now) return false;
      if (banner.endsAt && banner.endsAt < now) return false;
      return true;
    })
    .sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0));
}

/**
 * Müəyyən yerləşmə üçün aktiv bannerləri gətir
 */
export async function getBannersByLocation(
  location: AdBannerLocation,
  category?: string | null,
): Promise<AdvancedAdBanner[]> {
  const allActiveBanners = await getActiveBanners();
  return allActiveBanners.filter(
    (banner) => (banner.locations ?? []).includes(location) && bannerMatchesCategory(banner, category),
  );
}

/**
 * Banner verilmiş bölmədə göstərilə bilərmi?
 * `categories` boşdursa — hər yerdə; doludursa — yalnız həmin bölmələrdə
 * (bölməsi olmayan səhifələrdə, məs. ana səhifədə, göstərilmir).
 */
export function bannerMatchesCategory(
  banner: Pick<AdvancedAdBanner, "categories">,
  category?: string | null,
): boolean {
  const allowed = banner.categories;
  if (!allowed || allowed.length === 0) return true;
  return !!category && allowed.includes(category);
}

/**
 * Bir banner gətir
 */
export async function getBanner(id: string): Promise<AdvancedAdBanner | null> {
  const docRef = doc(firestore(), COLLECTION, id);
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
  const docRef = await addDoc(collection(firestore(), COLLECTION), {
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
  const docRef = doc(firestore(), COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Banner-i sil
 */
export async function deleteBanner(id: string): Promise<void> {
  const docRef = doc(firestore(), COLLECTION, id);
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
  
  const { id: _, clicks, impressions, createdAt, updatedAt, ...rest } = original;
  
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
  // Yalnız bu sahə yazılır (+1) — Firestore qaydası anonim sayğacı məhz bu formada qəbul edir.
  await updateDoc(doc(firestore(), COLLECTION, id), { impressions: increment(1) });
}

/**
 * Banner clicks artır
 */
export async function incrementClicks(id: string): Promise<void> {
  await updateDoc(doc(firestore(), COLLECTION, id), { clicks: increment(1) });
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
