import { NextRequest, NextResponse } from "next/server";
import { trackArticleView } from "@/lib/analytics/track-views";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, slug, category, visitorId } = body;

    if (!articleId || !slug || !category) {
      return NextResponse.json(
        { error: "articleId, slug və category mütləqdir" },
        { status: 400 }
      );
    }

    await trackArticleView(articleId, slug, category, visitorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track view error:", error);
    return NextResponse.json(
      { error: "Tracking xətası" },
      { status: 500 }
    );
  }
}
