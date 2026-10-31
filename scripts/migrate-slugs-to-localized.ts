/**
 * Slug Migration Script
 * 
 * Bu script mövcud məqalələrin slug field-ini string-dən LocalizedText-ə çevirir.
 * Hər dil üçün ayrı slug yaradır.
 * 
 * İstifadə:
 *   npx tsx scripts/migrate-slugs-to-localized.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Firebase Admin SDK-nı başlat
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

/** Başlıqdan URL üçün ünvan düzəldir - bütün 5 dili dəstəkləyir */
function slugify(value: string, locale: string = "az"): string {
  if (!value) return "";
  
  // Azərbaycan hərfləri
  const azMap: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    Ə: "e", I: "i", Ö: "o", Ü: "u", Ğ: "g", Ş: "s", Ç: "c",
  };
  
  // Rus hərfləri (Kiril)
  const ruMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    А: "a", Б: "b", В: "v", Г: "g", Д: "d", Е: "e", Ё: "e", Ж: "zh",
    З: "z", И: "i", Й: "y", К: "k", Л: "l", М: "m", Н: "n", О: "o",
    П: "p", Р: "r", С: "s", Т: "t", У: "u", Ф: "f", Х: "h", Ц: "ts",
    Ч: "ch", Ш: "sh", Щ: "sch", Ъ: "", Ы: "y", Ь: "", Э: "e", Ю: "yu", Я: "ya",
  };
  
  // Türk hərfləri
  const trMap: Record<string, string> = {
    ı: "i", ğ: "g", ü: "u", ş: "s", ö: "o", ç: "c",
    İ: "i", Ğ: "g", Ü: "u", Ş: "s", Ö: "o", Ç: "c",
  };
  
  // Ərəb hərfləri (sadələşdirilmiş transliterasiya)
  const arMap: Record<string, string> = {
    ا: "a", أ: "a", إ: "i", آ: "aa", ب: "b", ت: "t", ث: "th", ج: "j",
    ح: "h", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
    ص: "s", ض: "d", ط: "t", ظ: "dh", ع: "a", غ: "gh", ف: "f", ق: "q",
    ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y", ى: "a",
    ة: "h", ئ: "", ء: "", ؤ: "w",
  };
  
  // Bütün map-ləri birləşdir
  const combinedMap = { ...azMap, ...ruMap, ...trMap, ...arMap };

  return value
    .toLowerCase()
    .split("")
    .map((char) => combinedMap[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Aksent işarələrini sil
    .replace(/[^a-z0-9]+/g, "-") // Latın hərfləri və rəqəmlər istisna, qalanını - ilə əvəz et
    .replace(/^-+|-+$/g, "") // Əvvəl və sondakı - sil
    .slice(0, 80); // Maksimum 80 simvol
}

async function migrateArticleSlugs() {
  console.log("🔄 Məqalə slug-larını LocalizedText-ə çeviririk...\n");

  try {
    // Bütün məqalələri oxu
    const articlesRef = db.collection("articles");
    const snapshot = await articlesRef.get();

    if (snapshot.empty) {
      console.log("❌ Heç bir məqalə tapılmadı.");
      return;
    }

    console.log(`📚 ${snapshot.size} məqalə tapıldı.\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const articleId = doc.id;

      try {
        // Əgər slug artıq LocalizedText obyektidirsə, skip et
        if (typeof data.slug === "object" && data.slug !== null && !Array.isArray(data.slug)) {
          console.log(`⏭️  ${articleId}: Artıq LocalizedText formatındadır, keçirildi.`);
          skipped++;
          continue;
        }

        // Köhnə slug (string)
        const oldSlug = data.slug || "";
        
        // Title-ları oxu
        const title = data.title || {};
        const titleAz = typeof title === "string" ? title : (title.az || "");
        const titleEn = typeof title === "string" ? "" : (title.en || "");
        const titleRu = typeof title === "string" ? "" : (title.ru || "");
        const titleTr = typeof title === "string" ? "" : (title.tr || "");
        const titleAr = typeof title === "string" ? "" : (title.ar || "");

        // Hər dil üçün yeni slug yarat
        const newSlug = {
          az: oldSlug || slugify(titleAz, "az"),
          en: slugify(titleEn || titleAz, "en"),
          ru: slugify(titleRu || titleAz, "ru"),
          tr: slugify(titleTr || titleAz, "tr"),
          ar: slugify(titleAr || titleAz, "ar"),
        };

        // Firestore-da yenilə
        await articlesRef.doc(articleId).update({
          slug: newSlug,
        });

        console.log(`✅ ${articleId}: Uğurla yeniləndi`);
        console.log(`   Köhnə: "${oldSlug}"`);
        console.log(`   Yeni AZ: "${newSlug.az}"`);
        console.log(`   Yeni EN: "${newSlug.en}"`);
        console.log(`   Yeni RU: "${newSlug.ru}"`);
        console.log(`   Yeni TR: "${newSlug.tr}"`);
        console.log(`   Yeni AR: "${newSlug.ar}"\n`);

        migrated++;
      } catch (error) {
        console.error(`❌ ${articleId}: Xəta baş verdi:`, error);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 MİQRASİYA NƏTİCƏSİ:");
    console.log("=".repeat(50));
    console.log(`✅ Uğurla yeniləndi: ${migrated}`);
    console.log(`⏭️  Keçirildi (artıq LocalizedText): ${skipped}`);
    console.log(`❌ Xəta: ${errors}`);
    console.log(`📚 Cəmi: ${snapshot.size}`);
    console.log("=".repeat(50) + "\n");

    if (migrated > 0) {
      console.log("✨ Migrasiya uğurla tamamlandı!");
      console.log("💡 İndi bütün məqalələr hər dil üçün ayrı slug-a malikdir.\n");
    }

  } catch (error) {
    console.error("❌ Fatal xəta:", error);
    process.exit(1);
  }
}

// Script-i işə sal
migrateArticleSlugs()
  .then(() => {
    console.log("🎉 Script başa çatdı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script xəta ilə başa çatdı:", error);
    process.exit(1);
  });
