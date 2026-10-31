/**
 * Firebase konfiqurasiyası
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 * 
 * Bütün açarlar .env.local faylında olmalıdır
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { logger } from "@/lib/logger";

/** Environment variable-ı yoxlayır, yoxdursa boş string qaytarır */
const getEnvValue = (envVar: string | undefined): string => {
  return envVar?.trim() || '';
};

export const firebaseConfig = {
  apiKey: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: getEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

// Debug log (development only)
if (typeof window !== "undefined") {
  logger.debug("Firebase Config:", {
    apiKeyPresent: firebaseConfig.apiKey.length > 0,
    projectId: firebaseConfig.projectId,
  });
}

/** Firebase-in qoşulub-qoşulmadığını göstərir. */
export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.appId.length > 0;

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

if (isFirebaseConfigured && typeof window !== "undefined") {
  // Only initialize on client side
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

export { app, db, storage, auth };

/** Firestore kolleksiyalarının adları. */
export const COLLECTIONS = {
  articles: "articles",
  staff: "staff",
  horoscopes: "horoscopes",
  banners: "banners",
  subscribers: "subscribers",
  messages: "messages",
  ejournals: "ejournals",
  // CRM
  crmClients: "crmClients",
  crmActivities: "crmActivities",
  adOrders: "adOrders",
  contentPlan: "contentPlan",
  // SEO
  seoRedirects: "seoRedirects",
  seoSettings: "seoSettings",
  // Sayt parametrləri
  siteSettings: "siteSettings",
  // Audit jurnalı
  auditLogs: "auditLogs",
  // Bildirişlər
  notifications: "notifications",
  // Versiya tarixçəsi
  articleVersions: "articleVersions",
  // E-kitab bannerləri (əvvəl hardcoded idi)
  ebookBanners: "ebookBanners",
  // Analytics
  pageViews: "pageViews",
  articleAnalytics: "articleAnalytics",
  sessions: "sessions",
  dailyAnalytics: "dailyAnalytics",
  crmAnalytics: "crmAnalytics",
  revenueAnalytics: "revenueAnalytics",
  // Şərhlər
  comments: "comments",
  // İstifadəçilər
  frontendUsers: "frontendUsers",
  userReadingHistory: "userReadingHistory",
  userActivities: "userActivities",
  // E-Jurnal satışları
  ejournalOrders: "ejournalOrders",
  ejournalDownloads: "ejournalDownloads",
  // Üzvlük planları
  subscriptionPlans: "subscriptionPlans",
  userSubscriptions: "userSubscriptions",
  subscriptionPayments: "subscriptionPayments",
  // Push bildirişlər
  pushCampaigns: "pushCampaigns",
  pushTemplates: "pushTemplates",
  userFcmTokens: "userFcmTokens",
  pushDeliveryLogs: "pushDeliveryLogs",
  // Tərcümə
  articleTranslations: "articleTranslations",
  translationJobs: "translationJobs",
  // Kateqoriyalar
  enhancedCategories: "enhancedCategories",
  categoryStats: "categoryStats",
  // Tag-lar
  tags: "tags",
  // Media idarəetmə
  mediaFolders: "mediaFolders",
  mediaFiles: "mediaFiles",
  // Performans monitoring
  pagePerformance: "pagePerformance",
  optimizationTips: "optimizationTips",
  // Backup & Restore
  databaseBackups: "databaseBackups",
  backupSchedules: "backupSchedules",
  restoreOperations: "restoreOperations",
} as const;

/** Saytın kanonik ünvanı — metadata və sitemap üçün. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://nesreenmagazine.com";
