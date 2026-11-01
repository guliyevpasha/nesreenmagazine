/**
 * Check article size
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

async function checkArticleSize() {
  const articleId = "gundem-musahibe-designer";
  
  console.log("\n📊 Checking article size...\n");
  
  try {
    const docSnap = await getDoc(doc(db, "articles", articleId));
    
    if (!docSnap.exists()) {
      console.log("❌ Article not found");
      process.exit(1);
    }
    
    const data = docSnap.data();
    const jsonSize = JSON.stringify(data).length;
    const jsonSizeKB = (jsonSize / 1024).toFixed(2);
    const jsonSizeMB = (jsonSize / 1048576).toFixed(2);
    
    console.log("Article ID:", articleId);
    console.log("Title:", data.title?.az || data.title);
    console.log();
    console.log("Size:", jsonSize, "bytes");
    console.log("     ", jsonSizeKB, "KB");
    console.log("     ", jsonSizeMB, "MB");
    console.log();
    
    // Check body sizes
    const bodyAz = data.body?.az || data.body || "";
    const bodyEn = data.body?.en || "";
    
    console.log("Body.az length:", bodyAz.length, "chars");
    console.log("Body.en length:", bodyEn.length, "chars");
    console.log();
    
    // Check for base64 images
    const base64Count = (bodyAz.match(/data:image/g) || []).length;
    if (base64Count > 0) {
      console.log("⚠️  Found", base64Count, "base64 image(s) in body.az!");
      console.log("    This may cause payload size issues.");
    }
    
    if (jsonSize > 1048576) {
      console.log("❌ Article is TOO LARGE (>1 MB)!");
      console.log("    Firestore limit is 1 MB per document");
    } else if (jsonSize > 524288) {
      console.log("⚠️  Article is large (>500 KB)");
      console.log("   Consider optimizing");
    } else {
      console.log("✅ Article size is OK");
    }
    
    console.log();
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  process.exit(0);
}

checkArticleSize();
