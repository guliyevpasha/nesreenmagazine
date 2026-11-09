/**
 * API: Bütün homepage bölmələri üçün boş sənədlər yaradır
 * Yalnız admin istifadə edə bilər
 * 
 * POST /api/admin/homepage-editorial/seed
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

const SECTIONS = [
  'weekly-main-topic',
  'latest-articles',
  'moda-editorial',
  'moda-most-read',
  'gozellik-editorial',
  'gozellik-most-read',
  'heyat-terzi-editorial',
  'heyat-terzi-most-read',
  'biznes-editorial',
  'biznes-most-read',
] as const;

const LOCALES = ['az', 'en', 'ru', 'tr', 'ar'] as const;

/**
 * Verify admin access
 */
async function verifyAdmin(request: NextRequest): Promise<{
  uid: string;
  email: string;
  name: string;
} | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const admin = getFirebaseAdmin();
    if (!admin) return null;

    const decodedToken = await getAuth(admin).verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    if (!email) return null;

    // Check if user is admin
    const firestore = getFirestore(admin);
    const staffDoc = await firestore.collection("staff").doc(email).get();
    
    if (!staffDoc.exists) {
      // Check bootstrap admin
      const bootstrapAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      
      if (!bootstrapAdmins.includes(email)) {
        return null;
      }
    } else {
      const staffData = staffDoc.data();
      if (!staffData?.active || staffData?.role !== "admin") {
        return null;
      }
    }

    return {
      uid: decodedToken.uid,
      email,
      name: decodedToken.name || email,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      return NextResponse.json(
        { error: "Firebase admin not initialized" },
        { status: 500 }
      );
    }

    const firestore = getFirestore(firebaseAdmin);
    let created = 0;
    let existing = 0;
    const details: string[] = [];

    for (const sectionId of SECTIONS) {
      for (const locale of LOCALES) {
        const docId = `${sectionId}-${locale}`;
        const docRef = firestore.collection("homepageEditorial").doc(docId);
        
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          existing++;
          details.push(`⏭️ ${docId} - artıq mövcuddur`);
        } else {
          const emptySection = {
            sectionId,
            locale,
            articleIds: [],
            updatedBy: admin.uid,
            updatedByName: admin.name,
            updatedAt: new Date().toISOString(),
            version: 1,
          };
          
          await docRef.set(emptySection);
          created++;
          details.push(`✅ ${docId} - yaradıldı`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      existing,
      total: SECTIONS.length * LOCALES.length,
      details,
    });
  } catch (error) {
    console.error("Error seeding homepage sections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
