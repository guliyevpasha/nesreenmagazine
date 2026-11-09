/**
 * Bütün homepage bölmələri üçün boş sənədlər yaradır
 * Əgər sənəd artıq varsa, onu dəyişməz
 * 
 * İstifadə: npx tsx scripts/seed-homepage-sections.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
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

const SECTIONS = [
  'weekly-main-topic',
  'latest-articles',
  'moda-editorial',
  'moda-most-read',
  'gozellik-editorial',
  'gozellik-most-read',
  'heyat-terzi-editorial',
  'heyat-terzi-most-read',
  'biznes-editorial',
  'biznes-most-read',
] as const;

const LOCALES = ['az', 'en', 'ru', 'tr', 'ar'] as const;

async function seedHomepageSections() {
  console.log('🌱 Homepage bölmələri yaradılır...\n');
  
  let created = 0;
  let existing = 0;
  
  for (const sectionId of SECTIONS) {
    for (const locale of LOCALES) {
      const docId = `${sectionId}-${locale}`;
      const docRef = doc(db, 'homepageEditorial', docId);
      
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log(`⏭️  ${docId} artıq mövcuddur`);
        existing++;
      } else {
        const emptySection = {
          sectionId,
          locale,
          articleIds: [],
          updatedBy: 'system',
          updatedByName: 'System Seed',
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        
        await setDoc(docRef, emptySection);
        console.log(`✅ ${docId} yaradıldı`);
        created++;
      }
    }
  }
  
  console.log(`\n📊 Xülasə:`);
  console.log(`   ✅ Yaradıldı: ${created}`);
  console.log(`   ⏭️  Mövcud idi: ${existing}`);
  console.log(`   📦 Ümumi: ${SECTIONS.length * LOCALES.length}`);
}

seedHomepageSections()
  .then(() => {
    console.log('\n✨ Uğurla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Xəta:', error);
    process.exit(1);
  });
