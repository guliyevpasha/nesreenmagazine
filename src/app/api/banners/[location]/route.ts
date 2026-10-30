import { NextRequest, NextResponse } from "next/server";
import { getBannersByLocation } from "@/lib/data/banners";
import type { AdBannerLocation } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await params;

    const banners = await getBannersByLocation(location as AdBannerLocation);

    if (banners.length === 0) {
      return NextResponse.json({ banner: null });
    }

    // Prioritetə görə ən yüksək olanı seç
    const banner = banners.sort((a, b) => b.priority - a.priority)[0];

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Banner fetch error:", error);
    return NextResponse.json(
      { error: "Banner yüklənmədi" },
      { status: 500 }
    );
  }
}
