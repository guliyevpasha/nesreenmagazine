/**
 * Fix specific article - update slug to match title
 */

import { initializeApp } from "firebase/app";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
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

async function fixArticle() {
  const articleId = "gundem-musahibe-designer";
  
  console.log("\n🔧 Fixing article slug...\n");
  
  const newSlug = {
    az: "ben-affleck-yeniden-asiq-olmaga-hazirdir",
    en: "ben-affleck-ready-for-new-relationship",
    ru: "ben-afflek-gotov-k-novym-otnosheniyam",
    tr: "ben-affleck-yeni-iliskiye-hazir",
    ar: "bn-aflk-jahz-llqh-jdydh"
  };
  
  console.log("Article ID:", articleId);
  console.log("New slug.az:", newSlug.az);
  console.log();
  
  try {
    await updateDoc(doc(db, "articles", articleId), {
      slug: newSlug,
      updatedAt: new Date().toISOString(),
    });
    
    console.log("✅ Article updated successfully!");
    console.log("\nNew URLs:");
    console.log("  AZ: /az/gundem/" + newSlug.az);
    console.log("  EN: /en/gundem/" + newSlug.en);
    console.log();
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

fixArticle();
