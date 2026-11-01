/**
 * List all articles with their slugs
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
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

async function listAllArticles() {
  console.log("\n📚 All Articles in Firestore:\n");
  
  try {
    const snapshot = await getDocs(
      query(collection(db, "articles"), orderBy("publishedAt", "desc"))
    );
    
    console.log(`Total articles: ${snapshot.docs.length}\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const slugType = typeof data.slug;
      const slugAz = slugType === "string" ? data.slug : data.slug?.az || "(yoxdur)";
      const titleAz = typeof data.title === "string" ? data.title : data.title?.az || "(yoxdur)";
      
      console.log(`${index + 1}. ${data.status === "published" ? "✅" : "📝"} ${doc.id}`);
      console.log(`   Title: ${titleAz.substring(0, 60)}${titleAz.length > 60 ? "..." : ""}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Slug (${slugType}): ${slugAz}`);
      console.log(`   URL: /az/${data.category}/${slugAz}`);
      console.log();
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

listAllArticles();
