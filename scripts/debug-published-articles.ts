import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

async function debugArticles() {
  const snapshot = await getDocs(collection(db, 'articles'));
  
  console.log('📊 Ümumi məqalələr:', snapshot.size);
  console.log('\n📋 Status bölgüsü:');
  
  const statuses: Record<string, number> = {};
  const publishedArticles: Array<{ id: string; title: string; category: string; slug: any }> = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    statuses[data.status] = (statuses[data.status] || 0) + 1;
    
    if (data.status === 'published') {
      const title = typeof data.title === 'object' ? data.title.az || data.title.en || data.title.ru : data.title;
      publishedArticles.push({ 
        id: doc.id, 
        title: title || 'Başlıqsız', 
        category: data.category || 'kateqoriyasız',
        slug: data.slug
      });
    }
  });
  
  Object.entries(statuses).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  
  console.log(`\n✅ Published məqalələr (${publishedArticles.length}):`);
  publishedArticles.forEach((art, i) => {
    console.log(`${i+1}. [${art.category}] ${art.title}`);
    if (art.slug && typeof art.slug === 'object') {
      console.log(`   Slug (az): ${art.slug.az || 'yoxdur'}`);
    }
  });
}

debugArticles()
  .then(() => process.exit(0))
  .catch(err => { 
    console.error('❌ Xəta:', err); 
    process.exit(1); 
  });
