/**
 * API route-lar üçün autentifikasiya.
 *
 * Developed by Cradex Agency · https://cradexagency.com
 *
 * Brauzer `Authorization: Bearer <Firebase ID token>` göndərir (bax:
 * `src/lib/auth/authorized-fetch.ts`). Server tokeni Firebase service
 * account OLMADAN yoxlayır:
 *
 *   1. Tokenin payload-ı oxunur (aud / iss / exp / email yoxlanır).
 *   2. `staff/{email}` sənədi Firestore REST API ilə ELƏ HƏMİN TOKENLƏ oxunur.
 *      Firestore imzanı özü yoxlayır: saxta və ya vaxtı keçmiş token 401
 *      qaytarır, staff olmayan istifadəçi isə qaydalara görə 403 alır.
 *
 * Beləliklə yalnız aktiv redaksiya üzvünün etibarlı tokeni qəbul olunur.
 */

import type { NextRequest } from "next/server";
import type { StaffRole } from "@/lib/types";

export type AuthSession = {
  uid: string;
  email: string;
  role: StaffRole;
  active: boolean;
  categories: string[];
};

type TokenPayload = {
  aud?: string;
  iss?: string;
  exp?: number;
  sub?: string;
  email?: string;
};

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  arrayValue?: { values?: FirestoreValue[] };
};

function projectId(): string {
  return (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim();
}

function decodePayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Request-dəki Firebase ID tokenini yoxlayır və aktiv staff sessiyasını qaytarır.
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthSession | null> {
  const token = bearerToken(request);
  const pid = projectId();
  if (!token || !pid) return null;

  const payload = decodePayload(token);
  if (
    !payload?.email ||
    !payload.sub ||
    payload.aud !== pid ||
    payload.iss !== `https://securetoken.google.com/${pid}` ||
    !payload.exp ||
    payload.exp * 1000 < Date.now()
  ) {
    return null;
  }

  const email = payload.email.toLowerCase();
  const url =
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/staff/` +
    encodeURIComponent(email);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { fields?: Record<string, FirestoreValue> };
    const fields = data.fields ?? {};
    const active = fields.active?.booleanValue === true;
    const role = fields.role?.stringValue as StaffRole | undefined;
    if (!active || !role) return null;

    const categories = (fields.categories?.arrayValue?.values ?? [])
      .map((value) => value.stringValue)
      .filter((value): value is string => Boolean(value));

    return { uid: payload.sub, email, role, active, categories };
  } catch (error) {
    console.error("[auth] token yoxlanmadı:", error);
    return null;
  }
}

/** İstənilən aktiv staff üzvü */
export async function requireStaffAuth(request: NextRequest): Promise<AuthSession | null> {
  return verifyAuthToken(request);
}

/** Yalnız admin */
export async function requireAdminAuth(request: NextRequest): Promise<AuthSession | null> {
  const session = await verifyAuthToken(request);
  return session?.role === "admin" ? session : null;
}

/** CRM: admin, sales, finance */
export async function requireCrmAccess(request: NextRequest): Promise<AuthSession | null> {
  const session = await verifyAuthToken(request);
  return session && ["admin", "sales", "finance"].includes(session.role) ? session : null;
}
