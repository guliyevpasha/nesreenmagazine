/**
 * Inspect article full details
 */

import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
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

async function inspectArticle() {
  const articleId = "gundem-musahibe-designer";
  
  console.log("\n🔍 Inspecting article...\n");
  
  try {
    const docSnap = await getDoc(doc(db, "articles", articleId));
    
    if (!docSnap.exists()) {
      console.log("❌ Article not found");
      process.exit(1);
    }
    
    const data = docSnap.data();
    
    console.log("Article ID:", articleId);
    console.log("\n--- SLUG ---");
    console.log("Type:", typeof data.slug);
    console.log("Value:", JSON.stringify(data.slug, null, 2));
    
    console.log("\n--- TITLE ---");
    console.log("Type:", typeof data.title);
    if (typeof data.title === "object") {
      console.log("title.az:", data.title.az);
      console.log("title.en:", data.title.en);
    } else {
      console.log("Value:", data.title);
    }
    
    console.log("\n--- BODY ---");
    console.log("Type:", typeof data.body);
    if (typeof data.body === "object") {
      console.log("body.az length:", data.body.az?.length || 0);
      console.log("body.en length:", data.body.en?.length || 0);
    } else {
      console.log("Length:", data.body?.length || 0);
    }
    
    console.log("\n--- OTHER FIELDS ---");
    console.log("Status:", data.status);
    console.log("Category:", data.category);
    console.log("PublishedAt:", data.publishedAt);
    console.log("Author:", data.author);
    
    console.log("\n--- ALL FIELDS ---");
    console.log("Fields:", Object.keys(data).sort().join(", "));
    
    console.log();
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

inspectArticle();
