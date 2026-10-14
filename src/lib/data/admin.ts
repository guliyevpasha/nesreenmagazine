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
  Article,
  ArticleInput,
  Ejournal,
  EjournalInput,
  LocalizedText,
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
  const snapshot = await getDocs(
    query(collection(db(), COLLECTIONS.articles), orderBy("publishedAt", "desc")),
  );
  return snapshot.docs.map((item) => ({
    ...(item.data() as Omit<Article, "id">),
    id: item.id,
  }));
}

export async function getArticle(id: string): Promise<Article | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.articles, id));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as Omit<Article, "id">), id: snapshot.id };
}

export async function createArticle(input: ArticleInput): Promise<string> {
  const created = await addDoc(collection(db(), COLLECTIONS.articles), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
  return created.id;
}

export async function saveArticle(id: string, input: ArticleInput): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.articles, id), {
    ...input,
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
