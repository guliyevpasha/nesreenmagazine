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
