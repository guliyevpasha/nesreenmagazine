/**
 * Məqalələrin saytda görünüb-görünmədiyini test edir
 * Əmr: npx tsx scripts/test-articles-visible.ts
 * 
 * Server işləməlidir: npm run dev
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables
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

async function testArticlesVisible() {
  console.log("🧪 Məqalələrin görünməsi test edilir...\n");

  try {
    // Firebase-dən published məqalələri al
    const publishedQuery = query(
      collection(db, "articles"),
      where("status", "==", "published")
    );
    
    const snapshot = await getDocs(publishedQuery);

    if (snapshot.empty) {
      console.log("❌ Heç bir published məqalə tapılmadı!");
      return;
    }

    console.log(`✅ Firebase-də ${snapshot.docs.length} published məqalə var\n`);

    // Hər bir məqaləni test et
    let visibleCount = 0;
    let invisibleCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const title = typeof data.title === "string" ? data.title : data.title?.az || "N/A";
      const category = data.category;
      const slug = data.slug;

      if (!category || !slug) {
        console.log(`⚠️  [SKIP] ${title} - category və ya slug yoxdur`);
        continue;
      }

      // Kateqoriya səhifəsini yoxla
      const categoryUrl = `http://localhost:3000/az/${category}`;
      
      try {
        const response = await fetch(categoryUrl);
        
        if (!response.ok) {
          console.log(`❌ [${response.status}] ${title}`);
          console.log(`   URL: ${categoryUrl}`);
          invisibleCount++;
          continue;
        }

        const html = await response.text();
        
        // Məqalənin slug-unu HTML-də axtarırıq
        if (html.includes(slug)) {
          console.log(`✅ [GÖRÜNÜR] ${title}`);
          console.log(`   Kateqoriya: ${category}`);
          console.log(`   URL: http://localhost:3000/az/${category}/${slug}`);
          visibleCount++;
        } else {
          console.log(`⚠️  [GÖRÜNMÜR] ${title}`);
          console.log(`   Kateqoriya: ${category}`);
          console.log(`   Səbəb: HTML-də slug tapılmadı`);
          invisibleCount++;
        }
        
        console.log("");
      } catch (error: any) {
        if (error.code === "ECONNREFUSED") {
          console.error("❌ Server işləmir!");
          console.log("\n💡 Dev serveri başladın:");
          console.log("   npm run dev");
          return;
        }
        console.error(`❌ Xəta: ${title}`, error.message);
        invisibleCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Görünən məqalələr: ${visibleCount}`);
    console.log(`❌ Görünməyən məqalələr: ${invisibleCount}`);
    console.log("=".repeat(50));

    if (invisibleCount > 0) {
      console.log("\n💡 Məqalələr görünmürsə:");
      console.log("   1. Cache təmizləyin: npx tsx scripts/clear-cache.ts");
      console.log("   2. Dev serveri restart edin");
      console.log("   3. Brauzeri hard refresh edin: Ctrl+Shift+R");
    } else {
      console.log("\n🎉 Bütün məqalələr saytda görünür!");
    }

  } catch (error) {
    console.error("❌ Xəta baş verdi:", error);
  }
}

testArticlesVisible();
