import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Düzgün email daxil edin' }, { status: 400 });
    }
    
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database əlaqə xətası' }, { status: 500 });
    }
    
    // Firestore-a əlavə et
    await addDoc(collection(db, 'subscribers'), {
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      source: 'website',
      active: true,
      // Admin email-ə yönləndir
      forwardTo: process.env.ADMIN_EMAIL || 'info@nesreenmagazine.com',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
