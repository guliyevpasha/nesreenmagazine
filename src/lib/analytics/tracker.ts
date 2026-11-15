/**
 * Client-side Analytics Tracker
 *
 * Hər səhifə keçidində `/api/track`-a «pageview», oxucu səhifədə aktiv olduqca
 * (tab görünür) hər 60 saniyədən bir və səhifədən çıxanda «engagement» göndərir.
 *
 * - Sessiya: tabda 30 dəqiqə fəaliyyətsizlikdən sonra yeni sessiya başlayır.
 * - Ziyarətçi: localStorage-dakı anonim id (ViewTracker ilə eyni).
 * - İşçilər: admin panelə daxil olmuş brauzer statistikaya düşmür (markStaffBrowser).
 */

import * as gtag from "./google-analytics";

const VISITOR_KEY = "nesreen_visitor_id";
const SESSION_KEY = "nm_session";
const STAFF_KEY = "nm-staff";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 60 * 1000;

let gaInitialized = false;

function randomId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/* ───────────── İşçi brauzeri ───────────── */

/** Admin panelə daxil olanda çağırılır — bu brauzer artıq statistikaya düşmür. */
export function markStaffBrowser(): void {
  try {
    localStorage.setItem(STAFF_KEY, "1");
  } catch {
    /* localStorage bağlıdır */
  }
}

export function isStaffBrowser(): boolean {
  try {
    return localStorage.getItem(STAFF_KEY) === "1";
  } catch {
    return false;
  }
}

/* ───────────── Ziyarətçi və sessiya ───────────── */

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY) || "";
    if (!/^[A-Za-z0-9_-]{4,80}$/.test(id)) {
      id = randomId("v");
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

type SessionState = { id: string; last: number; pages: number };

/** Sessiyanı yeniləyir: yeni səhifə sayılır, vaxt aşıbsa yeni sessiya başlayır. */
function touchSession(countPage: boolean): { state: SessionState; isNew: boolean } {
  const now = Date.now();
  let state: SessionState | null = null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) state = JSON.parse(raw) as SessionState;
  } catch {
    state = null;
  }
  let isNew = false;
  if (!state || !state.id || now - state.last > SESSION_TIMEOUT_MS) {
    state = { id: randomId("s"), last: now, pages: 0 };
    isNew = true;
  }
  state.last = now;
  if (countPage) state.pages += 1;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    /* sessionStorage bağlıdır — sessiya yalnız yaddaşda qalır */
  }
  return { state, isNew };
}

/* ───────────── Göndərmə ───────────── */

function send(payload: Record<string, unknown>, beacon = false): void {
  const body = JSON.stringify(payload);
  try {
    if (beacon && typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* tracking oxucuya mane olmamalıdır */
  }
}

/* ───────────── Aktiv vaxt ───────────── */

const engagement = {
  path: "",
  locale: "az",
  accumulated: 0, // ms, hələ göndərilməyib
  visibleSince: 0, // tab görünürsə başlanğıc, deyilsə 0
  first: true,
};
let listenersReady = false;
let flushTimer: number | undefined;

function flushEngagement(beacon: boolean): void {
  if (!engagement.path) return;
  const now = Date.now();
  let ms = engagement.accumulated;
  if (engagement.visibleSince) {
    ms += now - engagement.visibleSince;
    engagement.visibleSince = now;
  }
  engagement.accumulated = 0;
  const seconds = Math.round(ms / 1000);
  if (seconds < 1) return;
  const { state } = touchSession(false);
  send(
    {
      type: "engagement",
      path: engagement.path,
      locale: engagement.locale,
      sessionId: state.id,
      seconds: Math.min(seconds, 120),
      first: engagement.first,
    },
    beacon,
  );
  engagement.first = false;
}

function ensureListeners(): void {
  if (listenersReady) return;
  listenersReady = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushEngagement(true);
      engagement.visibleSince = 0;
    } else {
      engagement.visibleSince = Date.now();
    }
  });
  window.addEventListener("pagehide", () => flushEngagement(true));
  flushTimer = window.setInterval(() => {
    if (!document.hidden) flushEngagement(false);
  }, FLUSH_INTERVAL_MS);
  void flushTimer;
}

function startEngagement(path: string, locale: string): void {
  flushEngagement(false); // əvvəlki səhifənin vaxtı
  engagement.path = path;
  engagement.locale = locale;
  engagement.accumulated = 0;
  engagement.visibleSince = document.hidden ? 0 : Date.now();
  engagement.first = true;
  ensureListeners();
}

/* ───────────── İctimai API ───────────── */

let lastTracked = { path: "", at: 0 };

/** Səhifə baxışını qeyd edir. */
export function trackPage(params: { path: string; locale: string }): void {
  if (typeof window === "undefined") return;
  if (isStaffBrowser()) return;

  // React StrictMode / təkrar render eyni səhifəni iki dəfə saymasın
  const now = Date.now();
  if (lastTracked.path === params.path && now - lastTracked.at < 2000) return;
  lastTracked = { path: params.path, at: now };

  const { state, isNew } = touchSession(true);
  send({
    type: "pageview",
    path: params.path,
    locale: params.locale,
    visitorId: getVisitorId() || undefined,
    sessionId: state.id,
    newSession: isNew,
    sessionPage: state.pages,
    // Referrer yalnız sessiyanın girişində mənalıdır (daxili keçidlərdə köhnə dəyər qalır)
    referrer: isNew ? document.referrer || "" : "",
  });
  startEngagement(params.path, params.locale);
}

/** Saytdaxili axtarış sözünü qeyd edir (açar sözlər statistikası). */
export function trackSearch(term: string, locale: string): void {
  if (typeof window === "undefined" || isStaffBrowser()) return;
  const q = term.trim();
  if (q.length < 2) return;
  send({ type: "search", q: q.slice(0, 100), locale });
}

/** Köhnə API ilə uyğunluq üçün — aktiv vaxt artıq trackPage içində ölçülür. */
export function trackTimeOnPage(): void {}

/**
 * Analytics-i initialize edir. Hər səhifə keçidində çağırılır.
 */
export function initAnalytics(params: {
  path: string;
  articleId?: string;
  articleTitle?: string;
  category?: string;
  locale: string;
}): void {
  if (typeof window === "undefined") return;
  const staff = isStaffBrowser();

  // Google Analytics (işçilər GA-da da sayılmır)
  if (!staff && gtag.GA_MEASUREMENT_ID) {
    if (!gaInitialized) {
      gtag.initGA();
      gaInitialized = true;
    }
    gtag.pageview(params.path);
  }

  trackPage({ path: params.path, locale: params.locale });
}

/**
 * Custom event tracking - Google Analytics ilə inteqrasiya.
 */
export function trackEvent(params: {
  eventName: string;
  category: string;
  label?: string;
  value?: number;
}): void {
  if (typeof window === "undefined") return;

  if (gtag.GA_MEASUREMENT_ID) {
    gtag.event({
      action: params.eventName,
      category: params.category,
      label: params.label,
      value: params.value,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Custom event:", params);
  }
}
