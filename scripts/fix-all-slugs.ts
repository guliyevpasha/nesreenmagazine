/**
 * Fix all article slugs - convert Azerbaijani characters to Latin
 */

import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
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

function hasAzerbaijaniChars(str: string): boolean {
  return /[əıöüğşçƏIİÖÜĞŞÇ]/.test(str);
}

async function fixAllSlugs() {
  console.log("\n🔧 Fixing all article slugs...\n");
  
  try {
    const snapshot = await getDocs(collection(db, "articles"));
    
    let fixed = 0;
    let skipped = 0;
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const slugType = typeof data.slug;
      
      if (slugType === "object" && data.slug) {
        // Check each locale
        const updates: Record<string, any> = {};
        let needsUpdate = false;
        
        for (const locale of ["az", "en", "ru", "tr", "ar"]) {
          const currentSlug = data.slug[locale];
          if (currentSlug && hasAzerbaijaniChars(currentSlug)) {
            const fixedSlug = slugify(currentSlug);
            updates[`slug.${locale}`] = fixedSlug;
            needsUpdate = true;
            
            console.log(`📝 ${docSnap.id} [${locale}]:`);
            console.log(`   Old: ${currentSlug}`);
            console.log(`   New: ${fixedSlug}`);
          }
        }
        
        if (needsUpdate) {
          updates.updatedAt = new Date().toISOString();
          await updateDoc(doc(db, "articles", docSnap.id), updates);
          fixed++;
          console.log(`   ✅ Updated\n`);
        } else {
          skipped++;
        }
      } else if (slugType === "string" && hasAzerbaijaniChars(data.slug)) {
        const fixedSlug = slugify(data.slug);
        console.log(`📝 ${docSnap.id} [string]:`);
        console.log(`   Old: ${data.slug}`);
        console.log(`   New: ${fixedSlug}`);
        
        await updateDoc(doc(db, "articles", docSnap.id), {
          slug: fixedSlug,
          updatedAt: new Date().toISOString(),
        });
        fixed++;
        console.log(`   ✅ Updated\n`);
      } else {
        skipped++;
      }
    }
    
    console.log(`\n✅ Done!`);
    console.log(`   Fixed: ${fixed} article(s)`);
    console.log(`   Skipped: ${skipped} article(s) (already correct)`);
    console.log();
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

fixAllSlugs();
