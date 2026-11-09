import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
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

async function checkArticle() {
  const slug = 'nesreenmagazine.com/az/gundem/saba-tumur-seksi-heyat-hansi-kisilerden-uzaqlas';
  
  console.log('Slug axtarılır:', slug);
  
  // Bütün published məqalələri yüklə
  const q = query(collection(db, 'articles'), where('status', '==', 'published'));
  const snapshot = await getDocs(q);
  
  console.log('Ümumi published məqalələr:', snapshot.size);
  
  // Slug-da olan məqalələri tap
  snapshot.forEach(doc => {
    const data = doc.data();
    const slugObj = data.slug;
    
    if (typeof slugObj === 'object') {
      const allSlugs = Object.values(slugObj).join(' | ');
      if (allSlugs.includes('saba-tumur')) {
        console.log('\nTapıldı!');
        console.log('ID:', doc.id);
        console.log('Title:', data.title);
        console.log('Slug:', slugObj);
        console.log('Status:', data.status);
        console.log('Category:', data.category);
      }
    }
  });
}

checkArticle().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
