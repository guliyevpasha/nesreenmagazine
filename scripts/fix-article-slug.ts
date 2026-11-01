/**
 * Fix article slug - convert Azerbaijani characters to Latin
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

function slugify(value: string): string {
  const azMap: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    Ə: "e", I: "i", İ: "i", Ö: "o", Ü: "u", Ğ: "g", Ş: "s", Ç: "c",
  };

  return value
    .split("")
    .map((char) => azMap[char] ?? char)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function fixArticleSlug() {
  const articleId = "gundem-musahibe-designer";
  const oldSlugAz = "azərbaycan-dizayner-parisdə";
  const newSlugAz = slugify(oldSlugAz);
  
  console.log("\n🔧 Fixing article slug...\n");
  console.log("Article ID:", articleId);
  console.log("Old slug.az:", oldSlugAz);
  console.log("New slug.az:", newSlugAz);
  console.log();
  
  try {
    await updateDoc(doc(db, "articles", articleId), {
      "slug.az": newSlugAz,
      updatedAt: new Date().toISOString(),
    });
    
    console.log("✅ Article slug updated successfully!");
    console.log("\nNew URL: /az/gundem/" + newSlugAz);
    console.log();
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

fixArticleSlug();
