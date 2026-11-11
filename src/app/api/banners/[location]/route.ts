import { NextRequest, NextResponse } from "next/server";
import { getBannersByLocation } from "@/lib/data/banners";
import { isCategorySlug } from "@/lib/categories";
import { adBannerLocationLabels, type AdBannerLocation } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await params;
    if (!(location in adBannerLocationLabels)) {
      return NextResponse.json({ banner: null });
    }

    // ?category=moda — bannerin bölmə məhdudiyyətini yoxlamaq üçün (bölməsiz səhifədə göndərilmir)
    const rawCategory = request.nextUrl.searchParams.get("category");
    const category = rawCategory && isCategorySlug(rawCategory) ? rawCategory : null;

    const banners = await getBannersByLocation(location as AdBannerLocation, category);

    if (banners.length === 0) {
      return NextResponse.json({ banner: null });
    }

    // Ən yüksək prioritetli bannerlər arasından təsadüfi biri (bərabər prioritet = növbələşmə)
    const top = Number(banners[0].priority) || 0;
    const tied = banners.filter((b) => (Number(b.priority) || 0) === top);
    const banner = tied[Math.floor(Math.random() * tied.length)];

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Banner fetch error:", error);
    return NextResponse.json(
      { error: "Banner yüklənmədi" },
      { status: 500 }
    );
  }
}
