/**
 * E-kitab bannerini Firestore-a əlavə edir
 * İşlətmək: npm run seed-ebook
 */
import { initializeApp } from "firebase/app";
import { addDoc, collection, getDocs, getFirestore, query } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

if (!config.apiKey || !config.projectId) {
  console.error("\n  Firebase açarları tapılmadı.\n");
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

const initialBanner = {
  active: true,
  coverImage: "/ebook/cover.jpg",
  previewImages: [
    "/ebook/preview1.jpg",
    "/ebook/preview2.jpg",
    "/ebook/preview3.jpg",
    "/ebook/preview4.jpg",
    "/ebook/preview5.jpg",
    "/ebook/preview6.jpg",
    "/ebook/preview7.jpg",
    "/ebook/preview8.jpg",
  ],
  href: "https://whop.com/spendly-70c9/the-real-life-savings-reset/?a=nesreenmuse",
  title: {
    az: "The Real-Life Savings Reset",
    en: "The Real-Life Savings Reset",
    ru: "The Real-Life Savings Reset",
    tr: "The Real-Life Savings Reset",
    ar: "The Real-Life Savings Reset",
  },
  subtitle: {
    az: "Büdcənizi yeniləyin, əmanətlərinizi qoruyun və xərclərinizi bugünkü qiymətlərə uyğunlaşdırın",
    en: "Reset your budget, protect savings, and adapt spending to today's costs",
    ru: "Обновите бюджет, защитите сбережения и адаптируйте расходы к сегодняшним ценам",
    tr: "Bütçenizi sıfırlayın, tasarruflarınızı koruyun ve harcamalarınızı bugünün maliyetlerine uyarlayın",
    ar: "أعد ضبط ميزانيتك، احم مدخراتك، وقم بتكييف إنفاقك مع التكاليف الحالية",
  },
  description: {
    az: "Köhnə büdcəniz artıq ərzaq, enerji, yanacaq, borc ödənişləri və digər əsas xərcləri qarşılamırsa, bu praktik rəqəmsal e-kitab və aylıq büdcə sistemi sizin üçündür.",
    en: "A practical digital ebook and monthly budgeting system for households whose old budget no longer covers groceries, energy, fuel, debt payments and other essential costs.",
    ru: "Практичная цифровая электронная книга и ежемесячная система бюджетирования для семей, чей старый бюджет больше не покрывает продукты, энергию, топливо, выплаты по долгам и другие основные расходы.",
    tr: "Eski bütçesi artık market, enerji, yakıt, borç ödemeleri ve diğer temel maliyetleri karşılamayan haneler için pratik bir dijital e-kitap ve aylık bütçeleme sistemi.",
    ar: "كتاب إلكتروني رقمي عملي ونظام ميزانية شهرية للأسر التي لم تعد ميزانيتها القديمة تغطي البقالة والطاقة والوقود ومدفوعات الديون والتكاليف الأساسية الأخرى.",
  },
  features: {
    az: [
      "✓ Cari əsas xərclərinizi yenidən hesablayın",
      "✓ Real aylıq əmanət hissəsini qoruyun",
      "✓ İndiki qiymətləri əks etdirən çevik xərc limitləri təyin edin",
      "✓ Mürəkkəb alətlər olmadan praktik proses",
    ],
    en: [
      "✓ Recalculate your current essential spending",
      "✓ Protect a realistic monthly savings contribution",
      "✓ Set flexible spending limits that reflect present prices",
      "✓ Practical process without complicated tools",
    ],
    ru: [
      "✓ Пересчитайте текущие основные расходы",
      "✓ Защитите реалистичный ежемесячный взнос в сбережения",
      "✓ Установите гибкие лимиты расходов, отражающие текущие цены",
      "✓ Практичный процесс без сложных инструментов",
    ],
    tr: [
      "✓ Mevcut temel harcamalarınızı yeniden hesaplayın",
      "✓ Gerçekçi bir aylık tasarruf katkısını koruyun",
      "✓ Mevcut fiyatları yansıtan esnek harcama limitleri belirleyin",
      "✓ Karmaşık araçlar olmadan pratik süreç",
    ],
    ar: [
      "✓ أعد حساب إنفاقك الأساسي الحالي",
      "✓ احم مساهمة ادخار شهرية واقعية",
      "✓ حدد حدود إنفاق مرنة تعكس الأسعار الحالية",
      "✓ عملية عملية بدون أدوات معقدة",
    ],
  },
  ctaText: {
    az: "İndi alın və qənaət edin",
    en: "Get it now and save",
    ru: "Купить сейчас и сэкономить",
    tr: "Şimdi alın ve tasarruf edin",
    ar: "احصل عليه الآن ووفر",
  },
  price: "$10",
  originalPrice: "$12.5",
  discountText: {
    az: "20% ENDİRİM",
    en: "SAVE 20%",
    ru: "СКИДКА 20%",
    tr: "%20 İNDİRİM",
    ar: "وفر 20%",
  },
  badgeText: {
    az: "💰 MALİYYƏ TƏHSİLİ",
    en: "💰 FINANCIAL EDUCATION",
    ru: "💰 ФИНАНСОВОЕ ОБРАЗОВАНИЕ",
    tr: "💰 FİNANSAL EĞİTİM",
    ar: "💰 التعليم المالي",
  },
  createdAt: new Date().toISOString(),
};

async function seed() {
  console.log(`\n  Firestore layihəsi: ${config.projectId}\n`);

  // Yoxla - artıq varmı?
  const existing = await getDocs(query(collection(db, "ebookBanners")));

  if (existing.size > 0) {
    console.log(`  ⚠ Artıq ${existing.size} e-kitab banner mövcuddur.`);
    console.log(`  İlkin banner əlavə edilmədi.\n`);
    return;
  }

  // Əlavə et
  await addDoc(collection(db, "ebookBanners"), initialBanner);

  console.log(`  ✅ E-kitab banneri əlavə edildi.`);
  console.log(`  🔗 Link: ${initialBanner.href}`);
  console.log(`  📚 Status: Aktiv\n`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n  Xəta:", error, "\n");
    process.exit(1);
  });
