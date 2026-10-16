"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Logo, { RoseMark } from "@/components/Logo";
import { categories } from "@/lib/categories";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data/admin";
import { isAdmin, roleLabels, useAuth } from "@/lib/firebase/auth";
import type { Notification, NotificationPriority } from "@/lib/types";
import { notificationTypeLabels } from "@/lib/types";

import LoginScreen from "./LoginScreen";
import SetupNotice from "./SetupNotice";

/* -------------------------------- ikonlar ------------------------------- */

function Icon({ d, className = "h-[18px] w-[18px]" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard: "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-16v5h7V4h-7Z",
  articles: "M5 4h11l3 3v13H5V4Zm11 0v3h3M8 11h8M8 15h8M8 7h4",
  stars: "M12 3l2.3 5.2L20 9.3l-4 3.9.9 5.8L12 16.3 7.1 19l.9-5.8-4-3.9 5.7-1.1L12 3Z",
  banner: "M3 6h18v9H3V6Zm4 13h10M12 15v4",
  ebook: "M12 6.25v13.5M5 10h13.5M5 14h13.5M8 18h8M8 6h8M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  ejournal: "M5 4h9l5 5v11H5V4Zm9 0v5h5M9 13h6M9 16h4",
  mail: "M3 6h18v12H3V6Zm0 .5 9 6.5 9-6.5",
  staff: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6M17 8a2.8 2.8 0 1 0 0-5.6M18 20c0-2.6-1.1-4.9-2.8-6.2",
  site: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 3.8 5.5 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3ZM3.3 9h17.4M3.3 15h17.4",
  analytics: "M3 3v18h18M7 16l4-4 4 4 6-6",
  logout: "M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2M19 12H9m10 0-3-3m3 3-3 3",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M6 6l12 12M18 6 6 18",
  crm: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 4v6M20 18h-6",
  adorders: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4",
  contentplan: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  subscribers: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 0-3 3m0 0-3-3m3 3V8",
  media: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
  seo: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Zm-6-3v3l2 2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.5-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM5.5 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM12 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM12 18.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z",
  audit: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138Z",
};

/* ── Bildiriş dropdown ───────────────────────────────────────────────────── */

const priorityColors: Record<NotificationPriority, string> = {
  high:   "border-l-red-500",
  medium: "border-l-yellow-400",
  low:    "border-l-blue-400",
};

const notifIcons: Record<string, string> = {
  overdue_payment:   "💰",
  overdue_content:   "📋",
  new_message:       "✉️",
  new_subscriber:    "🔔",
  article_published: "📰",
  low_stock:         "⚠️",
  system:            "⚙️",
};

function NotificationBell({ userRole }: { userRole: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function load() {
    setLoading(true);
    try {
      const all = await listNotifications(30);
      // Rol filtri — forRole boşsa hamıya göstər
      const filtered = all.filter(
        (n) => !n.forRole || n.forRole.length === 0 || n.forRole.includes(userRole),
      );
      setNotifications(filtered);
    } catch {
      // səssiz xəta
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Hər 60 saniyədə yenilə
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Xaricdə klik edildikdə bağla
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center text-cream/70 hover:text-cream transition-colors"
        aria-label="Bildirişlər"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-ui text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 border border-line bg-paper shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-ui text-[12px] font-semibold text-ink">
              Bildirişlər {unreadCount > 0 && <span className="ml-1 text-bordo">({unreadCount})</span>}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="font-ui text-[10px] text-muted hover:text-ink transition-colors uppercase tracking-[0.1em]"
              >
                Hamısını oxu
              </button>
            )}
          </div>

          {/* Bildirişlər siyahısı */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-center font-ui text-[12px] text-muted">Yüklənir…</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center font-ui text-[12px] text-muted">
                Bildiriş yoxdur
              </div>
            )}
            {!loading && notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-l-2 border-b border-line px-4 py-3 transition-colors cursor-pointer ${
                  notif.read ? "bg-paper opacity-60" : "bg-cream-deep/30"
                } ${priorityColors[notif.priority]} hover:bg-cream-deep/50`}
                onClick={() => {
                  void handleMarkRead(notif.id);
                  if (notif.href) window.location.href = notif.href;
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">{notifIcons[notif.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[12px] font-medium text-ink line-clamp-1">{notif.title}</p>
                    <p className="mt-0.5 font-ui text-[11px] text-muted line-clamp-2">{notif.body}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-ui text-[9px] uppercase tracking-[0.1em] text-muted/70">
                        {notificationTypeLabels[notif.type]}
                      </span>
                      <span className="font-ui text-[9px] text-muted/60">
                        {notif.createdAt.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bordo" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-line px-4 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full font-ui text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink transition-colors py-1"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ yan menyu ------------------------------- */

function NavLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon?: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-s-2 px-4 py-2.5 font-ui text-[13px] transition-colors ${
        active
          ? "border-gold bg-white/10 text-cream"
          : "border-transparent text-cream/65 hover:border-cream/25 hover:bg-white/5 hover:text-cream"
      }`}
    >
      {icon ? <Icon d={icon} /> : <span className="h-1 w-1 rounded-full bg-current opacity-60" />}
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-gold/20 px-2 py-0.5 font-ui text-[10px] text-gold-soft">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const { loading, configured, session, unauthorized, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const [menuOpen, setMenuOpen] = useState(false);

  if (!configured) return <SetupNotice />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <RoseMark className="mx-auto h-10 w-10 animate-pulse text-bordo/60" strokeWidth={1} />
          <p className="mt-4 font-ui text-xs uppercase tracking-[0.2em] text-muted">
            Yüklənir…
          </p>
        </div>
      </div>
    );
  }

  if (!session) return <LoginScreen unauthorized={unauthorized} />;

  const canManage = isAdmin(session);

  const sidebar = (
    <div className="flex h-full flex-col bg-bordo-deep">
      <div className="border-b border-white/10 px-5 py-6">
        <Logo size="sm" className="text-cream" markClassName="text-gold" />
        <p className="mt-3 font-ui text-[10px] uppercase tracking-[0.22em] text-cream/45">
          İdarə paneli
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-5">
        <NavLink
          href="/admin"
          label="Panel"
          icon={ICONS.dashboard}
          active={pathname === "/admin"}
        />
        <NavLink
          href="/admin/analytics"
          label="Statistika"
          icon={ICONS.analytics}
          active={pathname === "/admin/analytics"}
        />

        <p className="mt-6 px-4 pb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-cream/35">
          Məqalələr
        </p>
        <NavLink
          href="/admin/articles"
          label="Bütün məqalələr"
          icon={ICONS.articles}
          active={pathname === "/admin/articles" && !activeCategory}
        />
        {categories.map((category) => (
          <NavLink
            key={category.slug}
            href={`/admin/articles?category=${category.slug}`}
            label={category.name.az}
            active={pathname === "/admin/articles" && activeCategory === category.slug}
          />
        ))}

        <p className="mt-6 px-4 pb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-cream/35">
          Bölmələr
        </p>
        <NavLink
          href="/admin/astrology"
          label="Bürc şərhləri"
          icon={ICONS.stars}
          active={pathname.startsWith("/admin/astrology")}
        />
        <NavLink
          href="/admin/media"
          label="Media Kitabxanası"
          icon={ICONS.media}
          active={pathname.startsWith("/admin/media")}
        />
        <NavLink
          href="/admin/ejournals"
          label="E-jurnal"
          icon={ICONS.ejournal}
          active={pathname.startsWith("/admin/ejournals")}
        />
        <NavLink
          href="/admin/banners"
          label="Reklam bannerləri"
          icon={ICONS.banner}
          active={pathname.startsWith("/admin/banners")}
        />
        <NavLink
          href="/admin/ebook-banner"
          label="E-kitab Reklamı"
          icon={ICONS.ebook}
          active={pathname.startsWith("/admin/ebook-banner")}
        />
        <NavLink
          href="/admin/messages"
          label="Mesajlar"
          icon={ICONS.mail}
          active={pathname.startsWith("/admin/messages")}
        />
        {canManage && (
          <NavLink
            href="/admin/staff"
            label="İşçilər"
            icon={ICONS.staff}
            active={pathname.startsWith("/admin/staff")}
          />
        )}

        <p className="mt-6 px-4 pb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-cream/35">
          CRM və Biznes
        </p>
        <NavLink
          href="/admin/crm"
          label="Müştərilər"
          icon={ICONS.crm}
          active={pathname.startsWith("/admin/crm")}
        />
        <NavLink
          href="/admin/ad-orders"
          label="Reklam Sifarişləri"
          icon={ICONS.adorders}
          active={pathname.startsWith("/admin/ad-orders")}
        />
        <NavLink
          href="/admin/sales-forecast"
          label="Satış Proqnozu"
          icon={ICONS.analytics}
          active={pathname.startsWith("/admin/sales-forecast")}
        />

        <p className="mt-6 px-4 pb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-cream/35">
          Redaksiya
        </p>
        <NavLink
          href="/admin/content-plan"
          label="Kontent Planı"
          icon={ICONS.contentplan}
          active={pathname.startsWith("/admin/content-plan")}
        />
        <NavLink
          href="/admin/subscribers"
          label="Abunəçilər"
          icon={ICONS.subscribers}
          active={pathname.startsWith("/admin/subscribers")}
        />

        <p className="mt-6 px-4 pb-2 font-ui text-[10px] uppercase tracking-[0.2em] text-cream/35">
          Sayt
        </p>
        <NavLink
          href="/admin/seo"
          label="SEO"
          icon={ICONS.seo}
          active={pathname.startsWith("/admin/seo")}
        />
        <NavLink
          href="/admin/site-settings"
          label="Sayt Parametrləri"
          icon={ICONS.settings}
          active={pathname.startsWith("/admin/site-settings")}
        />
        {canManage && (
          <NavLink
            href="/admin/audit"
            label="Audit Jurnalı"
            icon={ICONS.audit}
            active={pathname.startsWith("/admin/audit")}
          />
        )}
        <a
          href="/az"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border-s-2 border-transparent px-4 py-2.5 font-ui text-[13px] text-cream/65 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <Icon d={ICONS.site} />
          <span>Saytı aç</span>
        </a>
      </nav>

      <div className="border-t border-white/10 px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="truncate font-ui text-[13px] font-semibold text-cream">
            {session.name || "Nesrin Abbasova"}
          </p>
          <NotificationBell userRole={session.role} />
        </div>
        <p className="truncate font-ui text-[11px] text-cream/45">{session.email}</p>
        <p className="mt-2 inline-block bg-gold/20 px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] text-gold-soft">
          {roleLabels[session.role]}
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-4 flex w-full items-center gap-2 border border-cream/20 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.14em] text-cream/75 transition-colors hover:border-gold hover:text-gold"
        >
          <Icon d={ICONS.logout} className="h-4 w-4" />
          Çıxış
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Geniş ekran */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobil */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-paper px-5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menyu"
            className="p-1 text-ink"
          >
            <Icon d={ICONS.menu} className="h-6 w-6" />
          </button>
          <Logo size="sm" className="text-ink" />
          <div className="ml-auto">
            <NotificationBell userRole={session.role} />
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
