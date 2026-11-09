/**
 * Test getArticleBySlug function
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

async function testGetBySlug() {
  const slug = "ben-affleck-yeniden-asiq-olmaga-hazirdir";
  const locale = "az";
  const fieldPath = `slug.${locale}`;
  
  console.log("\n🧪 Testing getArticleBySlug...\n");
  console.log("Slug:", slug);
  console.log("Locale:", locale);
  console.log("Field path:", fieldPath);
  console.log();
  
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "articles"),
        where(fieldPath, "==", slug),
      ),
    );
    
    if (snapshot.empty) {
      console.log("❌ Article NOT found with this query");
      console.log("\nLet's check what slug values exist...\n");
      
      // Check all articles
      const allSnapshot = await getDocs(collection(db, "articles"));
      allSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const slugAz = typeof data.slug === "string" ? data.slug : data.slug?.az;
        if (slugAz && slugAz.includes("ben-affleck")) {
          console.log("Found article:", doc.id);
          console.log("  Slug.az:", slugAz);
          console.log("  Match:", slugAz === slug ? "YES ✅" : "NO ❌");
          console.log();
        }
      });
    } else {
      console.log("✅ Article FOUND!");
      const doc = snapshot.docs[0];
      const data = doc.data();
      console.log("\nArticle ID:", doc.id);
      console.log("Title:", data.title?.az);
      console.log("Status:", data.status);
      console.log("Slug:", data.slug);
      console.log();
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

testGetBySlug();
