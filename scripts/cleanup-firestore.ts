/**
 * Firestore Cleanup Script
 * 
 * Bu script Firestore-dakı köhnə formatda məlumatları silir
 * və proyekti təmiz vəziyyətə gətirir.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin SDK initialize
if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId) {
    console.error('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is required');
    process.exit(1);
  }

  // Client-side SDK ilə işləyək
  console.log('⚠️  Admin SDK credentials yoxdur, client SDK istifadə edəcəyik');
  console.log('Firebase Console-dan manual olaraq articles kolleksiyasını silin:');
  console.log('https://console.firebase.google.com/project/nesreen-magazine/firestore/data');
  console.log('\n1. articles kolleksiyasına keçin');
  console.log('2. Hər bir sənədi seçib silin');
  console.log('3. Və ya Firestore Database-i tam sıfırlayın (Settings → Delete database)');
  process.exit(0);
}

const db = getFirestore();

async function cleanupArticles() {
  console.log('🗑️  Köhnə məqalələr silinir...');
  
  const articlesRef = db.collection('articles');
  const snapshot = await articlesRef.get();
  
  if (snapshot.empty) {
    console.log('✅ Articles kolleksiyası artıq boşdur');
    return;
  }

  console.log(`📊 ${snapshot.size} məqalə tapıldı`);
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log('✅ Bütün köhnə məqalələr silindi');
}

async function cleanupAnalytics() {
  console.log('🗑️  Köhnə analytics məlumatları silinir...');
  
  const collections = ['analytics_daily', 'analytics_totals', 'analytics_visitors'];
  
  for (const collectionName of collections) {
    const ref = db.collection(collectionName);
    const snapshot = await ref.get();
    
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ ${collectionName} silindi (${snapshot.size} sənəd)`);
    }
  }
}

async function main() {
  console.log('🚀 Firestore Cleanup başlayır...\n');
  
  try {
    await cleanupArticles();
    await cleanupAnalytics();
    
    console.log('\n✅ Cleanup tamamlandı!');
    console.log('\n📝 Növbəti addım:');
    console.log('npm run seed - yeni formatda məlumatları yüklə');
  } catch (error) {
    console.error('❌ Xəta:', error);
    process.exit(1);
  }
}

main();
