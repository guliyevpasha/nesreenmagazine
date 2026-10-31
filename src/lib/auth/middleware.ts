/**
 * Authentication Middleware
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 * 
 * API route-lar üçün authentication yoxlaması
 */

import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/client';
import type { StaffRole } from '@/lib/types';

export type AuthSession = {
  uid: string;
  email: string;
  role: StaffRole;
  active: boolean;
};

/**
 * Request-dən Firebase ID token-i çıxarır və verify edir
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthSession | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Firebase Admin SDK ilə token verify et
    const admin = getFirebaseAdmin();
    if (!admin) {
      console.error('Firebase Admin not initialized');
      return null;
    }

    const auth = getAuth(admin);
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken.email) {
      return null;
    }

    // Staff məlumatlarını yoxla
    const db = getDb();
    if (!db) {
      return null;
    }

    const staffDoc = await getDoc(doc(db, 'staff', decodedToken.email.toLowerCase()));
    
    if (!staffDoc.exists()) {
      return null;
    }

    const staffData = staffDoc.data();

    if (!staffData.active) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: staffData.role as StaffRole,
      active: staffData.active,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

/**
 * Staff üzvü olduğunu yoxlayır
 */
export async function requireStaffAuth(request: NextRequest): Promise<AuthSession | null> {
  return verifyAuthToken(request);
}

/**
 * Admin rolunu yoxlayır
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthSession | null> {
  const session = await verifyAuthToken(request);
  
  if (!session || session.role !== 'admin') {
    return null;
  }

  return session;
}

/**
 * CRM access yoxlayır (admin, sales, finance)
 */
export async function requireCrmAccess(request: NextRequest): Promise<AuthSession | null> {
  const session = await verifyAuthToken(request);
  
  if (!session || !['admin', 'sales', 'finance'].includes(session.role)) {
    return null;
  }

  return session;
}
