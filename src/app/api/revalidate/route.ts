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

    // Təhlükəsizlik yoxlaması
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.REVALIDATE_TOKEN;

    // Development modda və ya token düzgündürsə icazə ver
    const isDev = process.env.NODE_ENV === "development";
    const isValidToken = expectedToken && authHeader === `Bearer ${expectedToken}`;

    if (!isDev && !isValidToken) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing token" },
        { status: 401 }
      );
    }

    // Əgər slug və category verilmişsə, avtomatik path-lar yarat
    const allPaths = paths || [];
    if (slug && category) {
      const locales = ["az", "en", "ru", "tr", "ar"];
      locales.forEach((locale) => {
        allPaths.push(`/${locale}`);
        allPaths.push(`/${locale}/${category}`);
        allPaths.push(`/${locale}/${category}/${slug}`);
      });
    }

    // Path-ları revalidate et
    if (Array.isArray(allPaths) && allPaths.length > 0) {
      for (const path of allPaths) {
        revalidatePath(path, "page");
        console.log("✅ Revalidated:", path);
      }
    }

    // Tag-ları revalidate et
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
        console.log("✅ Revalidated tag:", tag);
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
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        error: "Revalidation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
