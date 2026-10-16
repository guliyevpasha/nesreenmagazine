/**
 * Firebase konfiqurasiyası .env.local faylından oxunur.
 * Açarlar hələ əlavə edilməyibsə, sayt `src/lib/content` qovluğundakı
 * hazır məqalələrlə (seed) işləyir — heç nə sınmır.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

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
} as const;

/** Saytın kanonik ünvanı — metadata və sitemap üçün. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://nesreenmagazine.com";
