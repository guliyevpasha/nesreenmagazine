/**
 * Manual cache təmizləmək üçün skript
 * Əmr: npx tsx scripts/clear-cache.ts
 */

async function clearCache() {
  console.log("🧹 Cache təmizlənir...\n");

  try {
    const response = await fetch("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paths: [
          "/az",
          "/en",
          "/ru",
          "/tr",
          "/ar",
          "/az/moda",
          "/en/moda",
          "/ru/moda",
          "/tr/moda",
          "/ar/moda",
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cache təmizlənmədi:", errorText);
      return;
    }

    const result = await response.json();
    console.log("✅ Cache uğurla təmizləndi!");
    console.log("📄 Təmizlənmiş səhifələr:");
    result.paths?.forEach((path: string) => {
      console.log(`   - ${path}`);
    });
    console.log("\n💡 İndi brauzeri yeniləyin (Ctrl+Shift+R və ya Cmd+Shift+R)");
  } catch (error) {
    console.error("❌ Xəta:", error);
    console.log("\n⚠️  Dev server işləyirmi? (npm run dev)");
  }
}

clearCache();
