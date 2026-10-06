/**
 * Firebase konfiqurasiyası .env.local faylından oxunur.
 * Açarlar hələ əlavə edilməyibsə, sayt `src/lib/content` qovluğundakı
 * hazır məqalələrlə (seed) işləyir — heç nə sınmır.
 */
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

/** Firestore kolleksiyalarının adları. */
export const COLLECTIONS = {
  articles: "articles",
  staff: "staff",
  horoscopes: "horoscopes",
  banners: "banners",
  subscribers: "subscribers",
  messages: "messages",
  ejournals: "ejournals",
} as const;

/** Saytın kanonik ünvanı — metadata və sitemap üçün. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://nesreenmagazine.com";
