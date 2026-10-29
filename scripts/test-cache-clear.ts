/**
 * Cache təmizləmə API-ni test edir (server işləməlidir)
 * Əmr: npx tsx scripts/test-cache-clear.ts
 */

async function testCacheClear() {
  console.log("🧪 Cache təmizləmə API test edilir...\n");
  
  const locales = ["az", "en", "ru", "tr", "ar"];
  const categories = ["moda", "gozellik", "gundem", "heyat-terzi", "biznes", "astrologiya"];
  
  // Əsas səhifələr və kateqoriya səhifələrini əlavə et
  const paths: string[] = [];
  
  locales.forEach(locale => {
    paths.push(`/${locale}`);
    categories.forEach(cat => {
      paths.push(`/${locale}/${cat}`);
    });
  });

  console.log(`📄 ${paths.length} səhifə təmizlənəcək...\n`);

  try {
    const response = await fetch("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paths }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Xəta:", errorText);
      console.log("\n⚠️  Dev server işləyirmi? (npm run dev)");
      return;
    }

    const result = await response.json();
    console.log("✅ Cache uğurla təmizləndi!\n");
    console.log("📊 Statistika:");
    console.log(`   Təmizlənmiş səhifələr: ${result.paths?.length || 0}`);
    console.log(`   Vaxt: ${new Date(result.now).toLocaleString()}`);
    
    console.log("\n💡 İndi brauzeri yeniləyin və məqalələrin görünüb-görünmədiyini yoxlayın:");
    console.log("   http://localhost:3000/az/moda");
    
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      console.error("❌ Server işləmir!");
      console.log("\n💡 Dev serveri başladın:");
      console.log("   npm run dev");
    } else {
      console.error("❌ Xəta:", error);
    }
  }
}

testCacheClear();
