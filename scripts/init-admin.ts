/**
 * İlk admin staff sənədini yaradır
 * .env.local faylındakı NEXT_PUBLIC_ADMIN_EMAILS əsasında
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local faylını oxu
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

async function initAdmin() {
  // İki admin yaradaq
  const admins = [
    {
      email: 'info@nesreenmagazine.com',
      name: 'Paşa Quliyev',
      role: 'admin' as const,
    },
    {
      email: 'nesreenmuse@icloud.com',
      name: 'Nesrin Abbasova',
      role: 'author' as const,
      categories: ['moda', 'gozellik'], // Yazar üçün kateqoriyalar
    },
  ];
  
  console.log(`📧 ${admins.length} staff üzvü yaradılacaq...`);
  
  for (const admin of admins) {
    const staffId = admin.email.toLowerCase();
    const staffRef = doc(db, 'staff', staffId);
    
    await setDoc(staffRef, {
      email: admin.email.toLowerCase(),
      name: admin.name,
      role: admin.role,
      active: true,
      categories: admin.categories || [],
      subcategories: {},
      createdAt: new Date().toISOString(),
      invitedBy: 'system',
    });
    
    console.log(`✅ Staff sənədi yaradıldı: ${admin.name} (${admin.role})`);
  }
  
  console.log('\n🎉 Staff üzvləri hazırdır!');
  console.log('📝 Firebase Authentication-da hesablar yaratmaq lazımdır:');
  console.log('   1. info@nesreenmagazine.com → Şifrə: @Stuff_2014_96');
  console.log('   2. nesreenmuse@icloud.com → Şifrə: [sizin seçdiyiniz]');
}

initAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Xəta:', error);
    process.exit(1);
  });
