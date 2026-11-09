/**
 * Mövcud məqalələrə authorLocalized field-i əlavə edir.
 * 
 * Hər müəllif üçün 5 dildə tərcümə əlavə edir:
 * - Az: Paşa Quliyev
 * - En: Pasha Guliyev
 * - Ru: Паша Гулиев
 * - Tr: Paşa Quliyev
 * - Ar: باشا قولييف
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Müəllif adlarının tərcümələri
const authorTranslations: Record<string, Record<string, string>> = {
  "Paşa Quliyev": {
    az: "Paşa Quliyev",
    en: "Pasha Guliyev",
    ru: "Паша Гулиев",
    tr: "Paşa Quliyev",
    ar: "باشا قولييف",
  },
  "PAŞA QULIYEV": {
    az: "Paşa Quliyev",
    en: "Pasha Guliyev",
    ru: "Паша Гулиев",
    tr: "Paşa Quliyev",
    ar: "باشا قولييف",
  },
  "Nesreen Magazine": {
    az: "Nesreen Magazine",
    en: "Nesreen Magazine",
    ru: "Nesreen Magazine",
    tr: "Nesreen Magazine",
    ar: "مجلة نسرين",
  },
  "Nesreen Editorial": {
    az: "Nesreen Redaksiyası",
    en: "Nesreen Editorial",
    ru: "Редакция Nesreen",
    tr: "Nesreen Redaksiyonu",
    ar: "تحرير نسرين",
  },
};

async function addAuthorLocalizedField() {
  console.log("🔍 Məqalələr yoxlanılır...\n");

  const articlesRef = collection(db, "articles");
  const snapshot = await getDocs(articlesRef);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const author = data.author;

    // Əgər artıq authorLocalized varsa, skip et
    if (data.authorLocalized) {
      console.log(`⏭️  ${docSnapshot.id} - artıq authorLocalized var, skip edilir`);
      skipped++;
      continue;
    }

    // Müəllifin tərcüməsini tap
    let authorLocalized = authorTranslations[author];

    // Əgər tərcümə yoxdursa, bütün dillərdə eyni adı saxla
    if (!authorLocalized) {
      console.log(`⚠️  "${author}" üçün tərcümə tapılmadı, bütün dillərdə eyni ad istifadə olunur`);
      authorLocalized = {
        az: author,
        en: author,
        ru: author,
        tr: author,
        ar: author,
      };
    }

    try {
      const docRef = doc(db, "articles", docSnapshot.id);
      await updateDoc(docRef, {
        authorLocalized,
      });

      console.log(`✅ ${docSnapshot.id} - "${author}" → authorLocalized əlavə edildi`);
      updated++;
    } catch (error) {
      console.error(`❌ ${docSnapshot.id} - Xəta:`, error);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Nəticə:`);
  console.log(`   ✅ Yeniləndi: ${updated}`);
  console.log(`   ⏭️  Skip edildi: ${skipped}`);
  console.log(`   ❌ Xəta: ${failed}`);
  console.log(`   📝 Ümumi: ${snapshot.size}`);
  console.log("=".repeat(50));
}

addAuthorLocalizedField()
  .then(() => {
    console.log("\n✨ Tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Xəta baş verdi:", error);
    process.exit(1);
  });
