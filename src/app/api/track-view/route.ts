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
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
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

    const { articleId, slug, category, visitorId, userAgent, referrer } = validation.data;

    // Detect device type from user agent
    const ua = userAgent || request.headers.get("user-agent") || "";
    const device = detectDevice(ua);
    
    // Detect traffic source from referrer
    const ref = referrer || request.headers.get("referer") || "";
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

// Helper functions
function detectDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/mobile/i.test(ua) && !/tablet|ipad/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function detectSource(referrer: string): "organic" | "social" | "direct" | "referral" {
  if (!referrer || referrer === "") return "direct";

  const ref = referrer.toLowerCase();

  // Social media
  if (
    ref.includes("facebook") ||
    ref.includes("instagram") ||
    ref.includes("twitter") ||
    ref.includes("linkedin") ||
    ref.includes("tiktok") ||
    ref.includes("youtube")
  ) {
    return "social";
  }

  // Search engines
  if (
    ref.includes("google") ||
    ref.includes("bing") ||
    ref.includes("yahoo") ||
    ref.includes("duckduckgo") ||
    ref.includes("yandex")
  ) {
    return "organic";
  }

  return "referral";
}
