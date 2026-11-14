/**
 * Bülleten abunəliyi — brauzer və server üçün ortaq köməkçilər.
 *
 * Abunəçi sənədi: `subscribers/{id}`
 *   - id      — e-poçtun SHA-256 heşi (eyni e-poçt iki dəfə yazılmır)
 *   - email, locale (az|en|ru|tr|ar), active, createdAt, source
 *   - token   — gizli imtina açarı (yalnız admin oxuya bilir, linkdə gedir)
 *   - unsubscribedAt / resubscribedAt — tarixçə
 * Köhnə qeydlərdə (avtomatik id, `token` yoxdur) admin göndərmədən əvvəl
 * token yaradılır — bax: `ensureSubscriberTokens` (src/lib/data/admin.ts).
 */

import { locales, type Locale } from "@/lib/i18n/config";

export type NewsletterRecipient = {
  id: string;
  email: string;
  token: string;
};

/** Göndərmə üçün abunəçinin minimal forması */
export type SubscriberLike = {
  id: string;
  email: string;
  locale?: string;
  active: boolean;
  token?: string;
  createdAt?: string;
  resubscribedAt?: string;
  unsubscribedAt?: string;
};

export function isNewsletterLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Təsadüfi, URL-də təhlükəsiz 32 simvolluq açar (Web Crypto — brauzer və Node 20). */
export function newUnsubscribeToken(): string {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** E-poçtdan sabit sənəd id-si: sha256(email) hex. */
export async function subscriberIdFor(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const hash = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function lastActivity(s: SubscriberLike): string {
  return [s.createdAt, s.resubscribedAt, s.unsubscribedAt]
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1) ?? "";
}

/**
 * Eyni e-poçt üçün bir neçə qeyd ola bilər (köhnə avtomatik id + yeni heş id).
 * Ən son əməliyyatı olan qeyd qərar verir: imtina edibsə — göndərilmir.
 */
export function latestPerEmail<T extends SubscriberLike>(subscribers: T[]): T[] {
  const byEmail = new Map<string, T>();
  for (const sub of subscribers) {
    const key = sub.email.trim().toLowerCase();
    const current = byEmail.get(key);
    if (!current || lastActivity(sub) > lastActivity(current)) byEmail.set(key, sub);
  }
  return [...byEmail.values()];
}
