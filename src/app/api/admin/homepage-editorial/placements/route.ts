/**
 * API: Məqalənin homepage placement-lərini qaytarır
 * 
 * Developed by Cradex Agency
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { getFirebaseAdmin } from "@/lib/firebase/admin";
import type { HomepageEditorialSection, HomepageSectionId, Locale } from "@/lib/types";

/**
 * Verify Firebase ID token
 */
async function verifyAuth(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.substring(7);
    const admin = getFirebaseAdmin();
    if (!admin) return false;

    const decodedToken = await getAuth(admin).verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    if (!email) return false;

    const firestore = getFirestore(admin);
    const staffDoc = await firestore.collection("staff").doc(email).get();
    
    if (!staffDoc.exists) {
      const bootstrapAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      
      return bootstrapAdmins.includes(email);
    }
    
    const staffData = staffDoc.data();
    return staffData?.active === true;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
}

/**
 * GET /api/admin/homepage-editorial/placements
 * Query params: articleId
 */
export async function GET(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    const admin = getFirebaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Firebase admin not initialized" },
        { status: 500 }
      );
    }

    const firestore = getFirestore(admin);
    const sectionsSnapshot = await firestore.collection("homepageEditorial").get();

    const placements: Array<{
      sectionId: HomepageSectionId;
      locale: Locale;
      position: number;
    }> = [];

    sectionsSnapshot.forEach((doc) => {
      const section = doc.data() as HomepageEditorialSection;
      const articleIds = section.articleIds || [];
      const index = articleIds.indexOf(articleId);

      if (index >= 0) {
        placements.push({
          sectionId: section.sectionId,
          locale: section.locale,
          position: index + 1, // 1-indexed
        });
      }
    });

    return NextResponse.json({ placements });
  } catch (error) {
    console.error("Error fetching article placements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
