/**
 * Find article by partial slug match
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

async function findSlug() {
  const searchTerm = "ben-affleck";
  
  console.log(`\n🔍 Searching for articles with "${searchTerm}" in slug...\n`);
  
  try {
    const snapshot = await getDocs(
      query(collection(db, "articles"), where("status", "==", "published"))
    );
    
    const matches = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const slugAz = typeof data.slug === "string" ? data.slug : data.slug?.az || "";
      return slugAz.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    if (matches.length === 0) {
      console.log("❌ No articles found");
    } else {
      console.log(`✅ Found ${matches.length} article(s):\n`);
      matches.forEach((doc) => {
        const data = doc.data();
        const slugAz = typeof data.slug === "string" ? data.slug : data.slug?.az;
        const titleAz = typeof data.title === "string" ? data.title : data.title?.az;
        
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${titleAz}`);
        console.log(`Slug: ${slugAz}`);
        console.log(`Category: ${data.category}`);
        console.log(`Status: ${data.status}`);
        console.log(`URL: /az/${data.category}/${slugAz}`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

findSlug();
