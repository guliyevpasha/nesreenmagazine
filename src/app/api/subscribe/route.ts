import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/client';
import { emailSchema, safeValidate } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = safeValidate(emailSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { email } = validation.data;
    
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database əlaqə xətası' }, { status: 500 });
    }
    
    // Firestore-a əlavə et
    await addDoc(collection(db, 'subscribers'), {
      email,
      subscribedAt: new Date().toISOString(),
      source: 'website',
      active: true,
      forwardTo: process.env.ADMIN_EMAIL || 'info@nesreenmagazine.com',
    });
    
    logger.info('New subscriber:', email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
