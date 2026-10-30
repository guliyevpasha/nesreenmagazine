import { NextRequest, NextResponse } from "next/server";
import { incrementImpressions } from "@/lib/data/banners";

export async function POST(request: NextRequest) {
  try {
    const { bannerId } = await request.json();

    if (!bannerId) {
      return NextResponse.json({ error: "Banner ID tələb olunur" }, { status: 400 });
    }

    await incrementImpressions(bannerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Banner impression tracking error:", error);
    return NextResponse.json(
      { error: "Tracking xətası" },
      { status: 500 }
    );
  }
}
