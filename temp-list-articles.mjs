import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

async function listAllArticles() {
  const snapshot = await getDocs(collection(db, 'articles'));
  
  console.log('Ümumi məqalələr:', snapshot.size);
  console.log('\nStatus bölgüsü:');
  
  const statuses = {};
  const publishedArticles = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    statuses[data.status] = (statuses[data.status] || 0) + 1;
    
    if (data.status === 'published') {
      const title = typeof data.title === 'object' ? data.title.az || data.title.en : data.title;
      publishedArticles.push({ id: doc.id, title, category: data.category });
    }
  });
  
  Object.entries(statuses).forEach(([status, count]) => {
    console.log(\  \: \\);
  });
  
  console.log('\nPublished məqalələr:');
  publishedArticles.forEach((art, i) => {
    console.log(\\. [\] \\);
  });
}

listAllArticles().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
