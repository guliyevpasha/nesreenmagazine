/**
 * Firebase-də olan məqalələrin statusunu yoxlayır
 * Əmr: npx tsx scripts/check-articles-status.ts
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
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

async function checkArticlesStatus() {
  console.log("🔍 Firebase-də məqalələr yoxlanılır...\n");

  try {
    const articlesSnapshot = await getDocs(collection(db, "articles"));
    
    if (articlesSnapshot.empty) {
      console.log("❌ Heç bir məqalə tapılmadı!");
      return;
    }

    console.log(`📊 Ümumi məqalə sayı: ${articlesSnapshot.docs.length}\n`);

    const statusCounts = {
      draft: 0,
      published: 0,
      scheduled: 0,
      undefined: 0,
    };

    const articles: any[] = [];

    articlesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const status = data.status || "undefined";
      
      statusCounts[status as keyof typeof statusCounts] = (statusCounts[status as keyof typeof statusCounts] || 0) + 1;
      
      articles.push({
        id: doc.id,
        slug: data.slug,
        title: typeof data.title === "string" ? data.title : data.title?.az || "Başlıq yoxdur",
        category: data.category,
        status: status,
        publishedAt: data.publishedAt,
      });
    });

    console.log("📈 Status statistikası:");
    console.log(`   ✅ Published: ${statusCounts.published}`);
    console.log(`   📝 Draft: ${statusCounts.draft}`);
    console.log(`   ⏰ Scheduled: ${statusCounts.scheduled}`);
    console.log(`   ❓ Undefined: ${statusCounts.undefined}`);
    console.log("");

    // Sort by publishedAt (newest first)
    articles.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    console.log("📄 Bütün məqalələr:\n");
    articles.forEach((article, index) => {
      const statusIcon =
        article.status === "published"
          ? "✅"
          : article.status === "draft"
          ? "📝"
          : article.status === "scheduled"
          ? "⏰"
          : "❓";
      
      console.log(
        `${index + 1}. ${statusIcon} [${article.status?.toUpperCase() || "UNDEFINED"}] ${article.title}`
      );
      console.log(`   ID: ${article.id}`);
      console.log(`   Slug: ${article.slug || "slug yoxdur"}`);
      console.log(`   Category: ${article.category || "category yoxdur"}`);
      console.log(`   Published: ${article.publishedAt || "tarix yoxdur"}`);
      console.log("");
    });

    // Highlight recent non-published articles
    const recentDrafts = articles.filter(
      (a) => a.status !== "published" && new Date(a.publishedAt || 0).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
    );

    if (recentDrafts.length > 0) {
      console.log("\n⚠️  Son 30 gündə draft statusunda qalan məqalələr:");
      recentDrafts.forEach((article) => {
        console.log(`   - ${article.title} (${article.id})`);
      });
    }

  } catch (error) {
    console.error("❌ Xəta baş verdi:", error);
  }
}

checkArticlesStatus();
