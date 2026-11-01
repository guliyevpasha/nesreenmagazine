/**
 * Debug script - məqaləni slug-a görə tap və status yoxla
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

async function debugArticleBySlug() {
  const slug = "azerbaycan-dizayner-parisde";
  const locale = "az";
  
  console.log(`\n🔍 Searching for article with slug: "${slug}" (locale: ${locale})\n`);
  
  try {
    // 1. Köhnə formatda axtarış (slug string)
    console.log("1️⃣ Checking old format (slug as string)...");
    const oldFormatSnapshot = await getDocs(
      query(collection(db, "articles"), where("slug", "==", slug))
    );
    
    if (!oldFormatSnapshot.empty) {
      oldFormatSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("✅ Found (old format):");
        console.log("   ID:", doc.id);
        console.log("   Status:", data.status);
        console.log("   Category:", data.category);
        console.log("   Slug:", data.slug);
        console.log("   Title.az:", data.title?.az || data.title);
        console.log("   PublishedAt:", data.publishedAt);
      });
    } else {
      console.log("❌ Not found in old format");
    }
    
    // 2. Yeni formatda axtarış (slug.az)
    console.log("\n2️⃣ Checking new format (slug.az)...");
    const fieldPath = `slug.${locale}`;
    const newFormatSnapshot = await getDocs(
      query(collection(db, "articles"), where(fieldPath, "==", slug))
    );
    
    if (!newFormatSnapshot.empty) {
      newFormatSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("✅ Found (new format):");
        console.log("   ID:", doc.id);
        console.log("   Status:", data.status);
        console.log("   Category:", data.category);
        console.log("   Slug.az:", data.slug?.az);
        console.log("   Slug.en:", data.slug?.en);
        console.log("   Title.az:", data.title?.az);
        console.log("   PublishedAt:", data.publishedAt);
        console.log("\n   Full slug object:", JSON.stringify(data.slug, null, 2));
      });
    } else {
      console.log("❌ Not found in new format");
    }
    
    // 3. Bütün published məqalələr
    console.log("\n3️⃣ Checking all published articles...");
    const allPublishedSnapshot = await getDocs(
      query(collection(db, "articles"), where("status", "==", "published"))
    );
    
    console.log(`📊 Total published articles: ${allPublishedSnapshot.docs.length}`);
    
    // Slug-a oxşar məqalələri tap
    const similar = allPublishedSnapshot.docs.filter((doc) => {
      const data = doc.data();
      const slugAz = typeof data.slug === "string" ? data.slug : data.slug?.az;
      return slugAz && slugAz.includes("azerbaycan");
    });
    
    if (similar.length > 0) {
      console.log(`\n📝 Found ${similar.length} article(s) with "azerbaycan" in slug:`);
      similar.forEach((doc) => {
        const data = doc.data();
        const slugAz = typeof data.slug === "string" ? data.slug : data.slug?.az;
        console.log(`   - ${doc.id}: ${slugAz} (${data.status})`);
      });
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
  
  console.log("\n✅ Debug complete!\n");
  process.exit(0);
}

debugArticleBySlug();
