/**
 * Draft statusunda olan məqalələri toplu şəkildə published edir
 * Əmr: npx tsx scripts/bulk-publish-articles.ts
 * 
 * DİQQƏT: Bu skript bütün draft məqalələri published edəcək!
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, updateDoc, doc, getFirestore, query, where } from "firebase/firestore";
import * as dotenv from "dotenv";
import * as readline from "readline";

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

// Readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function bulkPublishArticles() {
  console.log("🔍 Draft məqalələr axtarılır...\n");

  try {
    // Yalnız draft statuslu məqalələri al
    const draftQuery = query(
      collection(db, "articles"),
      where("status", "==", "draft")
    );
    
    const snapshot = await getDocs(draftQuery);

    if (snapshot.empty) {
      console.log("✅ Heç bir draft məqalə tapılmadı! Bütün məqalələr artıq published.");
      rl.close();
      return;
    }

    console.log(`📊 Tapılan draft məqalələr: ${snapshot.docs.length}\n`);

    // Draft məqalələri göstər
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const title = typeof data.title === "string" ? data.title : data.title?.az || "Başlıq yoxdur";
      console.log(`${index + 1}. ${title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Slug: ${data.slug || "slug yoxdur"}`);
      console.log("");
    });

    // Təsdiq al
    const answer = await askQuestion(
      `\n⚠️  ${snapshot.docs.length} məqalə published ediləcək. Davam etmək istəyirsiniz? (yes/no): `
    );

    if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
      console.log("❌ Əməliyyat ləğv edildi.");
      rl.close();
      return;
    }

    console.log("\n🚀 Məqalələr published edilir...\n");

    let successCount = 0;
    let errorCount = 0;

    // Hər bir draft məqaləni published et
    for (const docSnapshot of snapshot.docs) {
      try {
        const data = docSnapshot.data();
        const title = typeof data.title === "string" ? data.title : data.title?.az || "N/A";
        
        await updateDoc(doc(db, "articles", docSnapshot.id), {
          status: "published",
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log(`✅ Published: ${title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Xəta: ${docSnapshot.id}`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Uğurlu: ${successCount}`);
    console.log(`❌ Xətalı: ${errorCount}`);
    console.log("=".repeat(50));

    if (successCount > 0) {
      console.log("\n💡 İndi cache-i təmizləyin:");
      console.log("   npx tsx scripts/clear-cache.ts");
      console.log("\nVə ya dev serveri restart edin:");
      console.log("   npm run dev");
    }

    rl.close();
  } catch (error) {
    console.error("❌ Xəta baş verdi:", error);
    rl.close();
  }
}

bulkPublishArticles();
