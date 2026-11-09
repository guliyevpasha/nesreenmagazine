/**
 * Admin paneldən server API-yə sorğu — daxil olmuş istifadəçinin Firebase ID
 * tokeni `Authorization` başlığına avtomatik əlavə olunur.
 * Server tərəfi: `src/lib/auth/middleware.ts`.
 */
import { getFirebaseAuth } from "@/lib/firebase/client";

export async function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    console.error("[authorizedFetch] Firebase auth not initialized");
    throw new Error("Firebase auth not initialized");
  }
  
  const user = auth.currentUser;
  
  if (!user) {
    console.error("[authorizedFetch] User not authenticated");
    throw new Error("User not authenticated");
  }
  
  const headers = new Headers(init.headers);
  
  try {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
    console.log("[authorizedFetch] Request to:", input, "with token");
  } catch (error) {
    console.error("[authorizedFetch] Failed to get ID token:", error);
    throw error;
  }
  
  return fetch(input, { ...init, headers });
}

