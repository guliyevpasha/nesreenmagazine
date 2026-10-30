import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import type { AdvancedAdBanner } from "../src/lib/types";

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultBanners: Omit<AdvancedAdBanner, "id" | "createdAt" | "updatedAt">[] = [
  // Sidebar Banner - Maqalə Sol Sidebar
  {
    name: "Default Sidebar Banner",
    imageUrl: "/banners/sidebar-banner.html",
    mediaType: "image", // HTML faylı image kimi işləyir
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-sidebar-left"],
    dimensions: { width: 300, height: 250 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Sidebar Banner - Maqalə Sağ Sidebar
  {
    name: "Default Right Sidebar Banner",
    imageUrl: "/banners/sidebar-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-sidebar-right"],
    dimensions: { width: 300, height: 250 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Inline H2 Banner
  {
    name: "Default H2 Inline Banner",
    imageUrl: "/banners/leaderboard-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-inline-h2"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Inline H3 Banner
  {
    name: "Default H3 Inline Banner",
    imageUrl: "/banners/leaderboard-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-inline-h3"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Header Banner
  {
    name: "Default Header Banner",
    imageUrl: "/banners/leaderboard-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-header"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "slide",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Footer Banner
  {
    name: "Default Footer Banner",
    imageUrl: "/banners/leaderboard-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-footer"],
    dimensions: { width: 728, height: 90 },
    active: true,
    showOn: { desktop: true, tablet: true, mobile: false },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Mobile Header Banner
  {
    name: "Default Mobile Header Banner",
    imageUrl: "/banners/sidebar-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-header"],
    dimensions: { width: 320, height: 100 },
    active: true,
    showOn: { desktop: false, tablet: false, mobile: true },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
  
  // Mobile Inline Banner
  {
    name: "Default Mobile Inline Banner",
    imageUrl: "/banners/sidebar-banner.html",
    mediaType: "image",
    linkUrl: "https://wa.me/994503807787",
    altText: "Burada sizin reklamınız ola bilər - WhatsApp: 0503807787",
    locations: ["article-inline-h2", "article-inline-h3"],
    dimensions: { width: 320, height: 100 },
    active: true,
    showOn: { desktop: false, tablet: false, mobile: true },
    priority: 1,
    animation: "fade",
    clicks: 0,
    impressions: 0,
    createdBy: "system",
  },
];

async function seedDefaultBanners() {
  console.log("🌱 Starting default banners seeding...\n");

  try {
    const bannersRef = collection(db, "advancedBanners");
    const now = new Date().toISOString();

    for (const banner of defaultBanners) {
      const docRef = doc(bannersRef);
      
      await setDoc(docRef, {
        ...banner,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      });

      console.log(`✅ Created: ${banner.name}`);
      console.log(`   Locations: ${banner.locations.join(", ")}`);
      console.log(`   Devices: ${Object.entries(banner.showOn).filter(([, v]) => v).map(([k]) => k).join(", ")}`);
      console.log(`   Dimensions: ${banner.dimensions.width}x${banner.dimensions.height}\n`);
    }

    console.log(`\n✨ Successfully seeded ${defaultBanners.length} default banners!`);
    console.log("\n📋 Summary:");
    console.log(`   - Sidebar banners: 2`);
    console.log(`   - Inline banners (H2/H3): 2`);
    console.log(`   - Header/Footer banners: 2`);
    console.log(`   - Mobile banners: 2`);
    console.log("\n💡 These banners will show in the admin panel as active banners.");
    console.log("   You can edit, duplicate, activate/deactivate, or delete them.\n");
  } catch (error) {
    console.error("❌ Error seeding banners:", error);
    throw error;
  }
}

// Run the seed
seedDefaultBanners()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
