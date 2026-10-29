import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import type { HoroscopePeriod } from "@/lib/content/horoscopes";
import { getDb, getFirebaseStorage } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/config";
import type {
  AdBanner,
  AdOrder,
  AdOrderInput,
  Article,
  ArticleInput,
  ArticleVersion,
  ArticleVersionInput,
  AuditLog,
  AuditLogInput,
  AuditAction,
  ContentPlanItem,
  ContentPlanItemInput,
  CrmActivity,
  CrmActivityInput,
  CrmClient,
  CrmClientInput,
  Ejournal,
  EjournalInput,
  LocalizedText,
  Notification,
  NotificationInput,
  SeoRedirect,
  SeoRedirectInput,
  SeoSettings,
  SiteSettings,
  StaffMember,
} from "@/lib/types";
import type { ZodiacKey } from "@/lib/zodiac";

/**
 * Admin panelin Firestore əməliyyatları.
 * Hər funksiya Firebase qoşulmayıbsa aydın xəta verir ki, səbəb bilinsin.
 */

function db() {
  const instance = getDb();
  if (!instance) {
    throw new Error(
      "Firebase qoşulmayıb. .env.local faylına NEXT_PUBLIC_FIREBASE_* açarlarını əlavə edin.",
    );
  }
  return instance;
}

/* ------------------------------ Məqalələr ------------------------------ */

export async function listArticles(): Promise<Article[]> {
  try {
    // 1. Firestore-dan məqalələr
    const snapshot = await getDocs(
      query(collection(db(), COLLECTIONS.articles), orderBy("publishedAt", "desc")),
    );
    
    const firestoreArticles = snapshot.docs
      .map((item) => {
        try {
          const data = item.data();
          
          // Validate required fields
          if (!data || typeof data !== 'object') {
            console.warn(`Invalid article data for ${item.id}`, data);
            return null;
          }
          
          // Ensure title is in correct format
          const title = data.title || {};
          const normalizedTitle = typeof title === 'string' 
            ? { az: title, en: '', ru: '', tr: '' }
            : title;
          
          // Ensure body is in correct format  
          const body = data.body || {};
          const normalizedBody = typeof body === 'string'
            ? { az: body, en: '', ru: '', tr: '' }
            : body;
            
          // Ensure excerpt is in correct format
          const excerpt = data.excerpt || {};
          const normalizedExcerpt = typeof excerpt === 'string'
            ? { az: excerpt, en: '', ru: '', tr: '' }
            : excerpt;
          
          // Normalize ALL fields to prevent object rendering
          const normalizedCoverAlt = typeof data.coverAlt === 'string'
            ? { az: data.coverAlt, en: '', ru: '', tr: '' }
            : (data.coverAlt || { az: '', en: '', ru: '', tr: '' });
          
          const normalizedTags = typeof data.tags === 'string'
            ? { az: [data.tags], en: [], ru: [], tr: [] }
            : (data.tags || { az: [], en: [], ru: [], tr: [] });
          
          return {
            id: item.id,
            slug: String(data.slug || item.id),
            category: String(data.category || 'gundem'),
            subcategory: data.subcategory ? String(data.subcategory) : undefined,
            status: String(data.status || 'draft'),
            featured: Boolean(data.featured),
            trending: Boolean(data.trending),
            coverImage: String(data.coverImage || ''),
            coverAlt: normalizedCoverAlt,
            coverCredit: String(data.coverCredit || ''),
            title: normalizedTitle,
            excerpt: normalizedExcerpt,
            body: normalizedBody,
            tags: normalizedTags,
            author: String(data.author || 'admin'),
            publishedAt: String(data.publishedAt || new Date().toISOString()),
            updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
            readingMinutes: Number(data.readingMinutes) || 0,
            scheduledAt: data.scheduledAt ? String(data.scheduledAt) : undefined,
            mediaBlocks: Array.isArray(data.mediaBlocks) ? data.mediaBlocks : [],
          } as Article;
        } catch (error) {
          console.error(`Error parsing article ${item.id}:`, error);
          return null;
        }
      })
      .filter((article): article is Article => article !== null);
    
    // 2. Seed articles (hard-coded) - fəqət Firestore-da olmayan
    // Import seed articles dynamically to avoid circular dependency
    const { seedArticles } = await import('@/lib/content');
    const firestoreSlugs = new Set(firestoreArticles.map(a => a.slug));
    const uniqueSeedArticles = seedArticles
      .filter(article => !firestoreSlugs.has(article.slug))
      .map(article => ({
        ...article,
        // Ensure all fields are properly formatted
        id: article.id || `seed-${article.slug}`,
      }));
    
    // 3. Birləşdir və tarixə görə sort et
    const allArticles = [...firestoreArticles, ...uniqueSeedArticles];
    return allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error('Error listing articles:', error);
    // Əgər Firestore xəta versə, ən azı seed articles qaytaraq
    try {
      const { seedArticles } = await import('@/lib/content');
      return seedArticles.map(article => ({
        ...article,
        id: article.id || `seed-${article.slug}`,
      }));
    } catch {
      return [];
    }
  }
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    // Seed məqalə ID-si ilə başlayırsa, əvvəlcə seed-dən yoxla
    if (id.startsWith('seed-')) {
      const { seedArticles } = await import('@/lib/content');
      const seedArticle = seedArticles.find((a) => a.id === id);
      
      if (seedArticle) {
        // Seed məqaləni Firestore-a köçür (ilk redaktə zamanı)
        // Yeni ID yarat (seed- prefix-i sil)
        const newId = id.replace(/^seed-/, '');
        
        // Firestore-da artıq varmı yoxla
        const existingSnapshot = await getDoc(doc(db(), COLLECTIONS.articles, newId));
        if (existingSnapshot.exists()) {
          // Artıq köçürülüb, Firestore versiyasını qaytar
          const data = existingSnapshot.data();
          return normalizeArticleData(existingSnapshot.id, data);
        }
        
        // Yox, seed-dən Firestore-a köçür
        await setDoc(doc(db(), COLLECTIONS.articles, newId), {
          ...seedArticle,
          id: newId, // Yeni ID
        });
        
        // Yeni yaradılmış məqaləni qaytar
        return { ...seedArticle, id: newId };
      }
      
      // Seed-də tapılmadı
      return null;
    }
    
    // Normal Firestore məqaləsi
    const snapshot = await getDoc(doc(db(), COLLECTIONS.articles, id));
    if (!snapshot.exists()) return null;
    
    const data = snapshot.data();
    if (!data || typeof data !== 'object') return null;
    
    return normalizeArticleData(snapshot.id, data);
  } catch (error) {
    console.error(`Error getting article ${id}:`, error);
    return null;
  }
}

// Helper function to normalize article data
function normalizeArticleData(id: string, data: any): Article {
  // Normalize data - same as listArticles
  const title = data.title || {};
  const normalizedTitle = typeof title === 'string' 
    ? { az: title, en: '', ru: '', tr: '', ar: '' }
    : title;
  
  const body = data.body || {};
  const normalizedBody = typeof body === 'string'
    ? { az: body, en: '', ru: '', tr: '', ar: '' }
    : body;
    
  const excerpt = data.excerpt || {};
  const normalizedExcerpt = typeof excerpt === 'string'
    ? { az: excerpt, en: '', ru: '', tr: '', ar: '' }
    : excerpt;
  
  const normalizedCoverAlt = typeof data.coverAlt === 'string'
    ? { az: data.coverAlt, en: '', ru: '', tr: '', ar: '' }
    : (data.coverAlt || { az: '', en: '', ru: '', tr: '', ar: '' });
  
  const normalizedTags = typeof data.tags === 'string'
    ? { az: [data.tags], en: [], ru: [], tr: [], ar: [] }
    : (data.tags || { az: [], en: [], ru: [], tr: [], ar: [] });
  
  return {
    id,
    slug: String(data.slug || id),
    category: String(data.category || 'gundem'),
    subcategory: data.subcategory ? String(data.subcategory) : undefined,
    status: String(data.status || 'draft'),
    featured: Boolean(data.featured),
    trending: Boolean(data.trending),
    coverImage: String(data.coverImage || ''),
    coverAlt: normalizedCoverAlt,
    coverCredit: String(data.coverCredit || ''),
    title: normalizedTitle,
    excerpt: normalizedExcerpt,
    body: normalizedBody,
    tags: normalizedTags,
    author: String(data.author || 'admin'),
    publishedAt: String(data.publishedAt || new Date().toISOString()),
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    readingMinutes: Number(data.readingMinutes) || 0,
    scheduledAt: data.scheduledAt ? String(data.scheduledAt) : undefined,
    mediaBlocks: Array.isArray(data.mediaBlocks) ? data.mediaBlocks : [],
  } as Article;
}

export async function createArticle(input: ArticleInput): Promise<string> {
  // Remove undefined fields to avoid Firestore error
  const cleanedInput: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      cleanedInput[key] = value;
    }
  }
  
  const created = await addDoc(collection(db(), COLLECTIONS.articles), {
    ...cleanedInput,
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveArticle(id: string, input: ArticleInput): Promise<void> {
  // Remove undefined fields to avoid Firestore error
  const cleanedInput: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      cleanedInput[key] = value;
    }
  }
  
  await updateDoc(doc(db(), COLLECTIONS.articles, id), {
    ...cleanedInput,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeArticle(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.articles, id));
}

/* -------------------------------- İşçilər ------------------------------- */

export async function listStaff(): Promise<StaffMember[]> {
  const snapshot = await getDocs(collection(db(), COLLECTIONS.staff));
  return snapshot.docs
    .map((item) => ({ ...(item.data() as Omit<StaffMember, "id">), id: item.id }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * İşçi sənədinin ID-si onun e-poçtudur.
 * Firestore qaydaları da icazələri həmin ID üzərindən yoxlayır, ona görə
 * bu qayda pozulmamalıdır.
 */
export async function addStaff(member: Omit<StaffMember, "id">): Promise<string> {
  const email = member.email.trim().toLowerCase();
  await setDoc(doc(db(), COLLECTIONS.staff, email), { ...member, email });
  return email;
}

export async function saveStaff(
  id: string,
  member: Partial<Omit<StaffMember, "id">>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.staff, id), member);
}

export async function removeStaff(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.staff, id));
}

/* ------------------------------- Bannerlər ------------------------------ */

export async function listBanners(): Promise<AdBanner[]> {
  const snapshot = await getDocs(collection(db(), COLLECTIONS.banners));
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<AdBanner, "id">),
    id: item.id,
  }));
}

export async function addBanner(banner: Omit<AdBanner, "id">): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.banners), banner);
  return created.id;
}

export async function saveBanner(
  id: string,
  banner: Partial<Omit<AdBanner, "id">>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.banners, id), banner);
}

export async function removeBanner(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.banners, id));
}

/* ------------------------------- E-jurnal ------------------------------- */

export async function listEjournals(): Promise<Ejournal[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.ejournals), orderBy("publishedAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Ejournal, "id">),
    id: item.id,
  }));
}

export async function getEjournal(id: string): Promise<Ejournal | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.ejournals, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<Ejournal, "id">), id: snapshot.id };
}

export async function addEjournal(input: EjournalInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.ejournals), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveEjournal(
  id: string,
  input: Partial<EjournalInput>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.ejournals, id), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeEjournal(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.ejournals, id));
}

/* ------------------------------ Bürc şərhləri --------------------------- */

export type HoroscopeDoc = Record<HoroscopePeriod, LocalizedText>;

export async function getHoroscopeDoc(sign: ZodiacKey): Promise<HoroscopeDoc | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.horoscopes, sign));
  return snapshot.exists() ? (snapshot.data() as HoroscopeDoc) : null;
}

export async function saveHoroscopeDoc(
  sign: ZodiacKey,
  value: HoroscopeDoc,
): Promise<void> {
  await setDoc(doc(db(), COLLECTIONS.horoscopes, sign), {
    ...value,
    updatedAt: new Date().toISOString(),
  });
}

/* -------------------------------- Mesajlar ------------------------------ */

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string;
  status: string;
  createdAt: string;
};

export async function listMessages(): Promise<ContactMessage[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.messages), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<ContactMessage, "id">),
    id: item.id,
  }));
}

export async function removeMessage(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.messages, id));
}

export async function countSubscribers(): Promise<number> {
  const snapshot = await getDocs(collection(db(), COLLECTIONS.subscribers));
  return snapshot.size;
}

/* --------------------------------- Fayl --------------------------------- */

/** Faylı (şəkil və ya PDF) Firebase Storage-a yükləyir və açıq URL qaytarır. */
export async function uploadFile(file: File, folder = "covers"): Promise<string> {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Firebase Storage qoşulmayıb.");
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const snapshot = await uploadBytes(ref(storage, path), file, {
    contentType: file.type,
  });
  return getDownloadURL(snapshot.ref);
}

/** Köhnə ad — şəkil yükləyən yerlər bunu çağırır. */
export const uploadImage = uploadFile;

/* ---------------------------- E-kitab Banner ---------------------------- */

export async function listEbookBanners(): Promise<import("@/lib/types").EbookBanner[]> {
  const snapshot = await getDocs(
    query(collection(db(), "ebookBanners"), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<import("@/lib/types").EbookBanner, "id">),
    id: item.id,
  }));
}

export async function getEbookBanner(
  id: string,
): Promise<import("@/lib/types").EbookBanner | null> {
  const snapshot = await getDoc(doc(db(), "ebookBanners", id));
  if (!snapshot.exists()) return null;
  return {
    ...(snapshot.data() as Omit<import("@/lib/types").EbookBanner, "id">),
    id: snapshot.id,
  };
}

export async function getActiveEbookBanner(): Promise<import("@/lib/types").EbookBanner | null> {
  const banners = await listEbookBanners();
  return banners.find((b) => b.active) ?? null;
}

export async function addEbookBanner(
  data: import("@/lib/types").EbookBannerInput,
): Promise<string> {
  const ref = await addDoc(collection(db(), "ebookBanners"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function saveEbookBanner(
  id: string,
  updates: Partial<import("@/lib/types").EbookBanner>,
): Promise<void> {
  await updateDoc(doc(db(), "ebookBanners", id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeEbookBanner(id: string): Promise<void> {
  await deleteDoc(doc(db(), "ebookBanners", id));
}

export async function duplicateEbookBanner(id: string): Promise<string> {
  const original = await getEbookBanner(id);
  if (!original) throw new Error("Banner tapılmadı");

  const { id: _, active, createdAt, updatedAt, ...rest } = original;
  return addEbookBanner({
    ...rest,
    active: false,
    title: {
      az: `${original.title.az} (kopya)`,
      en: `${original.title.en} (copy)`,
      ru: `${original.title.ru} (копия)`,
      tr: `${original.title.tr} (kopya)`,
      ar: `${original.title.ar} (نسخة)`,
    },
    createdAt: new Date().toISOString(),
  });
}

/* ======================================================================
   CRM — Müştərilər
   ====================================================================== */

export async function listCrmClients(): Promise<CrmClient[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.crmClients), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<CrmClient, "id">),
    id: item.id,
  }));
}

export async function getCrmClient(id: string): Promise<CrmClient | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.crmClients, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<CrmClient, "id">), id: snapshot.id };
}

export async function addCrmClient(input: CrmClientInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.crmClients), {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveCrmClient(
  id: string,
  input: Partial<CrmClientInput>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.crmClients, id), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeCrmClient(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.crmClients, id));
}

/* ======================================================================
   CRM — Aktivliklər (zəng, görüş, qeyd)
   ====================================================================== */

export async function listCrmActivities(clientId: string): Promise<CrmActivity[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.crmActivities),
      orderBy("createdAt", "desc"),
    ),
  );
  return snapshot.docs
    .map((item) => ({ ...(item.data() as Omit<CrmActivity, "id">), id: item.id }))
    .filter((a) => a.clientId === clientId);
}

export async function addCrmActivity(input: CrmActivityInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.crmActivities), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

export async function removeCrmActivity(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.crmActivities, id));
}

/* ======================================================================
   Reklam Sifarişləri
   ====================================================================== */

export async function listAdOrders(): Promise<AdOrder[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.adOrders), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<AdOrder, "id">),
    id: item.id,
  }));
}

export async function listAdOrdersByClient(clientId: string): Promise<AdOrder[]> {
  const all = await listAdOrders();
  return all.filter((o) => o.clientId === clientId);
}

export async function getAdOrder(id: string): Promise<AdOrder | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.adOrders, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<AdOrder, "id">), id: snapshot.id };
}

export async function addAdOrder(input: AdOrderInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.adOrders), {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveAdOrder(
  id: string,
  input: Partial<AdOrderInput>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.adOrders, id), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeAdOrder(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.adOrders, id));
}

/* ======================================================================
   Kontent Planı
   ====================================================================== */

export async function listContentPlan(): Promise<ContentPlanItem[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.contentPlan), orderBy("dueDate", "asc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<ContentPlanItem, "id">),
    id: item.id,
  }));
}

export async function addContentPlanItem(input: ContentPlanItemInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.contentPlan), {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveContentPlanItem(
  id: string,
  input: Partial<ContentPlanItemInput>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.contentPlan, id), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeContentPlanItem(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.contentPlan, id));
}

/* ======================================================================
   Abunəçilər — tam idarəetmə
   ====================================================================== */

export type Subscriber = {
  id: string;
  email: string;
  name?: string;
  locale?: string;
  interests?: string[];
  active: boolean;
  createdAt: string;
  unsubscribedAt?: string;
};

export async function listSubscribers(): Promise<Subscriber[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.subscribers), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Subscriber, "id">),
    id: item.id,
  }));
}

export async function removeSubscriber(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.subscribers, id));
}

export async function updateSubscriberStatus(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.subscribers, id), {
    active,
    ...(active ? {} : { unsubscribedAt: new Date().toISOString() }),
  });
}

/* ======================================================================
   SEO — Yönləndirmələr
   ====================================================================== */

export async function listSeoRedirects(): Promise<SeoRedirect[]> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.seoRedirects), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<SeoRedirect, "id">),
    id: item.id,
  }));
}

export async function addSeoRedirect(input: SeoRedirectInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.seoRedirects), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveSeoRedirect(
  id: string,
  input: Partial<SeoRedirectInput>,
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.seoRedirects, id), input);
}

export async function removeSeoRedirect(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.seoRedirects, id));
}

/* ======================================================================
   SEO — Ümumi Parametrlər (tək sənəd)
   ====================================================================== */

const SEO_SETTINGS_DOC = "global";

export async function getSeoSettings(): Promise<SeoSettings | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.seoSettings, SEO_SETTINGS_DOC));
  return snapshot.exists() ? (snapshot.data() as SeoSettings) : null;
}

export async function saveSeoSettings(settings: Partial<SeoSettings>): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.seoSettings, SEO_SETTINGS_DOC),
    { ...settings, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/* ======================================================================
   Sayt Parametrləri (tək sənəd)
   ====================================================================== */

const SITE_SETTINGS_DOC = "global";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.siteSettings, SITE_SETTINGS_DOC));
  return snapshot.exists() ? (snapshot.data() as SiteSettings) : null;
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.siteSettings, SITE_SETTINGS_DOC),
    { ...settings, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/* ======================================================================
   Audit Jurnalı
   ====================================================================== */

export async function listAuditLogs(limitCount = 100): Promise<AuditLog[]> {
  const { limit: fsLimit } = await import("firebase/firestore");
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.auditLogs),
      orderBy("createdAt", "desc"),
      fsLimit(limitCount),
    ),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<AuditLog, "id">),
    id: item.id,
  }));
}

export async function addAuditLog(input: AuditLogInput): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.auditLogs), input);
}

/**
 * Audit qeydini asanlıqla əlavə etmək üçün köməkçi.
 * Admin panelindəki hər mühüm əməliyyatdan sonra çağırılmalıdır.
 */
export async function logAction(params: {
  userEmail: string;
  userName: string;
  action: AuditLog["action"];
  resource: string;
  resourceId?: string;
  description: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  try {
    await addAuditLog({
      userEmail: params.userEmail,
      userName: params.userName,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      description: params.description,
      before: params.before ? JSON.stringify(params.before) : undefined,
      after: params.after ? JSON.stringify(params.after) : undefined,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Audit xətası əsas əməliyyatı dayandırmamalıdır
    console.warn("[audit] Qeyd əlavə edilmədi");
  }
}

/**
 * Audit log-ları filter ilə siyahıla.
 */
export async function listAuditLogsWithFilter(
  filter: Partial<{
    userEmail: string;
    action: AuditAction;
    resource: string;
    dateFrom: string;
    dateTo: string;
    searchQuery: string;
  }>,
  limitCount = 100
): Promise<AuditLog[]> {
  let allLogs = await listAuditLogs(limitCount);

  // Apply filters
  if (filter.userEmail) {
    allLogs = allLogs.filter((log) => log.userEmail === filter.userEmail);
  }

  if (filter.action) {
    allLogs = allLogs.filter((log) => log.action === filter.action);
  }

  if (filter.resource) {
    allLogs = allLogs.filter((log) => log.resource === filter.resource);
  }

  if (filter.dateFrom) {
    allLogs = allLogs.filter((log) => log.createdAt >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    allLogs = allLogs.filter((log) => log.createdAt <= filter.dateTo!);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    allLogs = allLogs.filter(
      (log) =>
        log.description.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query)
    );
  }

  return allLogs;
}

/**
 * Audit log statistikası hesabla.
 */
export async function getAuditLogStats(): Promise<{
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  byResource: { resource: string; count: number }[];
  byUser: { userEmail: string; userName: string; count: number }[];
  trend: {
    date: string;
    count: number;
    actions: Record<AuditAction, number>;
  }[];
}> {
  const allLogs = await listAuditLogs(1000);

  // By action
  const byAction: Record<AuditAction, number> = {
    create: 0,
    update: 0,
    delete: 0,
    publish: 0,
    unpublish: 0,
    login: 0,
    logout: 0,
    settings_change: 0,
  };

  for (const log of allLogs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
  }

  // By resource
  const resourceCounts = new Map<string, number>();
  for (const log of allLogs) {
    resourceCounts.set(log.resource, (resourceCounts.get(log.resource) || 0) + 1);
  }

  const byResource = Array.from(resourceCounts.entries())
    .map(([resource, count]) => ({ resource, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By user
  const userCounts = new Map<string, { userName: string; count: number }>();
  for (const log of allLogs) {
    const existing = userCounts.get(log.userEmail);
    if (existing) {
      existing.count++;
    } else {
      userCounts.set(log.userEmail, { userName: log.userName, count: 1 });
    }
  }

  const byUser = Array.from(userCounts.entries())
    .map(([userEmail, data]) => ({
      userEmail,
      userName: data.userName,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Trend (last 7 days)
  const now = new Date();
  const trend: {
    date: string;
    count: number;
    actions: Record<AuditAction, number>;
  }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayLogs = allLogs.filter((log) => log.createdAt.startsWith(dateStr));

    const dayActions: Record<AuditAction, number> = {
      create: 0,
      update: 0,
      delete: 0,
      publish: 0,
      unpublish: 0,
      login: 0,
      logout: 0,
      settings_change: 0,
    };

    for (const log of dayLogs) {
      dayActions[log.action] = (dayActions[log.action] || 0) + 1;
    }

    trend.push({
      date: dateStr,
      count: dayLogs.length,
      actions: dayActions,
    });
  }

  return {
    totalLogs: allLogs.length,
    byAction,
    byResource,
    byUser,
    trend,
  };
}

/**
 * Audit log-ları export et (JSON).
 */
export async function exportAuditLogs(
  filter: Partial<{
    dateFrom: string;
    dateTo: string;
  }>
): Promise<AuditLog[]> {
  return await listAuditLogsWithFilter(filter, 10000);
}

/* ======================================================================
   Bildirişlər
   ====================================================================== */

export async function listNotifications(limitCount = 50): Promise<Notification[]> {
  const { limit: fsLimit } = await import("firebase/firestore");
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.notifications),
      orderBy("createdAt", "desc"),
      fsLimit(limitCount),
    ),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Notification, "id">),
    id: item.id,
  }));
}

export async function addNotification(input: NotificationInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.notifications), input);
  return created.id;
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.notifications, id), { read: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.notifications), orderBy("createdAt", "desc")),
  );
  const unread = snapshot.docs.filter((d) => !d.data().read);
  await Promise.all(unread.map((d) => updateDoc(d.ref, { read: true })));
}

export async function removeNotification(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.notifications, id));
}

/**
 * Sistem bildirişi yaratmaq üçün köməkçi.
 * Admin panelindəki mühüm hadisələrdən sonra çağırılır.
 */
export async function createSystemNotification(params: {
  type: Notification["type"];
  priority: Notification["priority"];
  title: string;
  body: string;
  href?: string;
  forRole?: string[];
}): Promise<void> {
  try {
    await addNotification({
      ...params,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch {
    console.warn("[notifications] Bildiriş yaradılmadı");
  }
}

/* ======================================================================
   Məqalə Versiya Tarixçəsi
   ====================================================================== */

export async function listArticleVersions(articleId: string): Promise<ArticleVersion[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.articleVersions),
      orderBy("version", "desc"),
    ),
  );
  return snapshot.docs
    .map((item) => ({
      ...(item.data() as Omit<ArticleVersion, "id">),
      id: item.id,
    }))
    .filter((v) => v.articleId === articleId);
}

export async function saveArticleVersion(input: ArticleVersionInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.articleVersions), input);
  return created.id;
}

/**
 * Məqaləni saxlayarkən versiya snapshot-u avtomatik yaradır.
 * ArticleEditor-dan çağırılmalıdır.
 */
export async function snapshotArticleVersion(params: {
  articleId: string;
  article: unknown;
  summary: string;
  userEmail: string;
  currentVersion?: number;
}): Promise<void> {
  try {
    const version = (params.currentVersion ?? 0) + 1;
    await saveArticleVersion({
      articleId: params.articleId,
      version,
      summary: params.summary,
      snapshot: JSON.stringify(params.article),
      createdAt: new Date().toISOString(),
      createdBy: params.userEmail,
    });
  } catch {
    console.warn("[versions] Versiya yaradılmadı");
  }
}

/**
 * Versiya snapshot-unu oxu və parse et.
 */
export async function getArticleVersion(versionId: string): Promise<ArticleVersion | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.articleVersions, versionId));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<ArticleVersion, "id">), id: snapshot.id };
}

/**
 * Məqaləni əvvəlki versiyaya restore et.
 */
export async function restoreArticleVersion(
  articleId: string,
  versionId: string,
  userEmail: string
): Promise<void> {
  const version = await getArticleVersion(versionId);
  if (!version) throw new Error("Versiya tapılmadı");

  // Parse snapshot
  const articleData = JSON.parse(version.snapshot) as ArticleInput;

  // Current version-u snapshot-a al
  const currentArticle = await getArticle(articleId);
  if (currentArticle) {
    await snapshotArticleVersion({
      articleId,
      article: currentArticle,
      summary: `Restore öncəsi backup (v${version.version} restore edildi)`,
      userEmail,
    });
  }

  // Restore et
  await saveArticle(articleId, {
    ...articleData,
    updatedAt: new Date().toISOString(),
  });

  // Restore haqqında yeni versiya yarat
  await snapshotArticleVersion({
    articleId,
    article: articleData,
    summary: `v${version.version} versiyasına restore edildi: ${version.summary}`,
    userEmail,
  });
}

/**
 * İki versiyanı müqayisə et (diff).
 */
export async function compareArticleVersions(
  versionId1: string,
  versionId2: string
): Promise<{
  version1: ArticleVersion;
  version2: ArticleVersion;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}> {
  const [v1, v2] = await Promise.all([
    getArticleVersion(versionId1),
    getArticleVersion(versionId2),
  ]);

  if (!v1 || !v2) throw new Error("Versiyalar tapılmadı");

  const data1 = JSON.parse(v1.snapshot) as Record<string, any>;
  const data2 = JSON.parse(v2.snapshot) as Record<string, any>;

  const changes: { field: string; oldValue: string; newValue: string }[] = [];

  // Compare main fields
  const fieldsToCompare = ["title", "excerpt", "body", "tags", "category", "featured", "trending"];

  for (const field of fieldsToCompare) {
    const val1 = JSON.stringify(data1[field]);
    const val2 = JSON.stringify(data2[field]);

    if (val1 !== val2) {
      changes.push({
        field,
        oldValue: val1,
        newValue: val2,
      });
    }
  }

  return {
    version1: v1,
    version2: v2,
    changes,
  };
}

/* ======================================================================
   Smart Dashboard Alerts — Avtomatik bildirişlər
   ====================================================================== */

/**
 * İdarə panelində gecikmiş sifarişləri və tapşırıqları yoxlayır,
 * hər biri üçün avtomatik bildiriş yaradır.
 * Dublikatları önləmək üçün mövcud bildirişləri yoxlayır.
 */
export async function createSmartAlerts(): Promise<void> {
  try {
    // Mövcud bildirişləri oxu ki, dublikat yaratmayaq
    const existingNotifications = await listNotifications(200);
    const existingRefs = new Set(
      existingNotifications
        .filter((n) => n.href)
        .map((n) => n.href),
    );

    // Gecikmiş reklam sifarişlərini yoxla
    const adOrders = await listAdOrders();
    const overdueOrders = adOrders.filter((order) => {
      if (order.paymentStatus === "paid" || order.paymentStatus === "cancelled") return false;
      if (!order.endsAt) return false;
      return new Date(order.endsAt) < new Date();
    });

    for (const order of overdueOrders) {
      const href = `/admin/ad-orders#${order.id}`;
      if (existingRefs.has(href)) continue; // Bildiriş artıq var

      const daysOverdue = Math.floor(
        (Date.now() - new Date(order.endsAt!).getTime()) / (1000 * 60 * 60 * 24),
      );

      await addNotification({
        type: "overdue_payment",
        priority: daysOverdue > 30 ? "high" : "medium",
        title: `Gecikmiş ödəniş: ${order.clientName}`,
        body: `${order.clientName} müştərisinin reklam sifarişinin ödəniş müddəti ${daysOverdue} gün əvvəl keçib. Borc məbləği: ${order.price - order.paidAmount} ₼`,
        href,
        forRole: ["admin", "finance", "sales"],
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Gecikmiş kontent planı tapşırıqlarını yoxla
    const contentPlan = await listContentPlan();
    const overduePlan = contentPlan.filter((item) => {
      if (item.status === "published") return false;
      if (!item.dueDate) return false;
      return new Date(item.dueDate) < new Date();
    });

    for (const item of overduePlan) {
      const href = `/admin/content-plan#${item.id}`;
      if (existingRefs.has(href)) continue; // Bildiriş artıq var

      const daysOverdue = Math.floor(
        (Date.now() - new Date(item.dueDate!).getTime()) / (1000 * 60 * 60 * 24),
      );

      await addNotification({
        type: "overdue_content",
        priority: daysOverdue > 7 ? "high" : "medium",
        title: `Gecikmiş tapşırıq: ${item.title}`,
        body: `"${item.title}" tapşırığının son tarixi ${daysOverdue} gün əvvəl keçib. Məsul: ${item.assignedTo || "Təyin edilməyib"}`,
        href,
        forRole: ["admin", "editor", "author"],
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Smart alert xətası dashboardı dayandırmamalıdır
    console.error("[smart-alerts] Bildirişlər yaradılmadı:", error);
  }
}

/* ======================================================================
   Analytics — Tracking və Reporting
   ====================================================================== */

import type {
  PageView,
  PageViewInput,
  SessionData,
  SessionDataInput,
  ArticleAnalytics,
  DailyAnalytics,
  DailyAnalyticsInput,
  CrmAnalytics,
  CrmAnalyticsInput,
  RevenueAnalytics,
  RevenueAnalyticsInput,
  AnalyticsSummary,
} from "@/lib/types";
import { where, limit as fsLimit, startAfter } from "firebase/firestore";

/**
 * Səhifə baxışı qeyd et (client-side-dan çağırılır).
 */
export async function trackPageView(input: PageViewInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.pageViews), {
    ...input,
    viewedAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * Session məlumatı yarat və ya yenilə.
 */
export async function trackSession(input: SessionDataInput): Promise<string> {
  // Əvvəlcə bu sessionId mövcuddurmu yoxla
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.sessions),
      where("sessionId", "==", input.sessionId),
      fsLimit(1)
    )
  );

  if (!snapshot.empty) {
    // Mövcud sessiyonu yenilə
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, {
      endedAt: input.endedAt,
      duration: input.duration,
      pageViews: input.pageViews,
      exitPage: input.exitPage,
      bounced: input.bounced,
    });
    return snapshot.docs[0].id;
  }

  // Yeni session yarat
  const created = await addDoc(collection(db(), COLLECTIONS.sessions), input);
  return created.id;
}

/**
 * Məqalə analitikasını oxu.
 */
export async function getArticleAnalytics(articleId: string): Promise<ArticleAnalytics | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.articleAnalytics, articleId));
  if (!snapshot.exists()) return null;
  return { articleId, ...(snapshot.data() as Omit<ArticleAnalytics, "articleId">) };
}

/**
 * Məqalə analitikasını yarat və ya yenilə.
 */
export async function updateArticleAnalytics(
  articleId: string,
  stats: Partial<ArticleAnalytics>
): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.articleAnalytics, articleId),
    {
      ...stats,
      articleId,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Ən çox baxılan məqalələri götür.
 */
export async function getTopArticles(limitCount = 10): Promise<ArticleAnalytics[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.articleAnalytics),
      orderBy("views", "desc"),
      fsLimit(limitCount)
    )
  );
  return snapshot.docs.map((item) => ({
    articleId: item.id,
    ...(item.data() as Omit<ArticleAnalytics, "articleId">),
  }));
}

/**
 * Trending məqalələri götür (son 7 günə görə).
 */
export async function getTrendingArticles(limitCount = 10): Promise<ArticleAnalytics[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.articleAnalytics),
      orderBy("trendingScore", "desc"),
      fsLimit(limitCount)
    )
  );
  return snapshot.docs.map((item) => ({
    articleId: item.id,
    ...(item.data() as Omit<ArticleAnalytics, "articleId">),
  }));
}

/**
 * Gündəlik analytics xülasəsini əlavə et.
 */
export async function saveDailyAnalytics(input: DailyAnalyticsInput): Promise<string> {
  // date-i ID kimi istifadə et
  await setDoc(doc(db(), COLLECTIONS.dailyAnalytics, input.date), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return input.date;
}

/**
 * Gündəlik analytics siyahısını oxu.
 */
export async function getDailyAnalytics(
  startDate: string,
  endDate: string
): Promise<DailyAnalytics[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.dailyAnalytics),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    )
  );
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<DailyAnalytics, "id">),
  }));
}

/**
 * CRM analitikasını əlavə et.
 */
export async function saveCrmAnalytics(input: CrmAnalyticsInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.crmAnalytics), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * CRM analitikasını oxu (son qeyd).
 */
export async function getLatestCrmAnalytics(): Promise<CrmAnalytics | null> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.crmAnalytics),
      orderBy("createdAt", "desc"),
      fsLimit(1)
    )
  );
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<CrmAnalytics, "id">) };
}

/**
 * Gəlir analitikasını əlavə et.
 */
export async function saveRevenueAnalytics(input: RevenueAnalyticsInput): Promise<string> {
  // period-u ID kimi istifadə et (məs. "2026-10")
  await setDoc(doc(db(), COLLECTIONS.revenueAnalytics, input.period), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return input.period;
}

/**
 * Gəlir analitikasını oxu.
 */
export async function getRevenueAnalytics(
  startPeriod: string,
  endPeriod: string
): Promise<RevenueAnalytics[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.revenueAnalytics),
      where("period", ">=", startPeriod),
      where("period", "<=", endPeriod),
      orderBy("period", "desc")
    )
  );
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<RevenueAnalytics, "id">),
  }));
}

/**
 * Analytics ümumi xülasəsini hesabla (dashboard üçün).
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Bu gün
  const todaySnapshot = await getDoc(doc(db(), COLLECTIONS.dailyAnalytics, todayStr));
  const todayData = todaySnapshot.exists()
    ? (todaySnapshot.data() as DailyAnalytics)
    : null;

  // Bu həftə (son 7 gün)
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const weekData = await getDailyAnalytics(weekStart, todayStr);
  const weekTotals = weekData.reduce(
    (acc, day) => ({
      pageViews: acc.pageViews + day.pageViews,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
      sessions: acc.sessions + day.sessions,
    }),
    { pageViews: 0, uniqueVisitors: 0, sessions: 0 }
  );

  // Bu ay
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthData = await getDailyAnalytics(monthStart, todayStr);
  const monthTotals = monthData.reduce(
    (acc, day) => ({
      pageViews: acc.pageViews + day.pageViews,
      uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
      sessions: acc.sessions + day.sessions,
    }),
    { pageViews: 0, uniqueVisitors: 0, sessions: 0 }
  );

  // Bu ayın gəliri
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const revenueSnapshot = await getDoc(
    doc(db(), COLLECTIONS.revenueAnalytics, currentPeriod)
  );
  const monthRevenue = revenueSnapshot.exists()
    ? (revenueSnapshot.data() as RevenueAnalytics).totalRevenue
    : 0;

  // Bu ayın yeni abunəçiləri
  const subscribersSnapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.subscribers),
      where("createdAt", ">=", monthStart),
      where("createdAt", "<=", todayStr)
    )
  );
  const newSubscribers = subscribersSnapshot.size;

  // Top məqalə bu həftə
  const topArticle = weekData
    .flatMap((d) => d.topArticles)
    .reduce((acc, article) => {
      const existing = acc.find((a) => a.id === article.articleId);
      if (existing) {
        existing.views += article.views;
      } else {
        acc.push({ id: article.articleId, title: article.title, views: article.views });
      }
      return acc;
    }, [] as { id: string; title: string; views: number }[])
    .sort((a, b) => b.views - a.views)[0];

  // Real-time (son 5 dəqiqə)
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  const recentViewsSnapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.pageViews),
      where("viewedAt", ">=", fiveMinAgo),
      orderBy("viewedAt", "desc")
    )
  );

  const activeSessionIds = new Set<string>();
  const pathCounts: Record<string, number> = {};

  recentViewsSnapshot.docs.forEach((doc) => {
    const view = doc.data() as PageView;
    activeSessionIds.add(view.sessionId);
    pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
  });

  const currentPageViews = Object.entries(pathCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    today: {
      pageViews: todayData?.pageViews ?? 0,
      uniqueVisitors: todayData?.uniqueVisitors ?? 0,
      sessions: todayData?.sessions ?? 0,
    },
    thisWeek: {
      pageViews: weekTotals.pageViews,
      uniqueVisitors: weekTotals.uniqueVisitors,
      sessions: weekTotals.sessions,
      topArticle,
    },
    thisMonth: {
      pageViews: monthTotals.pageViews,
      uniqueVisitors: monthTotals.uniqueVisitors,
      sessions: monthTotals.sessions,
      revenue: monthRevenue,
      newSubscribers,
    },
    realTime: {
      activeUsers: activeSessionIds.size,
      currentPageViews,
    },
  };
}

/**
 * Səhifə baxışlarını oxu (filter və pagination ilə).
 */
export async function listPageViews(options?: {
  articleId?: string;
  startDate?: string;
  endDate?: string;
  limitCount?: number;
}): Promise<PageView[]> {
  const constraints: any[] = [];

  if (options?.articleId) {
    constraints.push(where("articleId", "==", options.articleId));
  }

  if (options?.startDate) {
    constraints.push(where("viewedAt", ">=", options.startDate));
  }

  if (options?.endDate) {
    constraints.push(where("viewedAt", "<=", options.endDate));
  }

  constraints.push(orderBy("viewedAt", "desc"));

  if (options?.limitCount) {
    constraints.push(fsLimit(options.limitCount));
  }

  const snapshot = await getDocs(query(collection(db(), COLLECTIONS.pageViews), ...constraints));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<PageView, "id">),
  }));
}

/**
 * Real-time məqalə baxışını artır.
 * Hər baxışdan sonra məqalə analitikasını yeniləmək üçün istifadə olunur.
 */
export async function incrementArticleView(articleId: string, sessionId: string): Promise<void> {
  try {
    const analyticsRef = doc(db(), COLLECTIONS.articleAnalytics, articleId);
    const snapshot = await getDoc(analyticsRef);

    if (snapshot.exists()) {
      const current = snapshot.data() as ArticleAnalytics;
      await updateDoc(analyticsRef, {
        views: (current.views || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // İlk dəfə — yeni analytics yarat
      await setDoc(analyticsRef, {
        articleId,
        views: 1,
        uniqueVisitors: 1,
        avgTimeOnPage: 0,
        shares: 0,
        comments: 0,
        viewsLast7Days: 1,
        viewsLast30Days: 1,
        trendingScore: 1,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[analytics] incrementArticleView failed:", error);
  }
}


/* ======================================================================
   Şərhlər (Comments) — İdarəetmə
   ====================================================================== */

import type { Comment, CommentInput, CommentStats, CommentStatus } from "@/lib/types";

/**
 * Bütün şərhləri siyahıla (son əlavə edilənlər əvvəl).
 */
export async function listComments(status?: CommentStatus): Promise<Comment[]> {
  const { limit: fsLimit } = await import("firebase/firestore");
  let q = query(
    collection(db(), COLLECTIONS.comments),
    orderBy("createdAt", "desc"),
    fsLimit(500)
  );

  if (status) {
    q = query(
      collection(db(), COLLECTIONS.comments),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      fsLimit(500)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Comment, "id">),
    id: item.id,
  }));
}

/**
 * Məqaləyə aid şərhləri götür.
 */
export async function listCommentsByArticle(articleId: string, status?: CommentStatus): Promise<Comment[]> {
  let q = query(
    collection(db(), COLLECTIONS.comments),
    where("articleId", "==", articleId),
    orderBy("createdAt", "desc")
  );

  if (status) {
    q = query(
      collection(db(), COLLECTIONS.comments),
      where("articleId", "==", articleId),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Comment, "id">),
    id: item.id,
  }));
}

/**
 * Şərhin statusunu dəyişdir (approve, spam, delete).
 */
export async function updateCommentStatus(
  id: string,
  status: CommentStatus,
  moderatorEmail: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === "approved") {
    updates.approvedAt = new Date().toISOString();
    updates.approvedBy = moderatorEmail;
  }

  await updateDoc(doc(db(), COLLECTIONS.comments, id), updates);
}

/**
 * Moderator cavabı əlavə et.
 */
export async function replyToComment(
  id: string,
  reply: string,
  moderatorEmail: string
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.comments, id), {
    moderatorReply: reply,
    repliedBy: moderatorEmail,
    repliedAt: new Date().toISOString(),
  });
}

/**
 * Şərhi sil (hard delete).
 */
export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.comments, id));
}

/**
 * Bulk status update — bir neçə şərhin statusunu dəyişdir.
 */
export async function bulkUpdateCommentStatus(
  ids: string[],
  status: CommentStatus,
  moderatorEmail: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === "approved") {
    updates.approvedAt = new Date().toISOString();
    updates.approvedBy = moderatorEmail;
  }

  await Promise.all(
    ids.map((id) => updateDoc(doc(db(), COLLECTIONS.comments, id), updates))
  );
}

/**
 * Şərh statistikaları — dashboard üçün.
 */
export async function getCommentStats(): Promise<CommentStats> {
  const all = await listComments();
  const today = new Date().toISOString().split("T")[0];

  const stats: CommentStats = {
    total: all.length,
    pending: all.filter((c) => c.status === "pending").length,
    approved: all.filter((c) => c.status === "approved").length,
    spam: all.filter((c) => c.status === "spam").length,
    deleted: all.filter((c) => c.status === "deleted").length,
    todayCount: all.filter((c) => c.createdAt.startsWith(today)).length,
    avgPerDay: 0,
  };

  // Son 30 günün ortalama şərh sayı
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentComments = all.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo);
  stats.avgPerDay = Math.round(recentComments.length / 30);

  return stats;
}

/**
 * Şərh yazmaq (frontend-dən çağırılır).
 */
export async function addComment(input: CommentInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.comments), {
    ...input,
    status: "pending", // default pending
    likes: 0,
    reports: 0,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}


/* ======================================================================
   İstifadəçilər (Frontend Users) — İdarəetmə
   ====================================================================== */

import type { 
  FrontendUser, 
  FrontendUserInput, 
  UserStatus, 
  UserReadingHistory,
  UserReadingHistoryInput,
  UserActivity,
  UserActivityInput,
  UserStats 
} from "@/lib/types";

/**
 * Bütün frontend istifadəçiləri siyahıla.
 */
export async function listFrontendUsers(status?: UserStatus): Promise<FrontendUser[]> {
  const { limit: fsLimit } = await import("firebase/firestore");
  let q = query(
    collection(db(), COLLECTIONS.frontendUsers),
    orderBy("createdAt", "desc"),
    fsLimit(500)
  );

  if (status) {
    q = query(
      collection(db(), COLLECTIONS.frontendUsers),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      fsLimit(500)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<FrontendUser, "id">),
    id: item.id,
  }));
}

/**
 * İstifadəçini ID ilə götür.
 */
export async function getFrontendUser(id: string): Promise<FrontendUser | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.frontendUsers, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<FrontendUser, "id">), id: snapshot.id };
}

/**
 * İstifadəçini email ilə götür.
 */
export async function getFrontendUserByEmail(email: string): Promise<FrontendUser | null> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.frontendUsers),
      where("email", "==", email.toLowerCase()),
      fsLimit(1)
    )
  );
  
  if (snapshot.empty) return null;
  return {
    ...(snapshot.docs[0].data() as Omit<FrontendUser, "id">),
    id: snapshot.docs[0].id,
  };
}

/**
 * İstifadəçini yarat (registration zamanı çağırılır).
 */
export async function createFrontendUser(input: FrontendUserInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.frontendUsers), {
    ...input,
    email: input.email.toLowerCase(),
    status: "active",
    articlesRead: 0,
    commentsCount: 0,
    subscribedToNewsletter: false,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * İstifadəçi profilini yenilə.
 */
export async function updateFrontendUser(
  id: string,
  updates: Partial<FrontendUserInput>
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.frontendUsers, id), updates);
}

/**
 * İstifadəçinin statusunu dəyişdir (suspend/activate/delete).
 */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
  moderatorEmail: string,
  reason?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === "suspended") {
    updates.suspendedReason = reason || "Moderator tərəfindən dayandırıldı";
    updates.suspendedBy = moderatorEmail;
    updates.suspendedAt = new Date().toISOString();
  }

  await updateDoc(doc(db(), COLLECTIONS.frontendUsers, id), updates);
}

/**
 * İstifadəçini sil (soft delete).
 */
export async function deleteFrontendUser(id: string, moderatorEmail: string): Promise<void> {
  await updateUserStatus(id, "deleted", moderatorEmail, "Hesab silindi");
}

/**
 * İstifadəçi oxuma tarixçəsini əlavə et.
 */
export async function addUserReadingHistory(input: UserReadingHistoryInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.userReadingHistory), {
    ...input,
    readAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * İstifadəçinin oxuma tarixçəsini götür.
 */
export async function getUserReadingHistory(userId: string, limitCount = 50): Promise<UserReadingHistory[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.userReadingHistory),
      where("userId", "==", userId),
      orderBy("readAt", "desc"),
      fsLimit(limitCount)
    )
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<UserReadingHistory, "id">),
    id: item.id,
  }));
}

/**
 * İstifadəçi aktivliyini qeyd et.
 */
export async function addUserActivity(input: UserActivityInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.userActivities), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * İstifadəçinin aktivlik tarixçəsini götür.
 */
export async function getUserActivities(userId: string, limitCount = 100): Promise<UserActivity[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.userActivities),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      fsLimit(limitCount)
    )
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<UserActivity, "id">),
    id: item.id,
  }));
}

/**
 * İstifadəçi statistikaları — dashboard üçün.
 */
export async function getUserStats(): Promise<UserStats> {
  const all = await listFrontendUsers();
  const today = new Date().toISOString().split("T")[0];

  // Son ay üçün artım
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const lastMonthUsers = all.filter((u) => new Date(u.createdAt) >= thirtyDaysAgo);

  // Ortalama məqalə oxuma sayı
  const totalArticlesRead = all.reduce((sum, u) => sum + (u.articlesRead || 0), 0);

  const stats: UserStats = {
    total: all.length,
    active: all.filter((u) => u.status === "active").length,
    suspended: all.filter((u) => u.status === "suspended").length,
    deleted: all.filter((u) => u.status === "deleted").length,
    todayCount: all.filter((u) => u.createdAt.startsWith(today)).length,
    monthlyGrowth: lastMonthUsers.length,
    avgArticlesRead: all.length > 0 ? Math.round(totalArticlesRead / all.length) : 0,
  };

  return stats;
}

/**
 * Bulk user status update.
 */
export async function bulkUpdateUserStatus(
  ids: string[],
  status: UserStatus,
  moderatorEmail: string,
  reason?: string
): Promise<void> {
  await Promise.all(
    ids.map((id) => updateUserStatus(id, status, moderatorEmail, reason))
  );
}


/* ======================================================================
   E-Jurnal Satışları və Download Tracking
   ====================================================================== */

import type {
  EjournalOrder,
  EjournalOrderInput,
  EjournalOrderStatus,
  EjournalDownload,
  EjournalDownloadInput,
  EjournalStats,
} from "@/lib/types";

/**
 * Bütün e-jurnal sifarişlərini siyahıla.
 */
export async function listEjournalOrders(status?: EjournalOrderStatus): Promise<EjournalOrder[]> {
  const { limit: fsLimit } = await import("firebase/firestore");
  let q = query(
    collection(db(), COLLECTIONS.ejournalOrders),
    orderBy("createdAt", "desc"),
    fsLimit(500)
  );

  if (status) {
    q = query(
      collection(db(), COLLECTIONS.ejournalOrders),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      fsLimit(500)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<EjournalOrder, "id">),
    id: item.id,
  }));
}

/**
 * E-jurnala aid sifarişləri götür.
 */
export async function listEjournalOrdersByIssue(ejournalId: string): Promise<EjournalOrder[]> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.ejournalOrders),
      where("ejournalId", "==", ejournalId),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<EjournalOrder, "id">),
    id: item.id,
  }));
}

/**
 * E-jurnal sifarişi yarat.
 */
export async function addEjournalOrder(input: EjournalOrderInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.ejournalOrders), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * Sifariş statusunu yenilə.
 */
export async function updateEjournalOrderStatus(
  id: string,
  status: EjournalOrderStatus
): Promise<void> {
  const updates: Record<string, unknown> = { status };

  if (status === "paid") {
    updates.paidAt = new Date().toISOString();
  }

  await updateDoc(doc(db(), COLLECTIONS.ejournalOrders, id), updates);
}

/**
 * E-jurnal download-u qeyd et.
 */
export async function trackEjournalDownload(input: EjournalDownloadInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.ejournalDownloads), {
    ...input,
    downloadedAt: new Date().toISOString(),
  });
  return created.id;
}

/**
 * E-jurnalın download statistikasını götür.
 */
export async function getEjournalDownloadCount(ejournalId: string): Promise<number> {
  const snapshot = await getDocs(
    query(
      collection(db(), COLLECTIONS.ejournalDownloads),
      where("ejournalId", "==", ejournalId)
    )
  );
  return snapshot.size;
}

/**
 * E-jurnal statistikaları — dashboard üçün.
 */
export async function getEjournalStats(): Promise<EjournalStats> {
  const [allIssues, allOrders, allDownloads] = await Promise.all([
    listEjournals(),
    listEjournalOrders(),
    getDocs(collection(db(), COLLECTIONS.ejournalDownloads)),
  ]);

  // Bu ay üçün satışlar
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonthOrders = allOrders.filter(
    (o) => o.status === "paid" && o.createdAt >= thisMonthStart
  );

  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.price, 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.price, 0);

  const stats: EjournalStats = {
    totalIssues: allIssues.length,
    publishedIssues: allIssues.filter((i) => i.status === "published").length,
    draftIssues: allIssues.filter((i) => i.status === "draft").length,
    totalSales: paidOrders.length,
    totalRevenue,
    totalDownloads: allDownloads.size,
    thisMonthSales: thisMonthOrders.length,
    thisMonthRevenue,
    avgPrice: paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
  };

  return stats;
}

/**
 * E-jurnalın satış və download statistikası.
 */
export async function getEjournalDetailStats(ejournalId: string): Promise<{
  orders: number;
  revenue: number;
  downloads: number;
}> {
  const [orders, downloadCount] = await Promise.all([
    listEjournalOrdersByIssue(ejournalId),
    getEjournalDownloadCount(ejournalId),
  ]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.price, 0);

  return {
    orders: paidOrders.length,
    revenue,
    downloads: downloadCount,
  };
}

/* ======================================================================
   Subscription Plans Manager
   ====================================================================== */

/**
 * Bütün üzvlük planlarını siyahıla.
 */
export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.subscriptionPlans), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPlan);
}

/**
 * ID-yə görə üzvlük planı oxu.
 */
export async function getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
  const docRef = doc(db(), COLLECTIONS.subscriptionPlans, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as SubscriptionPlan;
}

/**
 * Yeni üzvlük planı yarat.
 */
export async function createSubscriptionPlan(
  data: SubscriptionPlanInput
): Promise<SubscriptionPlan> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.subscriptionPlans), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as SubscriptionPlan;
}

/**
 * Üzvlük planını yenilə.
 */
export async function updateSubscriptionPlan(
  id: string,
  updates: Partial<SubscriptionPlanInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.subscriptionPlans, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Üzvlük planını sil.
 */
export async function deleteSubscriptionPlan(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.subscriptionPlans, id);
  await deleteDoc(docRef);
}

/**
 * Aktiv planları siyahıla (public site üçün).
 */
export async function listActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const allPlans = await listSubscriptionPlans();
  return allPlans.filter((p) => p.active);
}

/**
 * İstifadəçi üzvlüklərini siyahıla.
 */
export async function listUserSubscriptions(): Promise<UserSubscription[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.userSubscriptions), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserSubscription);
}

/**
 * İstifadəçinin aktiv üzvlüyü.
 */
export async function getUserActiveSubscription(
  userId: string
): Promise<UserSubscription | null> {
  const snap = await getDocs(collection(db(), COLLECTIONS.userSubscriptions));
  const subs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserSubscription);
  
  const activeSub = subs.find(
    (s) => s.userId === userId && s.status === "active" && new Date(s.expiresAt) > new Date()
  );
  
  return activeSub || null;
}

/**
 * Yeni üzvlük yarat.
 */
export async function createUserSubscription(
  data: UserSubscriptionInput
): Promise<UserSubscription> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.userSubscriptions), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as UserSubscription;
}

/**
 * Üzvlüyü yenilə.
 */
export async function updateUserSubscription(
  id: string,
  updates: Partial<UserSubscriptionInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.userSubscriptions, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Üzvlüyü ləğv et.
 */
export async function cancelUserSubscription(
  id: string,
  reason: string
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.userSubscriptions, id);
  await updateDoc(docRef, {
    status: "cancelled",
    autoRenew: false,
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Üzvlük ödənişlərini siyahıla.
 */
export async function listSubscriptionPayments(): Promise<SubscriptionPayment[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.subscriptionPayments), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SubscriptionPayment);
}

/**
 * Üzvlük ödənişi yarat.
 */
export async function createSubscriptionPayment(
  data: SubscriptionPaymentInput
): Promise<SubscriptionPayment> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.subscriptionPayments), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as SubscriptionPayment;
}

/**
 * Üzvlük ödənişini yenilə.
 */
export async function updateSubscriptionPayment(
  id: string,
  updates: Partial<SubscriptionPaymentInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.subscriptionPayments, id);
  await updateDoc(docRef, updates);
}

/**
 * Üzvlük statistikaları.
 */
export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const [allSubs, allPayments, allPlans] = await Promise.all([
    listUserSubscriptions(),
    listSubscriptionPayments(),
    listSubscriptionPlans(),
  ]);

  // Aktiv üzvlüklər
  const now = new Date();
  const activeSubs = allSubs.filter(
    (s) => s.status === "active" && new Date(s.expiresAt) > now
  );

  // Plan üzrə bölgü
  const freeUsers = activeSubs.filter((s) => s.planType === "free").length;
  const premiumUsers = activeSubs.filter((s) => s.planType === "premium").length;
  const vipUsers = activeSubs.filter((s) => s.planType === "vip").length;

  // Bu ay
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newThisMonth = allSubs.filter((s) => s.createdAt >= thisMonthStart).length;
  const cancelledThisMonth = allSubs.filter(
    (s) => s.status === "cancelled" && s.cancelledAt && s.cancelledAt >= thisMonthStart
  ).length;

  // Churn rate
  const totalActive = activeSubs.length;
  const churnRate = totalActive > 0 ? (cancelledThisMonth / totalActive) * 100 : 0;

  // MRR və ARR
  const monthlyRecurringRevenue = activeSubs
    .filter((s) => s.billingCycle === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);
  
  const yearlyRecurringRevenue = activeSubs
    .filter((s) => s.billingCycle === "yearly")
    .reduce((sum, s) => sum + s.amount, 0);
  
  const annualRecurringRevenue = monthlyRecurringRevenue * 12 + yearlyRecurringRevenue;

  // Ortalama dəyər
  const avgSubscriptionValue =
    activeSubs.length > 0
      ? activeSubs.reduce((sum, s) => sum + s.amount, 0) / activeSubs.length
      : 0;

  // Conversion rate (free → paid)
  const paidUsers = premiumUsers + vipUsers;
  const totalUsers = freeUsers + paidUsers;
  const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

  const stats: SubscriptionStats = {
    totalActive: activeSubs.length,
    freeUsers,
    premiumUsers,
    vipUsers,
    newThisMonth,
    cancelledThisMonth,
    churnRate: Math.round(churnRate * 100) / 100,
    monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
    annualRecurringRevenue: Math.round(annualRecurringRevenue),
    avgSubscriptionValue: Math.round(avgSubscriptionValue),
    conversionRate: Math.round(conversionRate * 100) / 100,
  };

  return stats;
}

// Import əlavə tipləri
import type {
  SubscriptionPlan,
  SubscriptionPlanInput,
  UserSubscription,
  UserSubscriptionInput,
  SubscriptionPayment,
  SubscriptionPaymentInput,
  SubscriptionStats,
} from "@/lib/types";

/* ======================================================================
   Push Notifications Manager
   ====================================================================== */

/**
 * Bütün push kampaniyalarını siyahıla.
 */
export async function listPushCampaigns(): Promise<PushNotificationCampaign[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.pushCampaigns), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PushNotificationCampaign);
}

/**
 * ID-yə görə kampaniya oxu.
 */
export async function getPushCampaign(id: string): Promise<PushNotificationCampaign | null> {
  const docRef = doc(db(), COLLECTIONS.pushCampaigns, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PushNotificationCampaign;
}

/**
 * Yeni push kampaniya yarat.
 */
export async function createPushCampaign(
  data: PushNotificationCampaignInput
): Promise<PushNotificationCampaign> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.pushCampaigns), {
    ...data,
    createdAt: new Date().toISOString(),
    stats: {
      totalRecipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      failed: 0,
    },
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as PushNotificationCampaign;
}

/**
 * Push kampaniya yenilə.
 */
export async function updatePushCampaign(
  id: string,
  updates: Partial<PushNotificationCampaignInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.pushCampaigns, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Push kampaniya sil.
 */
export async function deletePushCampaign(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.pushCampaigns, id);
  await deleteDoc(docRef);
}

/**
 * Kampaniyanı göndər (status = "sending" qoy).
 * Real göndərmə backend job-da edilməlidir.
 */
export async function sendPushCampaign(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.pushCampaigns, id);
  await updateDoc(docRef, {
    status: "sending",
    sentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // TODO: Backend job trigger (Firebase Functions, Cloud Run, etc.)
  // Bu placeholder-dir, real inteqrasiya lazımdır.
}

/**
 * Kampaniya statistikasını yenilə.
 */
export async function updateCampaignStats(
  id: string,
  stats: Partial<PushNotificationCampaign["stats"]>
): Promise<void> {
  const campaign = await getPushCampaign(id);
  if (!campaign) return;

  const docRef = doc(db(), COLLECTIONS.pushCampaigns, id);
  await updateDoc(docRef, {
    stats: { ...campaign.stats, ...stats },
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Push şablonlarını siyahıla.
 */
export async function listPushTemplates(): Promise<PushNotificationTemplate[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.pushTemplates), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PushNotificationTemplate);
}

/**
 * Push şablon yarat.
 */
export async function createPushTemplate(
  data: PushNotificationTemplateInput
): Promise<PushNotificationTemplate> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.pushTemplates), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as PushNotificationTemplate;
}

/**
 * Push şablon yenilə.
 */
export async function updatePushTemplate(
  id: string,
  updates: Partial<PushNotificationTemplateInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.pushTemplates, id);
  await updateDoc(docRef, updates);
}

/**
 * Push şablon sil.
 */
export async function deletePushTemplate(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.pushTemplates, id);
  await deleteDoc(docRef);
}

/**
 * FCM tokenləri siyahıla (aktiv cihazlar).
 */
export async function listFcmTokens(): Promise<UserFcmToken[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.userFcmTokens), orderBy("lastActiveAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserFcmToken);
}

/**
 * FCM token əlavə et və ya yenilə.
 */
export async function upsertFcmToken(data: UserFcmTokenInput): Promise<void> {
  // Check if token already exists
  const snap = await getDocs(collection(db(), COLLECTIONS.userFcmTokens));
  const existing = snap.docs.find((d) => d.data().token === data.token);

  if (existing) {
    // Update existing
    const docRef = doc(db(), COLLECTIONS.userFcmTokens, existing.id);
    await updateDoc(docRef, {
      ...data,
      lastActiveAt: new Date().toISOString(),
    });
  } else {
    // Create new
    await addDoc(collection(db(), COLLECTIONS.userFcmTokens), {
      ...data,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
  }
}

/**
 * FCM token sil.
 */
export async function deleteFcmToken(token: string): Promise<void> {
  const snap = await getDocs(collection(db(), COLLECTIONS.userFcmTokens));
  const existing = snap.docs.find((d) => d.data().token === token);
  
  if (existing) {
    await deleteDoc(doc(db(), COLLECTIONS.userFcmTokens, existing.id));
  }
}

/**
 * Auditoriyaya görə FCM token sayı.
 */
export async function getAudienceSize(
  audience: PushAudience,
  categorySlug?: CategorySlug,
  subscriptionPlan?: SubscriptionPlanType
): Promise<number> {
  const allTokens = await listFcmTokens();
  
  switch (audience) {
    case "all":
      return allTokens.length;
    
    case "subscribers":
      // Newsletter subscribers (frontend users with subscribedToNewsletter = true)
      const users = await listFrontendUsers();
      const subscriberIds = users
        .filter((u) => u.subscribedToNewsletter)
        .map((u) => u.id);
      return allTokens.filter((t) => t.userId && subscriberIds.includes(t.userId)).length;
    
    case "premium":
      return allTokens.filter((t) => 
        t.subscriptionPlan && t.subscriptionPlan !== "free"
      ).length;
    
    case "category":
      if (!categorySlug) return 0;
      return allTokens.filter((t) => 
        t.interests && t.interests.includes(categorySlug)
      ).length;
    
    default:
      return allTokens.length;
  }
}

/**
 * Push delivery log yarat.
 */
export async function createPushDeliveryLog(
  data: PushDeliveryLogInput
): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.pushDeliveryLogs), data);
}

/**
 * Kampaniya üçün delivery logs.
 */
export async function getCampaignDeliveryLogs(
  campaignId: string
): Promise<PushDeliveryLog[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.pushDeliveryLogs));
  const logs = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as PushDeliveryLog)
    .filter((log) => log.campaignId === campaignId);
  
  return logs;
}

/**
 * Push bildiriş statistikaları.
 */
export async function getPushNotificationStats(): Promise<PushNotificationStats> {
  const [campaigns, logs, tokens] = await Promise.all([
    listPushCampaigns(),
    getDocs(collection(db(), COLLECTIONS.pushDeliveryLogs)),
    listFcmTokens(),
  ]);

  const allLogs = logs.docs.map((d) => ({ id: d.id, ...d.data() }) as PushDeliveryLog);

  const sentCampaigns = campaigns.filter((c) => c.status === "sent").length;
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled").length;

  const totalSent = allLogs.filter((l) => l.status === "sent" || l.status === "opened" || l.status === "clicked").length;
  const totalOpened = allLogs.filter((l) => l.status === "opened" || l.status === "clicked").length;
  const totalClicked = allLogs.filter((l) => l.status === "clicked").length;

  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  // Bu həftə və bu ay
  const now = new Date();
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisWeekSent = allLogs.filter((l) => 
    new Date(l.sentAt) >= thisWeekStart
  ).length;

  const thisMonthSent = allLogs.filter((l) => 
    new Date(l.sentAt) >= thisMonthStart
  ).length;

  const stats: PushNotificationStats = {
    totalCampaigns: campaigns.length,
    sentCampaigns,
    scheduledCampaigns,
    totalSent,
    totalOpened,
    totalClicked,
    openRate: Math.round(openRate * 100) / 100,
    clickRate: Math.round(clickRate * 100) / 100,
    activeFcmTokens: tokens.length,
    thisWeekSent,
    thisMonthSent,
  };

  return stats;
}

// Import əlavə tipləri
import type {
  PushNotificationCampaign,
  PushNotificationCampaignInput,
  PushNotificationTemplate,
  PushNotificationTemplateInput,
  UserFcmToken,
  UserFcmTokenInput,
  PushDeliveryLog,
  PushDeliveryLogInput,
  PushNotificationStats,
  PushAudience,
  SubscriptionPlanType,
} from "@/lib/types";
import type { CategorySlug } from "@/lib/categories";

/* ======================================================================
   Translation Manager
   ====================================================================== */

/**
 * Məqalənin tərcümə progress-ini hesabla.
 */
export function calculateArticleTranslationProgress(
  article: Article
): Record<Locale, TranslationProgress> {
  const progress: Record<Locale, TranslationProgress> = {} as any;

  // Tərcümə olunmalı sahələr
  const fields = ["title", "excerpt", "body", "coverAlt"];
  const totalFields = fields.length;

  for (const locale of ["az", "en", "ru", "tr", "ar"] as Locale[]) {
    let emptyFields = 0;

    // Title
    if (!article.title[locale] || article.title[locale].trim() === "") emptyFields++;
    // Excerpt
    if (!article.excerpt[locale] || article.excerpt[locale].trim() === "") emptyFields++;
    // Body
    if (!article.body[locale] || article.body[locale].trim() === "") emptyFields++;
    // Cover alt
    if (!article.coverAlt[locale] || article.coverAlt[locale].trim() === "") emptyFields++;

    const completedFields = totalFields - emptyFields;
    const percentage = Math.round((completedFields / totalFields) * 100);

    let status: TranslationStatus = "completed";
    if (emptyFields === totalFields) {
      status = "empty";
    } else if (emptyFields > 0) {
      status = "in_progress";
    }

    progress[locale] = {
      locale,
      percentage,
      emptyFields,
      totalFields,
      status,
    };
  }

  return progress;
}

/**
 * Məqalə tərcümə məlumatlarını yarat və ya yenilə.
 */
export async function upsertArticleTranslation(article: Article): Promise<void> {
  const progress = calculateArticleTranslationProgress(article);

  // Check if exists
  const snap = await getDocs(collection(db(), COLLECTIONS.articleTranslations));
  const existing = snap.docs.find((d) => d.data().articleId === article.id);

  const data = {
    articleId: article.id,
    articleSlug: article.slug,
    progress,
    lastUpdatedAt: new Date().toISOString(),
  };

  if (existing) {
    await updateDoc(doc(db(), COLLECTIONS.articleTranslations, existing.id), data);
  } else {
    await addDoc(collection(db(), COLLECTIONS.articleTranslations), data);
  }
}

/**
 * Bütün məqalə tərcümə məlumatlarını siyahıla.
 */
export async function listArticleTranslations(): Promise<ArticleTranslation[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.articleTranslations), orderBy("lastUpdatedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ArticleTranslation);
}

/**
 * Məqalə ID-yə görə tərcümə məlumatı oxu.
 */
export async function getArticleTranslation(articleId: string): Promise<ArticleTranslation | null> {
  const snap = await getDocs(collection(db(), COLLECTIONS.articleTranslations));
  const doc = snap.docs.find((d) => d.data().articleId === articleId);
  if (!doc) return null;
  return { id: doc.id, ...doc.data() } as ArticleTranslation;
}

/**
 * Tərcümə işləri siyahıla.
 */
export async function listTranslationJobs(): Promise<TranslationJob[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.translationJobs), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TranslationJob);
}

/**
 * Yeni tərcümə işi yarat.
 */
export async function createTranslationJob(
  data: TranslationJobInput
): Promise<TranslationJob> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.translationJobs), {
    ...data,
    createdAt: new Date().toISOString(),
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as TranslationJob;
}

/**
 * Tərcümə işini yenilə.
 */
export async function updateTranslationJob(
  id: string,
  updates: Partial<TranslationJobInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.translationJobs, id);
  await updateDoc(docRef, updates);
}

/**
 * Tərcümə işini sil.
 */
export async function deleteTranslationJob(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.translationJobs, id);
  await deleteDoc(docRef);
}

/**
 * Boş tərcümələri tap (missing translations).
 */
export async function findMissingTranslations(
  locale: Locale
): Promise<{ articleId: string; articleSlug: string; emptyFields: string[] }[]> {
  const articles = await listArticles();
  const missing: { articleId: string; articleSlug: string; emptyFields: string[] }[] = [];

  for (const article of articles) {
    const emptyFields: string[] = [];

    if (!article.title[locale] || article.title[locale].trim() === "") {
      emptyFields.push("title");
    }
    if (!article.excerpt[locale] || article.excerpt[locale].trim() === "") {
      emptyFields.push("excerpt");
    }
    if (!article.body[locale] || article.body[locale].trim() === "") {
      emptyFields.push("body");
    }
    if (!article.coverAlt[locale] || article.coverAlt[locale].trim() === "") {
      emptyFields.push("coverAlt");
    }

    if (emptyFields.length > 0) {
      missing.push({
        articleId: article.id,
        articleSlug: article.slug,
        emptyFields,
      });
    }
  }

  return missing;
}

/**
 * Tərcümə statistikaları.
 */
export async function getTranslationStats(): Promise<TranslationStats> {
  const [articles, jobs] = await Promise.all([
    listArticles(),
    listTranslationJobs(),
  ]);

  const completionByLocale: Record<Locale, any> = {} as any;

  for (const locale of ["az", "en", "ru", "tr", "ar"] as Locale[]) {
    let completed = 0;
    let inProgress = 0;
    let empty = 0;

    for (const article of articles) {
      const progress = calculateArticleTranslationProgress(article);
      const localeProgress = progress[locale];

      if (localeProgress.status === "completed") {
        completed++;
      } else if (localeProgress.status === "in_progress") {
        inProgress++;
      } else if (localeProgress.status === "empty") {
        empty++;
      }
    }

    const percentage = articles.length > 0 
      ? Math.round((completed / articles.length) * 100)
      : 0;

    completionByLocale[locale] = {
      completed,
      inProgress,
      empty,
      percentage,
    };
  }

  const now = new Date();
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const activeJobs = jobs.filter((j) => j.status === "in_progress" || j.status === "pending").length;
  const completedJobsThisWeek = jobs.filter(
    (j) => j.status === "completed" && j.completedAt && new Date(j.completedAt) >= thisWeekStart
  ).length;
  const overdueJobs = jobs.filter(
    (j) => 
      (j.status === "pending" || j.status === "in_progress") && 
      j.dueDate && 
      new Date(j.dueDate) < now
  ).length;

  const stats: TranslationStats = {
    totalArticles: articles.length,
    completionByLocale,
    activeJobs,
    completedJobsThisWeek,
    overdueJobs,
  };

  return stats;
}

/**
 * Auto-translate funksiyası (Google Translate API placeholder).
 * Real inteqrasiya üçün Google Cloud Translation API lazımdır.
 */
export async function autoTranslate(
  request: AutoTranslateRequest
): Promise<AutoTranslateResponse> {
  // TODO: Google Translate API inteqrasiyası
  // Bu placeholder-dir, real tərcümə etmir.
  
  console.warn("Auto-translate: Google Translate API inteqrasiyası lazımdır");
  
  return {
    translatedText: `[AUTO-TRANSLATED from ${request.sourceLocale} to ${request.targetLocale}] ${request.text}`,
    detectedSourceLocale: request.sourceLocale,
  };
}

// Import əlavə tipləri
import type {
  ArticleTranslation,
  ArticleTranslationInput,
  TranslationJob,
  TranslationJobInput,
  TranslationStats,
  TranslationProgress,
  TranslationStatus,
  AutoTranslateRequest,
  AutoTranslateResponse,
} from "@/lib/types";

/* ======================================================================
   Category Manager Enhancement
   ====================================================================== */

/**
 * Bütün enhanced kateqoriyaları siyahıla.
 */
export async function listEnhancedCategories(): Promise<EnhancedCategory[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.enhancedCategories), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EnhancedCategory);
}

/**
 * ID-yə görə category oxu.
 */
export async function getEnhancedCategory(id: string): Promise<EnhancedCategory | null> {
  const docRef = doc(db(), COLLECTIONS.enhancedCategories, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as EnhancedCategory;
}

/**
 * Slug-a görə category oxu.
 */
export async function getEnhancedCategoryBySlug(slug: string): Promise<EnhancedCategory | null> {
  const snap = await getDocs(collection(db(), COLLECTIONS.enhancedCategories));
  const category = snap.docs.find((d) => d.data().slug === slug);
  if (!category) return null;
  return { id: category.id, ...category.data() } as EnhancedCategory;
}

/**
 * Yeni category yarat.
 */
export async function createEnhancedCategory(
  data: EnhancedCategoryInput
): Promise<EnhancedCategory> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.enhancedCategories), {
    ...data,
    createdAt: new Date().toISOString(),
    articleCount: 0,
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as EnhancedCategory;
}

/**
 * Category yenilə.
 */
export async function updateEnhancedCategory(
  id: string,
  updates: Partial<EnhancedCategoryInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.enhancedCategories, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Category sil.
 */
export async function deleteEnhancedCategory(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.enhancedCategories, id);
  await deleteDoc(docRef);
}

/**
 * Parent kateqoriyaları siyahıla (top-level).
 */
export async function listParentCategories(): Promise<EnhancedCategory[]> {
  const all = await listEnhancedCategories();
  return all.filter((cat) => !cat.parentId);
}

/**
 * Child kateqoriyaları siyahıla (specific parent).
 */
export async function listChildCategories(parentId: string): Promise<EnhancedCategory[]> {
  const all = await listEnhancedCategories();
  return all.filter((cat) => cat.parentId === parentId);
}

/**
 * Category üçün məqalə sayını yenilə.
 */
export async function updateCategoryArticleCount(categorySlug: string): Promise<void> {
  const category = await getEnhancedCategoryBySlug(categorySlug);
  if (!category) return;

  const articles = await listArticles();
  const count = articles.filter((a) => a.category === categorySlug).length;

  await updateEnhancedCategory(category.id, { articleCount: count });
}

/**
 * Kateqoriya statistikalarını hesabla.
 */
export async function calculateCategoryStats(categorySlug: string): Promise<CategoryStats> {
  const articles = await listArticles();
  const categoryArticles = articles.filter((a) => a.category === categorySlug);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const articlesLast30Days = categoryArticles.filter(
    (a) => new Date(a.publishedAt) >= thirtyDaysAgo
  ).length;

  const stats: CategoryStats = {
    categoryId: "",
    categorySlug,
    totalArticles: categoryArticles.length,
    publishedArticles: categoryArticles.filter((a) => a.status === "published").length,
    draftArticles: categoryArticles.filter((a) => a.status === "draft").length,
    articlesLast30Days,
    totalViews: 0, // TODO: Analytics inteqrasiyası
    avgViewsPerArticle: 0,
    updatedAt: new Date().toISOString(),
  };

  return stats;
}

/**
 * Category stats yarat və ya yenilə.
 */
export async function upsertCategoryStats(categorySlug: string): Promise<void> {
  const stats = await calculateCategoryStats(categorySlug);

  // Check if exists
  const snap = await getDocs(collection(db(), COLLECTIONS.categoryStats));
  const existing = snap.docs.find((d) => d.data().categorySlug === categorySlug);

  if (existing) {
    await updateDoc(doc(db(), COLLECTIONS.categoryStats, existing.id), stats);
  } else {
    await addDoc(collection(db(), COLLECTIONS.categoryStats), stats);
  }
}

/**
 * Bütün category stats-ları siyahıla.
 */
export async function listCategoryStats(): Promise<CategoryStats[]> {
  const snap = await getDocs(collection(db(), COLLECTIONS.categoryStats));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CategoryStats);
}

/**
 * Kateqoriya sıralamalarını toplu yenilə.
 */
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const batch = orderedIds.map((id, index) =>
    updateEnhancedCategory(id, { order: index })
  );
  await Promise.all(batch);
}

// Import əlavə tipləri
import type {
  EnhancedCategory,
  EnhancedCategoryInput,
  CategoryStats,
  CategoryStatsInput,
} from "@/lib/types";

/* ======================================================================
   Tags Manager
   ====================================================================== */

/**
 * Bütün tag-ları siyahıla.
 */
export async function listTags(): Promise<Tag[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.tags), orderBy("usageCount", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Tag);
}

/**
 * ID-yə görə tag oxu.
 */
export async function getTag(id: string): Promise<Tag | null> {
  const docRef = doc(db(), COLLECTIONS.tags, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Tag;
}

/**
 * Slug-a görə tag oxu.
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const snap = await getDocs(collection(db(), COLLECTIONS.tags));
  const tag = snap.docs.find((d) => d.data().slug === slug);
  if (!tag) return null;
  return { id: tag.id, ...tag.data() } as Tag;
}

/**
 * Yeni tag yarat.
 */
export async function createTag(data: TagInput): Promise<Tag> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.tags), {
    ...data,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  });

  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() } as Tag;
}

/**
 * Tag yenilə.
 */
export async function updateTag(
  id: string,
  updates: Partial<TagInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.tags, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Tag sil.
 */
export async function deleteTag(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.tags, id);
  await deleteDoc(docRef);
}

/**
 * Bulk tag silmə.
 */
export async function bulkDeleteTags(tagIds: string[]): Promise<void> {
  const batch = tagIds.map((id) => deleteTag(id));
  await Promise.all(batch);
}

/**
 * Tag-ları birləşdir (merge).
 * Source tag-ları target tag-a birləşdirir və source-ları silir.
 */
export async function mergeTags(request: TagMergeRequest): Promise<void> {
  const { sourceTagIds, targetTagId } = request;

  // Get target tag
  const targetTag = await getTag(targetTagId);
  if (!targetTag) {
    throw new Error("Target tag not found");
  }

  // Get all articles
  const articles = await listArticles();

  // Update articles: replace source tags with target tag
  for (const article of articles) {
    let updated = false;
    const newTags: LocalizedTags = { ...article.tags };

    for (const locale of ["az", "en", "ru", "tr", "ar"] as Locale[]) {
      const articleTags = article.tags[locale] || [];
      const sourceTags = await Promise.all(sourceTagIds.map((id) => getTag(id)));
      const sourceTagNames = sourceTags
        .filter((t) => t !== null)
        .map((t) => t!.name[locale]);

      // Check if article has any source tags
      const hasSourceTag = articleTags.some((tag) => sourceTagNames.includes(tag));

      if (hasSourceTag) {
        // Remove source tags
        const filteredTags = articleTags.filter((tag) => !sourceTagNames.includes(tag));
        
        // Add target tag if not already present
        if (!filteredTags.includes(targetTag.name[locale])) {
          filteredTags.push(targetTag.name[locale]);
        }

        newTags[locale] = filteredTags;
        updated = true;
      }
    }

    // Update article if changed
    if (updated) {
      const articleRef = doc(db(), COLLECTIONS.articles, article.id);
      await updateDoc(articleRef, { tags: newTags });
    }
  }

  // Update target tag usage count
  const newUsageCount = targetTag.usageCount + sourceTagIds.length;
  await updateTag(targetTagId, { usageCount: newUsageCount });

  // Delete source tags
  await bulkDeleteTags(sourceTagIds);
}

/**
 * Tag istifadə sayını yenilə.
 */
export async function updateTagUsageCount(tagSlug: string): Promise<void> {
  const tag = await getTagBySlug(tagSlug);
  if (!tag) return;

  const articles = await listArticles();
  let count = 0;

  for (const article of articles) {
    for (const locale of ["az", "en", "ru", "tr", "ar"] as Locale[]) {
      const articleTags = article.tags[locale] || [];
      if (articleTags.includes(tag.name[locale])) {
        count++;
        break; // Count each article only once
      }
    }
  }

  await updateTag(tag.id, { 
    usageCount: count,
    lastUsedAt: count > 0 ? new Date().toISOString() : tag.lastUsedAt,
  });
}

/**
 * Bütün tag-ların istifadə sayını yenilə.
 */
export async function updateAllTagUsageCounts(): Promise<void> {
  const tags = await listTags();
  const batch = tags.map((tag) => updateTagUsageCount(tag.slug));
  await Promise.all(batch);
}

/**
 * İstifadə edilməyən tag-ları tap.
 */
export async function findUnusedTags(): Promise<Tag[]> {
  const tags = await listTags();
  return tags.filter((tag) => tag.usageCount === 0);
}

/**
 * Duplicate tag-ları tap (eyni adlı).
 */
export async function findDuplicateTags(): Promise<{ name: string; tags: Tag[] }[]> {
  const tags = await listTags();
  const duplicates: { name: string; tags: Tag[] }[] = [];

  // Group by name (Azerbaijani)
  const grouped = new Map<string, Tag[]>();
  for (const tag of tags) {
    const name = tag.name.az.toLowerCase().trim();
    if (!grouped.has(name)) {
      grouped.set(name, []);
    }
    grouped.get(name)!.push(tag);
  }

  // Find groups with more than 1 tag
  for (const [name, tagList] of grouped.entries()) {
    if (tagList.length > 1) {
      duplicates.push({ name, tags: tagList });
    }
  }

  return duplicates;
}

/**
 * Tag statistikaları.
 */
export async function getTagStats(): Promise<TagStats> {
  const tags = await listTags();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const topTags = tags
    .filter((t) => t.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map((t) => ({
      tagId: t.id,
      tagName: t.name.az,
      usageCount: t.usageCount,
    }));

  const stats: TagStats = {
    totalTags: tags.length,
    activeTags: tags.filter((t) => t.active).length,
    unusedTags: tags.filter((t) => t.usageCount === 0).length,
    topTags,
    tagsCreatedThisMonth: tags.filter((t) => t.createdAt >= thisMonthStart).length,
  };

  return stats;
}

/**
 * Tag auto-suggestion (search).
 */
export async function searchTags(query: string, locale: Locale = "az"): Promise<Tag[]> {
  const tags = await listTags();
  const lowerQuery = query.toLowerCase().trim();

  return tags.filter((tag) => 
    tag.name[locale]?.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit to 10 results
}

/**
 * Bulk tag rename.
 */
export async function bulkRenameTags(
  tagIds: string[],
  newNames: LocalizedText
): Promise<void> {
  const batch = tagIds.map((id) => updateTag(id, { name: newNames }));
  await Promise.all(batch);
}

// Import əlavə tipləri
import type {
  Tag,
  TagInput,
  TagStats,
  TagMergeRequest,
  Locale,
  LocalizedTags,
} from "@/lib/types";


/* ======================================================================
   File Manager Enhancement
   ====================================================================== */

import type {
  MediaFolder,
  MediaFolderInput,
  MediaFile,
  MediaFileInput,
  FileType,
  StorageStats,
} from "@/lib/types";

/**
 * Bütün media folder-ləri siyahıla.
 */
export async function listMediaFolders(): Promise<MediaFolder[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.mediaFolders), orderBy("name", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MediaFolder);
}

/**
 * ID-yə görə folder oxu.
 */
export async function getMediaFolder(id: string): Promise<MediaFolder | null> {
  const docRef = doc(db(), COLLECTIONS.mediaFolders, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MediaFolder;
}

/**
 * Yeni folder yarat.
 */
export async function createMediaFolder(input: MediaFolderInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.mediaFolders), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Folder yenilə.
 */
export async function updateMediaFolder(
  id: string,
  updates: Partial<MediaFolderInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.mediaFolders, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Folder sil.
 */
export async function deleteMediaFolder(id: string): Promise<void> {
  // Check if folder has files
  const files = await listMediaFilesByFolder(id);
  if (files.length > 0) {
    throw new Error("Cannot delete folder with files. Move or delete files first.");
  }

  // Check if folder has subfolders
  const subfolders = await listMediaFoldersByParent(id);
  if (subfolders.length > 0) {
    throw new Error("Cannot delete folder with subfolders. Delete subfolders first.");
  }

  const docRef = doc(db(), COLLECTIONS.mediaFolders, id);
  await deleteDoc(docRef);
}

/**
 * Parent ID-yə görə subfolder-ləri siyahıla.
 */
export async function listMediaFoldersByParent(parentId: string | null): Promise<MediaFolder[]> {
  const snap = await getDocs(
    query(
      collection(db(), COLLECTIONS.mediaFolders),
      orderBy("name", "asc")
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MediaFolder)
    .filter((f) => f.parentId === parentId);
}

/**
 * Folder tree (hierarchical structure) qur.
 */
export async function getMediaFolderTree(): Promise<(MediaFolder & { children: MediaFolder[] })[]> {
  const allFolders = await listMediaFolders();
  const rootFolders = allFolders.filter((f) => f.parentId === null);

  const buildTree = (parentId: string | null): (MediaFolder & { children: MediaFolder[] })[] => {
    return allFolders
      .filter((f) => f.parentId === parentId)
      .map((folder) => ({
        ...folder,
        children: buildTree(folder.id),
      }));
  };

  return buildTree(null);
}

/**
 * Bütün media faylları siyahıla.
 */
export async function listMediaFiles(): Promise<MediaFile[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.mediaFiles), orderBy("uploadedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MediaFile);
}

/**
 * ID-yə görə file oxu.
 */
export async function getMediaFile(id: string): Promise<MediaFile | null> {
  const docRef = doc(db(), COLLECTIONS.mediaFiles, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MediaFile;
}

/**
 * Folder-ə görə faylları siyahıla.
 */
export async function listMediaFilesByFolder(folderId: string | null): Promise<MediaFile[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.mediaFiles), orderBy("uploadedAt", "desc"))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MediaFile)
    .filter((f) => f.folderId === folderId);
}

/**
 * Yeni file metadata yarat.
 */
export async function createMediaFile(input: MediaFileInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.mediaFiles), {
    ...input,
    uploadedAt: new Date().toISOString(),
    usageCount: 0,
  });
  return docRef.id;
}

/**
 * File metadata yenilə.
 */
export async function updateMediaFile(
  id: string,
  updates: Partial<MediaFileInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.mediaFiles, id);
  await updateDoc(docRef, updates);
}

/**
 * File-ı sil (metadata).
 */
export async function deleteMediaFile(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.mediaFiles, id);
  await deleteDoc(docRef);
}

/**
 * Bulk file silmə.
 */
export async function bulkDeleteMediaFiles(ids: string[]): Promise<void> {
  const batch = ids.map((id) => deleteMediaFile(id));
  await Promise.all(batch);
}

/**
 * File-ları folder-dən folder-ə köçür.
 */
export async function moveFilesToFolder(fileIds: string[], targetFolderId: string | null): Promise<void> {
  const batch = fileIds.map((id) =>
    updateMediaFile(id, { folderId: targetFolderId })
  );
  await Promise.all(batch);
}

/**
 * File növünə görə faylları filtrələ.
 */
export async function listMediaFilesByType(type: FileType): Promise<MediaFile[]> {
  const allFiles = await listMediaFiles();
  return allFiles.filter((f) => f.type === type);
}

/**
 * Fayl axtarışı (name və description-da).
 */
export async function searchMediaFiles(query: string): Promise<MediaFile[]> {
  const allFiles = await listMediaFiles();
  const lowerQuery = query.toLowerCase();
  
  return allFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description?.toLowerCase().includes(lowerQuery) ||
      f.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * İstifadə olunmayan faylları tap (usageCount = 0).
 */
export async function findUnusedMediaFiles(): Promise<MediaFile[]> {
  const allFiles = await listMediaFiles();
  return allFiles.filter((f) => f.usageCount === 0);
}

/**
 * Ən böyük faylları tap.
 */
export async function findLargestMediaFiles(limit: number = 10): Promise<MediaFile[]> {
  const allFiles = await listMediaFiles();
  return allFiles.sort((a, b) => b.size - a.size).slice(0, limit);
}

/**
 * Storage statistikası hesabla.
 */
export async function getStorageStats(): Promise<StorageStats> {
  const allFiles = await listMediaFiles();
  const allFolders = await listMediaFolders();

  let totalUsed = 0;
  const byType: Record<FileType, { count: number; size: number }> = {
    image: { count: 0, size: 0 },
    video: { count: 0, size: 0 },
    audio: { count: 0, size: 0 },
    document: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  };

  for (const file of allFiles) {
    totalUsed += file.size;
    byType[file.type].count += 1;
    byType[file.type].size += file.size;
  }

  // Folder-ə görə statistika
  const byFolder: { folderId: string; folderName: string; count: number; size: number }[] = [];
  
  for (const folder of allFolders) {
    const folderFiles = allFiles.filter((f) => f.folderId === folder.id);
    const folderSize = folderFiles.reduce((sum, f) => sum + f.size, 0);
    
    byFolder.push({
      folderId: folder.id,
      folderName: folder.name,
      count: folderFiles.length,
      size: folderSize,
    });
  }

  // Root files (no folder)
  const rootFiles = allFiles.filter((f) => f.folderId === null);
  const rootSize = rootFiles.reduce((sum, f) => sum + f.size, 0);
  byFolder.push({
    folderId: "root",
    folderName: "Root / Qovluqsuz",
    count: rootFiles.length,
    size: rootSize,
  });

  // Ən böyük fayllar
  const largestFiles = await findLargestMediaFiles(10);

  // Storage limit (1 GB = 1073741824 bytes)
  const totalLimit = 1073741824;
  const usagePercentage = (totalUsed / totalLimit) * 100;

  return {
    totalUsed,
    totalLimit,
    usagePercentage,
    byType,
    byFolder: byFolder.sort((a, b) => b.size - a.size),
    largestFiles: largestFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      url: f.url,
    })),
  };
}

/**
 * File istifadə sayını yenilə.
 */
export async function updateMediaFileUsageCount(fileId: string): Promise<void> {
  const file = await getMediaFile(fileId);
  if (!file) return;

  // Check usage in articles
  const articles = await listArticles();
  let count = 0;

  for (const article of articles) {
    // Check coverImage
    if (article.coverImage === file.url) {
      count++;
    }

    // Check mediaBlocks
    if (article.mediaBlocks) {
      for (const block of article.mediaBlocks) {
        if (block.type === "video" && block.videoUrl === file.url) {
          count++;
        }
        if (block.type === "gallery" && block.images && block.images.some((img) => img.url === file.url)) {
          count++;
        }
      }
    }
  }

  await updateMediaFile(fileId, {
    usageCount: count,
    lastUsedAt: count > 0 ? new Date().toISOString() : file.lastUsedAt,
  });
}

/**
 * Bütün file-ların istifadə sayını yenilə.
 */
export async function updateAllMediaFileUsageCounts(): Promise<void> {
  const files = await listMediaFiles();
  const batch = files.map((file) => updateMediaFileUsageCount(file.id));
  await Promise.all(batch);
}


/* ======================================================================
   Site Performance Monitor
   ====================================================================== */

import type {
  PagePerformance,
  PagePerformanceInput,
  PerformanceSummary,
  OptimizationTip,
  OptimizationTipInput,
  PerformanceRating,
} from "@/lib/types";

/**
 * Bütün performance testlərini siyahıla.
 */
export async function listPagePerformance(limit: number = 50): Promise<PagePerformance[]> {
  const snap = await getDocs(
    query(
      collection(db(), COLLECTIONS.pagePerformance),
      orderBy("testedAt", "desc")
    )
  );
  return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() }) as PagePerformance);
}

/**
 * ID-yə görə performance test oxu.
 */
export async function getPagePerformance(id: string): Promise<PagePerformance | null> {
  const docRef = doc(db(), COLLECTIONS.pagePerformance, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PagePerformance;
}

/**
 * Yeni performance test yarat.
 */
export async function createPagePerformance(input: PagePerformanceInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.pagePerformance), {
    ...input,
    testedAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * URL-ə görə performance testləri.
 */
export async function getPagePerformanceByUrl(pageUrl: string): Promise<PagePerformance[]> {
  const allTests = await listPagePerformance(100);
  return allTests.filter((t) => t.pageUrl === pageUrl);
}

/**
 * Performance summary hesabla.
 */
export async function getPerformanceSummary(): Promise<PerformanceSummary> {
  const allTests = await listPagePerformance(200);

  if (allTests.length === 0) {
    return {
      lastTestedAt: new Date().toISOString(),
      averageScore: 0,
      byDevice: {
        desktop: { averageScore: 0, testCount: 0 },
        mobile: { averageScore: 0, testCount: 0 },
      },
      averageWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
        fcp: 0,
        ttfb: 0,
      },
      slowestPages: [],
      fastestPages: [],
      trend: [],
    };
  }

  // Calculate averages
  const totalScore = allTests.reduce((sum, t) => sum + t.performanceScore, 0);
  const averageScore = totalScore / allTests.length;

  // By device
  const desktopTests = allTests.filter((t) => t.device === "desktop");
  const mobileTests = allTests.filter((t) => t.device === "mobile");

  const desktopScore = desktopTests.length
    ? desktopTests.reduce((sum, t) => sum + t.performanceScore, 0) / desktopTests.length
    : 0;
  const mobileScore = mobileTests.length
    ? mobileTests.reduce((sum, t) => sum + t.performanceScore, 0) / mobileTests.length
    : 0;

  // Average Web Vitals
  const avgLcp = allTests.reduce((sum, t) => sum + t.webVitals.lcp, 0) / allTests.length;
  const avgFid = allTests.reduce((sum, t) => sum + t.webVitals.fid, 0) / allTests.length;
  const avgCls = allTests.reduce((sum, t) => sum + t.webVitals.cls, 0) / allTests.length;
  const avgFcp = allTests.reduce((sum, t) => sum + t.webVitals.fcp, 0) / allTests.length;
  const avgTtfb = allTests.reduce((sum, t) => sum + t.webVitals.ttfb, 0) / allTests.length;

  // Slowest & Fastest pages (by latest test per page)
  const latestByPage = new Map<string, PagePerformance>();
  for (const test of allTests) {
    const existing = latestByPage.get(test.pageUrl);
    if (!existing || test.testedAt > existing.testedAt) {
      latestByPage.set(test.pageUrl, test);
    }
  }

  const pageTests = Array.from(latestByPage.values());
  const sortedByScore = [...pageTests].sort((a, b) => a.performanceScore - b.performanceScore);

  const slowestPages = sortedByScore.slice(0, 5).map((t) => ({
    url: t.pageUrl,
    title: t.pageTitle,
    score: t.performanceScore,
  }));

  const fastestPages = sortedByScore.slice(-5).reverse().map((t) => ({
    url: t.pageUrl,
    title: t.pageTitle,
    score: t.performanceScore,
  }));

  // Trend (last 7 days)
  const now = new Date();
  const trend: { date: string; averageScore: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayTests = allTests.filter((t) => t.testedAt.startsWith(dateStr));
    const dayScore = dayTests.length
      ? dayTests.reduce((sum, t) => sum + t.performanceScore, 0) / dayTests.length
      : 0;

    trend.push({ date: dateStr, averageScore: dayScore });
  }

  return {
    lastTestedAt: allTests[0].testedAt,
    averageScore,
    byDevice: {
      desktop: { averageScore: desktopScore, testCount: desktopTests.length },
      mobile: { averageScore: mobileScore, testCount: mobileTests.length },
    },
    averageWebVitals: {
      lcp: avgLcp,
      fid: avgFid,
      cls: avgCls,
      fcp: avgFcp,
      ttfb: avgTtfb,
    },
    slowestPages,
    fastestPages,
    trend,
  };
}

/**
 * Bütün optimization tips siyahıla.
 */
export async function listOptimizationTips(): Promise<OptimizationTip[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.optimizationTips), orderBy("impact", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OptimizationTip);
}

/**
 * Yeni optimization tip yarat.
 */
export async function createOptimizationTip(input: OptimizationTipInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.optimizationTips), {
    ...input,
    implemented: false,
  });
  return docRef.id;
}

/**
 * Optimization tip yenilə.
 */
export async function updateOptimizationTip(
  id: string,
  updates: Partial<OptimizationTipInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.optimizationTips, id);
  await updateDoc(docRef, updates);
}

/**
 * Optimization tip-i implemented olaraq işarələ.
 */
export async function markOptimizationTipImplemented(
  id: string,
  userId: string
): Promise<void> {
  await updateOptimizationTip(id, {
    implemented: true,
    implementedAt: new Date().toISOString(),
    implementedBy: userId,
  });
}

/**
 * Optimization tip sil.
 */
export async function deleteOptimizationTip(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.optimizationTips, id);
  await deleteDoc(docRef);
}

/**
 * Performance rating helper - Web Vitals üçün rating hesabla.
 */
export function calculatePerformanceRating(
  metric: "lcp" | "fid" | "cls" | "fcp" | "ttfb" | "inp",
  value: number
): PerformanceRating {
  const thresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 },
  };

  const threshold = thresholds[metric];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Səhifə performansını test et (mock - real implementation Google Lighthouse API istifadə edər).
 */
export async function testPagePerformance(
  pageUrl: string,
  pageTitle: string,
  device: "desktop" | "mobile"
): Promise<string> {
  // Mock data - real implementation would use Lighthouse API or PageSpeed Insights API
  const mockPerformance: PagePerformanceInput = {
    pageUrl,
    pageTitle,
    testedAt: new Date().toISOString(),
    device,
    performanceScore: Math.floor(Math.random() * 40) + 60, // 60-100
    webVitals: {
      lcp: Math.floor(Math.random() * 2000) + 1500, // 1500-3500ms
      lcpRating: "good",
      fid: Math.floor(Math.random() * 150) + 50, // 50-200ms
      fidRating: "good",
      cls: Math.random() * 0.15, // 0-0.15
      clsRating: "good",
      fcp: Math.floor(Math.random() * 1000) + 1000, // 1000-2000ms
      fcpRating: "good",
      ttfb: Math.floor(Math.random() * 500) + 300, // 300-800ms
      ttfbRating: "good",
      inp: Math.floor(Math.random() * 150) + 100, // 100-250ms
      inpRating: "good",
    },
    resources: {
      totalCount: Math.floor(Math.random() * 50) + 30,
      totalSize: Math.floor(Math.random() * 2000000) + 1000000, // 1-3MB
      javascript: { count: 10, size: 500000 },
      css: { count: 5, size: 200000 },
      images: { count: 15, size: 800000 },
      fonts: { count: 3, size: 150000 },
    },
    opportunities: [
      {
        id: "optimize-images",
        title: "Şəkilləri optimallaşdır",
        description: "WebP və ya AVIF formatına keçin",
        savings: 500,
        savingsUnit: "bytes",
        priority: "high",
      },
      {
        id: "minify-js",
        title: "JavaScript faylları minify edin",
        description: "Terser və ya UglifyJS istifadə edin",
        savings: 200,
        savingsUnit: "ms",
        priority: "medium",
      },
    ],
    serverResponseTime: Math.floor(Math.random() * 200) + 100,
    domContentLoaded: Math.floor(Math.random() * 1000) + 1000,
    fullPageLoad: Math.floor(Math.random() * 2000) + 2000,
  };

  // Calculate ratings
  mockPerformance.webVitals.lcpRating = calculatePerformanceRating(
    "lcp",
    mockPerformance.webVitals.lcp
  );
  mockPerformance.webVitals.fidRating = calculatePerformanceRating(
    "fid",
    mockPerformance.webVitals.fid
  );
  mockPerformance.webVitals.clsRating = calculatePerformanceRating(
    "cls",
    mockPerformance.webVitals.cls
  );
  mockPerformance.webVitals.fcpRating = calculatePerformanceRating(
    "fcp",
    mockPerformance.webVitals.fcp
  );
  mockPerformance.webVitals.ttfbRating = calculatePerformanceRating(
    "ttfb",
    mockPerformance.webVitals.ttfb
  );
  if (mockPerformance.webVitals.inp) {
    mockPerformance.webVitals.inpRating = calculatePerformanceRating(
      "inp",
      mockPerformance.webVitals.inp
    );
  }

  return await createPagePerformance(mockPerformance);
}


/* ======================================================================
   Backup & Restore
   ====================================================================== */

import type {
  DatabaseBackup,
  DatabaseBackupInput,
  BackupSchedule,
  BackupScheduleInput,
  RestoreOperation,
  RestoreOperationInput,
  BackupStats,
  BackupStatus,
} from "@/lib/types";

/**
 * Bütün backup-ları siyahıla.
 */
export async function listDatabaseBackups(): Promise<DatabaseBackup[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.databaseBackups), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DatabaseBackup);
}

/**
 * ID-yə görə backup oxu.
 */
export async function getDatabaseBackup(id: string): Promise<DatabaseBackup | null> {
  const docRef = doc(db(), COLLECTIONS.databaseBackups, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DatabaseBackup;
}

/**
 * Yeni backup yarat.
 */
export async function createDatabaseBackup(input: DatabaseBackupInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.databaseBackups), {
    ...input,
    createdAt: new Date().toISOString(),
    status: "pending",
  });
  return docRef.id;
}

/**
 * Backup status yenilə.
 */
export async function updateBackupStatus(
  id: string,
  status: BackupStatus,
  updates?: Partial<DatabaseBackupInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.databaseBackups, id);
  await updateDoc(docRef, {
    status,
    ...updates,
  });
}

/**
 * Backup sil.
 */
export async function deleteBackup(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.databaseBackups, id);
  await deleteDoc(docRef);
}

/**
 * Manual backup yarat (mock - real implementation Firebase export API istifadə edər).
 */
export async function createManualBackup(
  collections: string[],
  name: string,
  userId: string,
  notes?: string
): Promise<string> {
  const startTime = Date.now();
  
  // Generate a temporary ID for storage path
  const tempId = `backup-${Date.now()}`;

  // Create backup record
  const backupId = await createDatabaseBackup({
    name,
    type: "manual",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    size: 0,
    storagePath: `/backups/${tempId}.json`,
    collections,
    totalDocuments: 0,
    createdBy: userId,
    notes,
  });

  try {
    // Mock: Real implementation would export data from Firestore
    // For now, we'll simulate the backup process
    let totalDocs = 0;
    const backupData: Record<string, any[]> = {};

    for (const collectionName of collections) {
      const snap = await getDocs(collection(db(), collectionName));
      backupData[collectionName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      totalDocs += snap.size;
    }

    // Convert to JSON string to calculate size
    const jsonData = JSON.stringify(backupData, null, 2);
    const size = new Blob([jsonData]).size;

    const duration = Date.now() - startTime;

    // Update backup record with success
    await updateBackupStatus(backupId, "completed", {
      size,
      totalDocuments: totalDocs,
      duration,
      downloadUrl: `/api/backups/${backupId}/download`, // Mock URL
    });

    return backupId;
  } catch (error: any) {
    // Update backup record with failure
    await updateBackupStatus(backupId, "failed", {
      error: error.message || "Unknown error",
    });
    throw error;
  }
}

/**
 * Backup schedule-ləri siyahıla.
 */
export async function listBackupSchedules(): Promise<BackupSchedule[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.backupSchedules), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BackupSchedule);
}

/**
 * Yeni backup schedule yarat.
 */
export async function createBackupSchedule(input: BackupScheduleInput): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTIONS.backupSchedules), {
    ...input,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Backup schedule yenilə.
 */
export async function updateBackupSchedule(
  id: string,
  updates: Partial<BackupScheduleInput>
): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.backupSchedules, id);
  await updateDoc(docRef, updates);
}

/**
 * Backup schedule sil.
 */
export async function deleteBackupSchedule(id: string): Promise<void> {
  const docRef = doc(db(), COLLECTIONS.backupSchedules, id);
  await deleteDoc(docRef);
}

/**
 * Backup schedule aktiv/deaktiv et.
 */
export async function toggleBackupSchedule(id: string, enabled: boolean): Promise<void> {
  await updateBackupSchedule(id, { enabled });
}

/**
 * Restore əməliyyatlarını siyahıla.
 */
export async function listRestoreOperations(): Promise<RestoreOperation[]> {
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.restoreOperations), orderBy("startedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RestoreOperation);
}

/**
 * Restore əməliyyatı başlat.
 */
export async function startRestore(
  backupId: string,
  collections: string[],
  userId: string
): Promise<string> {
  const backup = await getDatabaseBackup(backupId);
  if (!backup) throw new Error("Backup not found");
  if (backup.status !== "completed") throw new Error("Backup is not completed");

  const docRef = await addDoc(collection(db(), COLLECTIONS.restoreOperations), {
    backupId,
    status: "in-progress",
    startedAt: new Date().toISOString(),
    collections,
    restoredDocuments: 0,
    progress: 0,
    restoredBy: userId,
  });

  // Mock restore process
  // Real implementation would restore data from backup file
  setTimeout(async () => {
    await updateDoc(doc(db(), COLLECTIONS.restoreOperations, docRef.id), {
      status: "completed",
      completedAt: new Date().toISOString(),
      restoredDocuments: backup.totalDocuments,
      progress: 100,
    });
  }, 5000);

  return docRef.id;
}

/**
 * Backup statistikası hesabla.
 */
export async function getBackupStats(): Promise<BackupStats> {
  const backups = await listDatabaseBackups();
  const schedules = await listBackupSchedules();

  const successfulBackups = backups.filter((b) => b.status === "completed");
  const failedBackups = backups.filter((b) => b.status === "failed");

  const totalSize = successfulBackups.reduce((sum, b) => sum + b.size, 0);
  const averageSize = successfulBackups.length > 0 ? totalSize / successfulBackups.length : 0;

  const lastSuccessfulBackup = successfulBackups[0];

  // Trend (last 30 days)
  const now = new Date();
  const trend: { date: string; count: number; totalSize: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayBackups = backups.filter((b) => b.createdAt.startsWith(dateStr));
    const daySize = dayBackups.reduce((sum, b) => sum + b.size, 0);

    trend.push({
      date: dateStr,
      count: dayBackups.length,
      totalSize: daySize,
    });
  }

  return {
    totalBackups: backups.length,
    successfulBackups: successfulBackups.length,
    failedBackups: failedBackups.length,
    totalSize,
    averageSize,
    lastBackupDate: lastSuccessfulBackup?.createdAt,
    lastSuccessfulBackup,
    activeSchedules: schedules.filter((s) => s.enabled).length,
    trend,
  };
}

/**
 * Köhnə backup-ları sil (retention policy).
 */
export async function cleanupOldBackups(retentionDays: number): Promise<number> {
  const backups = await listDatabaseBackups();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const oldBackups = backups.filter((b) => new Date(b.createdAt) < cutoffDate);

  for (const backup of oldBackups) {
    await deleteBackup(backup.id);
    // Real implementation would also delete storage file
  }

  return oldBackups.length;
}

/**
 * Export data as JSON (for manual download).
 */
export async function exportCollectionData(collectionName: string): Promise<any[]> {
  const snap = await getDocs(collection(db(), collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Import data from JSON.
 */
export async function importCollectionData(
  collectionName: string,
  data: any[]
): Promise<number> {
  let imported = 0;

  for (const item of data) {
    const { id, ...docData } = item;
    
    if (id) {
      // Update existing document
      await setDoc(doc(db(), collectionName, id), docData);
    } else {
      // Create new document
      await addDoc(collection(db(), collectionName), docData);
    }
    
    imported++;
  }

  return imported;
}
