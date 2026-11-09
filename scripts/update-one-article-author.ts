/**
 * Bir test məqaləyə authorLocalized əlavə etmək
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, limit, query } from 'firebase/firestore';
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

const authorLocalized = {
  az: "Paşa Quliyev",
  en: "Pasha Guliyev",
  ru: "Паша Гулиев",
  tr: "Paşa Quliyev",
  ar: "باشا قولييف",
};

async function updateOneArticle() {
  console.log("🔍 Bir məqalə tapılır...\n");

  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("❌ Heç bir məqalə tapılmadı!");
    return;
  }

  const docSnapshot = snapshot.docs[0];
  const data = docSnapshot.data();

  console.log(`📄 Məqalə: ${docSnapshot.id}`);
  console.log(`   Başlıq: ${data.title?.az || 'N/A'}`);
  console.log(`   Köhnə author: ${data.author}`);
  console.log(`   Köhnə authorLocalized: ${data.authorLocalized ? 'var' : 'yox'}\n`);

  try {
    const docRef = doc(db, "articles", docSnapshot.id);
    await updateDoc(docRef, {
      authorLocalized,
    });

    console.log(`✅ Uğurla yeniləndi!`);
    console.log(`\n📊 Yeni authorLocalized:`);
    console.log(`   🇦🇿 AZ: ${authorLocalized.az}`);
    console.log(`   🇬🇧 EN: ${authorLocalized.en}`);
    console.log(`   🇷🇺 RU: ${authorLocalized.ru}`);
    console.log(`   🇹🇷 TR: ${authorLocalized.tr}`);
    console.log(`   🇸🇦 AR: ${authorLocalized.ar}`);
    console.log(`\n🌐 Test edin:`);
    console.log(`   https://nesreenmagazine.az/az/${data.category}/${data.slug?.az || data.slug}`);
    console.log(`   https://nesreenmagazine.az/en/${data.category}/${data.slug?.en || data.slug}`);
    console.log(`   https://nesreenmagazine.az/ru/${data.category}/${data.slug?.ru || data.slug}`);
    console.log(`   https://nesreenmagazine.az/tr/${data.category}/${data.slug?.tr || data.slug}`);
    console.log(`   https://nesreenmagazine.az/ar/${data.category}/${data.slug?.ar || data.slug}`);
  } catch (error) {
    console.error(`❌ Xəta:`, error);
  }
}

updateOneArticle()
  .then(() => {
    console.log("\n✨ Tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Xəta baş verdi:", error);
    process.exit(1);
  });
