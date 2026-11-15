import { NextRequest, NextResponse } from "next/server";
import { trackArticleView } from "@/lib/analytics/track-views";
import { detectDevice, detectSource, isBot } from "@/lib/analytics/classify";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { safeValidate } from "@/lib/validation/schemas";

const trackViewSchema = z.object({
  articleId: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  visitorId: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
  referrer: z.string().max(1000).optional(),
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

    const { articleId, slug, category, visitorId, referrer } = validation.data;

    // Cihazı və botları sorğunun öz başlığından təyin et (gövdədəki UA saxtalaşdırıla bilər)
    const ua = request.headers.get("user-agent") || validation.data.userAgent || "";
    if (isBot(ua)) return NextResponse.json({ success: true, skipped: "bot" });
    const device = detectDevice(ua);

    // Detect traffic source from referrer
    const ref = referrer ?? "";
    const source = detectSource(ref);

    await trackArticleView(articleId, slug, category, visitorId, {
      userAgent: ua,
      referrer: ref,
      device,
      source,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Track view error:", error);
    return NextResponse.json(
      { error: "Tracking xətası" },
      { status: 500 }
    );
  }
}
