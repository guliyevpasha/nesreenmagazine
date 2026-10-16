/**
 * Client-side Analytics Tracker
 * Ziyarətçi davranışını izləyir və Firestore-a yazır.
 */

import { trackPageView, trackSession, incrementArticleView } from "@/lib/data/admin";
import type { PageViewInput, SessionDataInput } from "@/lib/types";

// Session ID - browser session üçün unikal identifikator
let sessionId: string | null = null;
let sessionStartTime: number | null = null;
let pageViewCount = 0;
let landingPage: string | null = null;

/**
 * Session ID yaradır və ya mövcud olanı qaytarır.
 */
function getSessionId(): string {
  if (sessionId) return sessionId;

  // SessionStorage-dan oxu
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("nesreen_session_id");
    if (stored) {
      sessionId = stored;
      return sessionId;
    }
  }

  // Yeni session ID yarat
  sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  if (typeof window !== "undefined") {
    sessionStorage.setItem("nesreen_session_id", sessionId);
  }

  return sessionId;
}

/**
 * User agent-dən device type təyin edir.
 */
function getDeviceType(ua: string): "mobile" | "tablet" | "desktop" {
  if (/mobile/i.test(ua) && !/tablet|ipad/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

/**
 * User agent-dən browser təyin edir.
 */
function getBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera")) return "Opera";
  return "Other";
}

/**
 * User agent-dən OS təyin edir.
 */
function getOS(ua: string): string {
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
}

/**
 * Referrer-dən traffic source təyin edir.
 */
function getTrafficSource(referrer: string): "organic" | "social" | "direct" | "referral" | "email" | "ads" {
  if (!referrer || referrer === "") return "direct";

  const ref = referrer.toLowerCase();

  // Social media
  if (ref.includes("facebook") || ref.includes("instagram") || ref.includes("twitter") || 
      ref.includes("linkedin") || ref.includes("tiktok") || ref.includes("youtube")) {
    return "social";
  }

  // Search engines
  if (ref.includes("google") || ref.includes("bing") || ref.includes("yahoo") || 
      ref.includes("duckduckgo") || ref.includes("yandex")) {
    return "organic";
  }

  // Email
  if (ref.includes("mail.") || ref.includes("email")) {
    return "email";
  }

  // Ads
  if (ref.includes("ads") || ref.includes("campaign") || ref.includes("utm_")) {
    return "ads";
  }

  return "referral";
}

/**
 * IP hash (privacy-friendly) - sadələşdirilmiş versiya.
 * Real implementasiyada server-side hash lazımdır.
 */
function getIpHash(): string {
  // Client-side IP əldə etmək mümkün deyil, placeholder
  return "hashed-ip";
}

/**
 * Səhifə baxışını qeyd edir.
 */
export async function trackPage(params: {
  path: string;
  articleId?: string;
  articleTitle?: string;
  category?: string;
  locale: string;
}): Promise<void> {
  if (typeof window === "undefined") return; // SSR check

  try {
    const sessionIdValue = getSessionId();
    const now = Date.now();

    // İlk baxışdırsa
    if (!sessionStartTime) {
      sessionStartTime = now;
      landingPage = params.path;
    }

    pageViewCount++;

    const pageViewData: PageViewInput = {
      path: params.path,
      articleId: params.articleId,
      articleTitle: params.articleTitle,
      category: params.category as any,
      locale: params.locale as any,
      sessionId: sessionIdValue,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      ipHash: getIpHash(),
      viewedAt: new Date().toISOString(),
    };

    // Firestore-a yaz
    await trackPageView(pageViewData);

    // Məqalə səhifəsidirsə, article analytics-i yenilə
    if (params.articleId) {
      await incrementArticleView(params.articleId, sessionIdValue);
    }

    // Session məlumatını yenilə
    await updateSession(params.path);
  } catch (error) {
    // Səssiz xəta - tracking user experience-ə təsir etməməlidir
    console.warn("[Analytics] Track page failed:", error);
  }
}

/**
 * Session məlumatını yeniləyir.
 */
async function updateSession(currentPath: string): Promise<void> {
  if (!sessionId || !sessionStartTime) return;

  const now = Date.now();
  const duration = Math.floor((now - sessionStartTime) / 1000); // seconds

  const ua = navigator.userAgent;

  const sessionData: SessionDataInput = {
    sessionId,
    startedAt: new Date(sessionStartTime).toISOString(),
    endedAt: new Date(now).toISOString(),
    duration,
    pageViews: pageViewCount,
    landingPage: landingPage || currentPath,
    exitPage: currentPath,
    referrer: document.referrer || "",
    source: getTrafficSource(document.referrer),
    device: getDeviceType(ua),
    browser: getBrowser(ua),
    os: getOS(ua),
    locale: document.documentElement.lang as any || "az",
    bounced: pageViewCount === 1,
  };

  try {
    await trackSession(sessionData);
  } catch (error) {
    console.warn("[Analytics] Update session failed:", error);
  }
}

/**
 * Səhifədə qalma müddətini qeyd edir (page view-a timeOnPage əlavə edir).
 */
export function trackTimeOnPage(): void {
  if (typeof window === "undefined") return;

  let startTime = Date.now();
  let isActive = true;

  // Visibility API - tab aktivdirmi?
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isActive = false;
    } else {
      isActive = true;
      startTime = Date.now(); // Reset timer
    }
  });

  // Page unload olduqda müddəti qeyd et
  window.addEventListener("beforeunload", () => {
    if (isActive) {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      // Navigator.sendBeacon istifadə edərək son məlumatı göndər
      const data = JSON.stringify({ sessionId, timeOnPage });
      navigator.sendBeacon("/api/analytics/time", data);
    }
  });
}

/**
 * Analytics-i initialize edir.
 * Hər səhifə yüklənərkən çağırılmalıdır.
 */
export function initAnalytics(params: {
  path: string;
  articleId?: string;
  articleTitle?: string;
  category?: string;
  locale: string;
}): void {
  if (typeof window === "undefined") return;

  // İlk track
  trackPage(params);

  // Time tracking
  trackTimeOnPage();
}

/**
 * Custom event tracking (gələcək genişləmə üçün).
 */
export function trackEvent(params: {
  eventName: string;
  category: string;
  label?: string;
  value?: number;
}): void {
  console.log("[Analytics] Custom event:", params);
  // Custom event tracking implementasiyası (gələcək)
}
