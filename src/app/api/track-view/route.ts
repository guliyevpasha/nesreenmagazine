import { NextRequest, NextResponse } from "next/server";
import { trackArticleView } from "@/lib/analytics/track-views";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { safeValidate } from "@/lib/validation/schemas";

const trackViewSchema = z.object({
  articleId: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  visitorId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = safeValidate(trackViewSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { articleId, slug, category, visitorId } = validation.data;

    await trackArticleView(articleId, slug, category, visitorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Track view error:", error);
    return NextResponse.json(
      { error: "Tracking xətası" },
      { status: 500 }
    );
  }
}
