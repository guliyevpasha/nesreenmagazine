import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase/admin';

/**
 * Admin işçinin şifrəsini dəyişir (email göndərmədən)
 * Yalnız admin rol səlahiyyəti var
 */
export async function POST(request: NextRequest) {
  try {
    // Firebase Admin SDK-nı başlat
    const app = initAdmin();
    if (!app) {
      return NextResponse.json(
        { error: 'Firebase Admin quraşdırılmayıb' },
        { status: 500 }
      );
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Request body oxu
    const body = await request.json();
    const { staffEmail, newPassword, adminUid } = body;

    if (!staffEmail || !newPassword || !adminUid) {
      return NextResponse.json(
        { error: 'staffEmail, newPassword və adminUid tələb olunur' },
        { status: 400 }
      );
    }

    // Admin yoxlaması - adminUid-nin admin olduğunu yoxla
    const adminDoc = await db.collection('staff').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yalnız admin şifrə dəyişə bilər' },
        { status: 403 }
      );
    }

    // İşçinin Firebase Auth UID-sini tap
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(staffEmail.toLowerCase());
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'Bu e-poçt ilə istifadəçi tapılmadı' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Şifrəni dəyiş (email göndərilmir)
    await auth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifrə uğurla dəyişdirildi',
    });

  } catch (error) {
    console.error('[reset-staff-password] Xəta:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server xətası' },
      { status: 500 }
    );
  }
}
