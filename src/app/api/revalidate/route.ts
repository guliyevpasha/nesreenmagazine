import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-Demand Revalidation API
 * Məqalə dərc edildikdə cache-i avtomatik təmizləyir
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paths, tags, slug, category } = body;

    // Təhlükəsizlik yoxlaması - development modda token tələb etmirik
    const isDev = process.env.NODE_ENV === "development";
    
    if (!isDev) {
      const authHeader = request.headers.get("authorization");
      const expectedToken = process.env.REVALIDATE_TOKEN;
      const isValidToken = expectedToken && authHeader === `Bearer ${expectedToken}`;

      if (!isValidToken) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid or missing token" },
          { status: 401 }
        );
      }
    }

    // Əgər slug və category verilmişsə, avtomatik path-lar yarat
    const allPaths = paths || [];
    if (slug && category) {
      const locales = ["az", "en", "ru", "tr", "ar"];
      locales.forEach((locale) => {
        allPaths.push(`/${locale}`); // Ana səhifə
        allPaths.push(`/${locale}/${category}`); // Kateqoriya səhifəsi
        allPaths.push(`/${locale}/${category}/${slug}`); // Məqalə səhifəsi
      });
    }

    // Path-ları revalidate et
    if (Array.isArray(allPaths) && allPaths.length > 0) {
      for (const path of allPaths) {
        try {
          revalidatePath(path);
          console.log("✅ Revalidated path:", path);
        } catch (pathError) {
          console.error("⚠️ Failed to revalidate path:", path, pathError);
        }
      }
    }

    // Tag-ları revalidate et
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          // Route Handler-də { expire: 0 } istifadə edirik ki, dərhal expire olsun
          revalidateTag(tag, { expire: 0 });
          console.log("✅ Revalidated tag:", tag);
        } catch (tagError) {
          console.error("⚠️ Failed to revalidate tag:", tag, tagError);
        }
      }
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths: allPaths || [],
      tags: tags || [],
      message: "Cache successfully cleared",
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return NextResponse.json(
      {
        error: "Revalidation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
