/**
 * Manually trigger revalidation for specific article
 */

async function revalidateArticle() {
  const slug = "ben-affleck-yeni-munasibet-sevgi-heyati";
  const category = "gundem";
  
  // Production URL (Vercel)
  const baseUrl = "https://www.nesreenmagazine.com";
  const apiUrl = `${baseUrl}/api/revalidate`;
  
  console.log("\n🔄 Triggering revalidation...\n");
  console.log("Slug:", slug);
  console.log("Category:", category);
  console.log();
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug,
        category,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Revalidation successful!");
      console.log("\nPaths revalidated:");
      data.paths?.forEach((path: string) => {
        console.log(`  ${baseUrl}${path}`);
      });
      console.log("\nNow try opening the article again:");
      console.log(`  ${baseUrl}/az/${category}/${slug}`);
    } else {
      console.log("❌ Revalidation failed:");
      console.log(data);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
  
  console.log();
}

revalidateArticle();
