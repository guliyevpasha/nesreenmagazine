/**
 * Admin paneldən server API-yə sorğu — daxil olmuş istifadəçinin Firebase ID
 * tokeni `Authorization` başlığına avtomatik əlavə olunur.
 * Server tərəfi: `src/lib/auth/middleware.ts`.
 */
import { getFirebaseAuth } from "@/lib/firebase/client";

export async function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = getFirebaseAuth()?.currentUser;
  const headers = new Headers(init.headers);
  if (user) {
    headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  }
  return fetch(input, { ...init, headers });
}
