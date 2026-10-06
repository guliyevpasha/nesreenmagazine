/**
 * Bütün məqalələrə statik Unsplash şəkilləri əlavə edir
 * API key-ə ehtiyac yoxdur - əvvəlcədən seçilmiş şəkillər
 */

import * as fs from "fs";
import * as path from "path";

const ARTICLES_DIR = path.join(process.cwd(), "src", "lib", "content", "articles");

// Kateqoriya və subcategory əsasında şəkil mapping
const imageDatabase: Record<string, Record<string, string[]>> = {
  moda: {
    trendler: [
      "https://images.unsplash.com/photo-1558769132-cb1aea3c7584?w=1200&q=80|Tamara Bellis",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80|Mnz",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80|Priscilla Du Preez",
    ],
    "kuce-modasi": [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80|Alyssa Strohmann",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1200&q=80|Artificial Photography",
    ],
    podium: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80|Jamakassi",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80|Flaunter",
    ],
    "stil-meslehetleri": [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80|Priscilla Du Preez",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80|Priscilla Du Preez",
    ],
    aksesuarlar: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80|Cornelia Ng",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&q=80|Cornelia Ng",
    ],
    canta: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80|Tamara Bellis",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80|Arnel Hasanovic",
    ],
  },
  gozellik: {
    "deri-baximi": [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80|Humphrey Muleba",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=80|Ariana Prestes",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80|Katherine Hanlon",
    ],
    makiyaj: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80|Amy Shamblen",
      "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=80|Raphael Lovaski",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80|Joanna Kosinska",
    ],
    sac: [
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=1200&q=80|Element5 Digital",
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=80|Christin Hume",
    ],
    etir: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80|Mélissa Jeanty",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=1200&q=80|Laura Chouette",
    ],
  },
  "heyat-terzi": {
    texnologiya: [
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80|Luca Bravo",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80|Marvin Meyer",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80|Christopher Gower",
    ],
    seyahet: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80|Slawek K",
      "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80|Luca Bravo",
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80|Dino Reichmuth",
    ],
    yemek: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80|Louis Hansel",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80|Lily Banse",
    ],
    "ev-dekorasiyasi": [
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&q=80|Jonny Caspari",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=80|Huy Nguyen",
    ],
  },
  biznes: {
    karyera: [
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80|Marten Bjork",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80|Marten Bjork",
    ],
    sahibkarliq: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80|Marten Bjork",
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&q=80|Carlos Muza",
    ],
    maliyye: [
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80|Micheile Henderson",
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80|Austin Distel",
    ],
    liderlik: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80|Kvalifik",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80|Smartworks Coworking",
    ],
    "ilham-veren-qadinlar": [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80|Christina @ wocintechchat.com",
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=1200&q=80|Amy Hirschi",
    ],
  },
  astrologiya: {
    burcler: [
      "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200&q=80|Alexander Andrews",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80|Greg Rakozy",
      "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200&q=80|Joshua Earle",
    ],
    tarot: [
      "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=1200&q=80|Viva Luna Studios",
      "https://images.unsplash.com/photo-1633269865990-58c29ba4e77d?w=1200&q=80|Viva Luna Studios",
    ],
    uygunluq: [
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80|Yoann Boyer",
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80|Becca Tapert",
    ],
    "ay-teqvimi": [
      "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&q=80|Ganapathy Kumar",
      "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&q=80|Ganapathy Kumar",
    ],
    "tebii-daslar": [
      "https://images.unsplash.com/photo-1603220407938-c10b29767095?w=1200&q=80|Edz Norton",
      "https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=1200&q=80|Edz Norton",
    ],
    numerologiya: [
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80|Shubham Dhage",
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80|Volodymyr Hryshchenko",
    ],
    matrix: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80|NASA",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80|Kaitlyn Baker",
    ],
  },
  gundem: {
    xeberler: [
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80|Roman Kraft",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80|AbsolutVision",
    ],
    magazin: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80|Mnz",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80|Ivana Cajina",
    ],
    medeniyyet: [
      "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=1200&q=80|Avel Chuklanov",
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80|Denise Jans",
    ],
    musahibe: [
      "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&q=80|Manny Pantoja",
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80|LinkedIn Sales Solutions",
    ],
  },
};

let imageIndexes: Record<string, Record<string, number>> = {};

function getNextImage(category: string, subcategory: string): { url: string; credit: string } | null {
  const categoryImages = imageDatabase[category];
  if (!categoryImages) return null;

  const subcatImages = categoryImages[subcategory];
  if (!subcatImages || subcatImages.length === 0) return null;

  // Initialize index for this subcategory
  const key = `${category}-${subcategory}`;
  if (imageIndexes[category] === undefined) {
    imageIndexes[category] = {};
  }
  if (imageIndexes[category][subcategory] === undefined) {
    imageIndexes[category][subcategory] = 0;
  }

  // Get current image and increment index
  const currentIndex = imageIndexes[category][subcategory];
  const imageData = subcatImages[currentIndex % subcatImages.length];
  imageIndexes[category][subcategory]++;

  const [url, photographer] = imageData.split("|");
  return {
    url,
    credit: `Photo by ${photographer} on Unsplash`,
  };
}

function updateArticleImages(filePath: string): number {
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  // Find all articles with empty coverImage
  const pattern = /(id:\s*"[^"]+",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?subcategory:\s*"([^"]+)",[\s\S]*?)coverImage:\s*"",[\s\S]*?coverCredit:\s*"",/g;

  content = content.replace(pattern, (match, prefix, category, subcategory) => {
    const image = getNextImage(category, subcategory);
    
    if (image) {
      updatedCount++;
      return `${prefix}coverImage: "${image.url}",\n    coverCredit: "${image.credit}",`;
    }
    
    return match;
  });

  fs.writeFileSync(filePath, content, "utf-8");
  return updatedCount;
}

function main() {
  console.log("🎨 Statik şəkillər əlavə edilir...\n");

  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith(".ts"));
  let totalUpdated = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const count = updateArticleImages(filePath);
    
    if (count > 0) {
      console.log(`✓ ${file}: ${count} məqalə yeniləndi`);
      totalUpdated += count;
    }
  }

  console.log(`\n✅ Tamamlandı! ${totalUpdated} məqalə üçün şəkil əlavə edildi.`);
}

main();
