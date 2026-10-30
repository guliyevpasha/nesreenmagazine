/**
 * Firestore-dakı staff sənədlərini yoxlayır
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function checkStaff() {
  console.log('📋 Staff sənədləri yoxlanılır...\n');
  
  const snapshot = await getDocs(collection(db, 'staff'));
  
  snapshot.forEach((doc) => {
    const data = doc.data();
    console.log('✅ Staff:', {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      active: data.active,
      categories: data.categories || [],
    });
    console.log('');
  });
  
  console.log(`Ümumi: ${snapshot.size} staff üzvü`);
}

checkStaff()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Xəta:', error);
    process.exit(1);
  });
