/**
 * Bütün məqalələrə Unsplash şəkilləri əlavə edir
 * 
 * İstifadə:
 * npx tsx scripts/add-unsplash-images.ts
 */

import * as fs from "fs";
import * as path from "path";
import { searchUnsplashPhoto, generateUnsplashQuery, formatUnsplashCredit } from "../src/lib/unsplash";

// Unsplash API key yoxlayaq
if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
  console.error("❌ NEXT_PUBLIC_UNSPLASH_ACCESS_KEY .env.local faylında təyin edilməlidir");
  console.log("\n📝 Addımlar:");
  console.log("1. https://unsplash.com/developers saytına gedin");
  console.log("2. Yeni application yaradın");
  console.log("3. Access Key-i kopyalayın");
  console.log("4. .env.local faylında NEXT_PUBLIC_UNSPLASH_ACCESS_KEY= əlavə edin\n");
  process.exit(1);
}

const ARTICLES_DIR = path.join(process.cwd(), "src", "lib", "content", "articles");
const DELAY_BETWEEN_REQUESTS = 1000; // Unsplash rate limit: 50 requests/hour

// Yuxarı gözləmə funksiyası
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface ArticleMatch {
  id: string;
  category: string;
  subcategory: string;
  coverImage: string;
}

/**
 * Fayl məzmununda coverImage boş olan məqalələri tapır
 */
function findArticlesWithoutImages(filePath: string): ArticleMatch[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const articles: ArticleMatch[] = [];

  // Regex ilə məqalə obyektlərini tapırıq
  const articleRegex = /\{[\s\S]*?id:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["'][\s\S]*?subcategory:\s*["']([^"']+)["'][\s\S]*?coverImage:\s*["']([^"']*)["'][\s\S]*?\}/g;

  let match;
  while ((match = articleRegex.exec(content)) !== null) {
    const [, id, category, subcategory, coverImage] = match;
    if (coverImage === "") {
      articles.push({ id, category, subcategory, coverImage });
    }
  }

  return articles;
}

/**
 * Faylda coverImage-i yeniləyir
 */
function updateCoverImage(filePath: string, articleId: string, imageUrl: string, credit: string): void {
  let content = fs.readFileSync(filePath, "utf-8");

  // Məqalə obyektini tapırıq və coverImage-i yeniləyirik
  const articlePattern = new RegExp(
    `(id:\\s*["']${articleId}["'][\\s\\S]*?coverImage:\\s*["'])([^"']*)(["'][\\s\\S]*?coverCredit:\\s*["'])([^"']*)(["'])`,
    "g"
  );

  const updated = content.replace(articlePattern, `$1${imageUrl}$3${credit}$5`);

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`  ✓ Yeniləndi: ${articleId}`);
  } else {
    console.log(`  ⚠ Yenilənə bilmədi: ${articleId}`);
  }
}

/**
 * Əsas funksiya
 */
async function main() {
  console.log("🎨 Unsplash şəkilləri əlavə edilir...\n");

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".ts"));
  
  let totalProcessed = 0;
  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const articles = findArticlesWithoutImages(filePath);

    if (articles.length === 0) {
      console.log(`✓ ${file}: Bütün məqalələrdə şəkil var`);
      continue;
    }

    console.log(`\n📁 ${file}: ${articles.length} məqalə şəkil gözləyir`);

    for (const article of articles) {
      totalProcessed++;
      
      // Query generasiya et
      const query = generateUnsplashQuery(article.category, article.subcategory);
      console.log(`  🔍 Axtarılır: "${query}"...`);

      try {
        // Unsplash-dan şəkil al
        const photo = await searchUnsplashPhoto(query, "landscape");

        if (photo) {
          const { imageUrl, credit } = formatUnsplashCredit(photo);
          
          // Faylı yenilə
          updateCoverImage(filePath, article.id, imageUrl, credit);
          totalUpdated++;
        } else {
          console.log(`  ⚠ Şəkil tapılmadı: ${article.id}`);
        }

        // Rate limit üçün gözlə
        await sleep(DELAY_BETWEEN_REQUESTS);

      } catch (error) {
        console.error(`  ❌ Xəta: ${article.id}`, error);
      }
    }
  }

  console.log(`\n✅ Tamamlandı!`);
  console.log(`📊 Statistika:`);
  console.log(`   - Yoxlanılan: ${totalProcessed} məqalə`);
  console.log(`   - Yenilənən: ${totalUpdated} məqalə`);
  console.log(`   - Uğursuz: ${totalProcessed - totalUpdated} məqalə`);
}

main().catch(console.error);
