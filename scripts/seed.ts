/**
 * Nesreen Magazine — hazır məzmunu Firestore-a köçürür.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 *
 * İşlətmək:  npm run seed
 *
 * Nə edir:
 *   • src/lib/content qovluğundakı 15 məqaləni `articles` kolleksiyasına yazır
 *   • 12 bürcün şərhlərini `horoscopes` kolleksiyasına yazır
 *
 * Təhlükəsizdir: eyni məqalə (slug) artıq varsa üstündən yazılır, təkrarlanmır.
 * Yəni əmri bir neçə dəfə işlətmək olar.
 */
import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { seedArticles } from "../src/lib/content";
import { horoscopes } from "../src/lib/content/horoscopes";
import type { Article } from "../src/lib/types";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

if (!config.apiKey || !config.projectId) {
  console.error(
    "\n  Firebase açarları tapılmadı.\n" +
      "  .env.local faylını yaradıb NEXT_PUBLIC_FIREBASE_* dəyərlərini yazın,\n" +
      "  sonra yenidən `npm run seed` işlədin.\n",
  );
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

async function seed() {
  console.log(`\n  Firestore layihəsi: ${config.projectId}\n`);

  /* ---------------------------- Məqalələr ---------------------------- */

  const existing = await getDocs(collection(db, "articles"));
  const idBySlug = new Map<string, string>();
  for (const item of existing.docs) {
    const data = item.data() as Article;
    if (data.slug) idBySlug.set(data.slug, item.id);
  }

  const batch = writeBatch(db);
  let created = 0;
  let updated = 0;

  for (const article of seedArticles) {
    const { id: seedId, ...rest } = article;
    const existingId = idBySlug.get(article.slug);
    const target = doc(db, "articles", existingId ?? seedId);

    batch.set(target, { ...rest, updatedAt: new Date().toISOString() });
    if (existingId) updated += 1;
    else created += 1;
  }

  await batch.commit();
  console.log(`  Məqalələr:   ${created} yeni, ${updated} yeniləndi`);

  /* -------------------------- Bürc şərhləri -------------------------- */

  let signs = 0;
  for (const [sign, value] of Object.entries(horoscopes)) {
    if (!value) continue;
    await setDoc(doc(db, "horoscopes", sign), {
      ...value,
      updatedAt: new Date().toISOString(),
    });
    signs += 1;
  }
  console.log(`  Bürclər:     ${signs} bürcün şərhi yazıldı`);

  console.log("\n  Hazırdır. Saytı yeniləyin — məzmun artıq Firestore-dan gəlir.\n");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n  Xəta:", error, "\n");
    process.exit(1);
  });
