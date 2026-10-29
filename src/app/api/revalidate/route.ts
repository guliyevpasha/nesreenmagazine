import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-Demand Revalidation API
 * Məqalə dərc edildikdə cache-i avtomatik təmizləyir
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paths, tags } = body;

    // Təhlükəsizlik: yalnız admin istifadəçilər revalidate edə bilər
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.REVALIDATE_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "REVALIDATE_TOKEN environment variable not set" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Path-ları revalidate et
    if (Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path, "page");
      }
    }

    // Tag-ları revalidate et
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      paths: paths || [],
      tags: tags || [],
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
