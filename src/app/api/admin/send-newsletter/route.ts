import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletter } from '@/lib/email/mailer';
import { getDb } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Admin newsletter göndərir
 * POST /api/admin/send-newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, html } = body;

    if (!subject || !html) {
      return NextResponse.json(
        { error: 'subject və html tələb olunur' },
        { status: 400 }
      );
    }

    // Aktiv abunəçiləri tap (client SDK)
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase qoşulmayıb' },
        { status: 500 }
      );
    }

    const subscribersQuery = query(
      collection(db, 'subscribers'),
      where('active', '==', true)
    );
    const subscribersSnapshot = await getDocs(subscribersQuery);

    const subscriberEmails = subscribersSnapshot.docs
      .map((doc) => doc.data().email)
      .filter(Boolean) as string[];

    if (subscriberEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aktiv abunəçi tapılmadı',
        sent: 0,
        failed: 0,
      });
    }

    // Newsletter göndər
    const results = await sendNewsletter(subscriberEmails, subject, html);

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
