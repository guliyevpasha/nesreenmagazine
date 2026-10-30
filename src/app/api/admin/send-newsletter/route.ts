import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase/admin';
import { sendNewsletter } from '@/lib/email/mailer';

/**
 * Admin newsletter göndərir
 * POST /api/admin/send-newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const app = initAdmin();
    if (!app) {
      return NextResponse.json(
        { error: 'Firebase Admin quraşdırılmayıb' },
        { status: 500 }
      );
    }

    const db = getFirestore(app);
    const body = await request.json();
    const { adminUid, subject, html, attachments } = body;

    if (!adminUid || !subject || !html) {
      return NextResponse.json(
        { error: 'adminUid, subject və html tələb olunur' },
        { status: 400 }
      );
    }

    // Admin yoxlaması
    const adminDoc = await db.collection('staff').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yalnız admin newsletter göndərə bilər' },
        { status: 403 }
      );
    }

    // Aktiv abunəçiləri tap
    const subscribersSnapshot = await db
      .collection('subscribers')
      .where('active', '==', true)
      .get();

    const subscriberEmails = subscribersSnapshot.docs
      .map((doc) => doc.data().email)
      .filter(Boolean);

    if (subscriberEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aktiv abunəçi tapılmadı',
        sent: 0,
        failed: 0,
      });
    }

    // Newsletter göndər
    const results = await sendNewsletter(
      subscriberEmails,
      subject,
      html,
      attachments
    );

    return NextResponse.json({
      success: true,
      message: `Newsletter göndərildi: ${results.sent} uğurlu, ${results.failed} uğursuz`,
      ...results,
    });
  } catch (error) {
    console.error('[send-newsletter] Xəta:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server xətası' },
      { status: 500 }
    );
  }
}
