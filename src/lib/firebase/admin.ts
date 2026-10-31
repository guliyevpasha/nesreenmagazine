/**
 * Firebase Admin SDK
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 * 
 * Server-side Firebase əməliyyatları üçün
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';

let adminApp: App | null = null;

/**
 * Firebase Admin SDK-ni başladır
 * Service account JSON environment variable-dan oxunur
 */
export function getFirebaseAdmin(): App | null {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Əgər artıq başladılıbsa, mövcud app-i qaytar
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      return adminApp;
    }

    // Service account credentials environment variable-dan oxu
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccount || !serviceAccount.trim()) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is empty or not set');
      return null;
    }

    let serviceAccountJson;
    try {
      serviceAccountJson = JSON.parse(serviceAccount);
    } catch (parseError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', parseError);
      console.error('First 100 characters:', serviceAccount.substring(0, 100));
      return null;
    }

    // Lazımi field-ləri yoxla
    if (!serviceAccountJson.project_id || !serviceAccountJson.private_key || !serviceAccountJson.client_email) {
      console.error('Invalid service account JSON - missing required fields');
      return null;
    }

    adminApp = initializeApp({
      credential: cert(serviceAccountJson),
    });

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}
