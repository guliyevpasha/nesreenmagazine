"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import Logo, { RoseMark } from "@/components/Logo";
import QuickCreateModal from "@/components/admin/QuickCreateModal";
import SearchBar from "@/components/admin/SearchBar";
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
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 font-ui text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
            <p className="font-ui text-[13px] font-bold text-white">
              Bildirişlər {unreadCount > 0 && <span className="ml-1">({unreadCount})</span>}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="font-ui text-[11px] text-white/90 hover:text-white transition-colors font-medium"
              >
                Hamısını oxunmuş say
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center font-ui text-[12px] text-slate-500">Yüklənir…</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className="font-ui text-[12px] text-slate-500">Bildiriş yoxdur</p>
              </div>
            )}
            {!loading && notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-l-4 border-b border-slate-100 px-4 py-3 transition-all cursor-pointer ${
                  notif.read ? "bg-white opacity-70" : "bg-purple-50"
                } ${priorityColors[notif.priority]} hover:bg-slate-50`}
                onClick={() => {
                  void handleMarkRead(notif.id);
                  if (notif.href) window.location.href = notif.href;
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-base">
                    {notifIcons[notif.type] ?? "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[13px] font-semibold text-slate-900 line-clamp-1">{notif.title}</p>
                    <p className="mt-1 font-ui text-[12px] text-slate-600 line-clamp-2">{notif.body}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 font-ui text-[10px] font-medium text-slate-700">
                        {notificationTypeLabels[notif.type]}
                      </span>
                      <span className="font-ui text-[10px] text-slate-400">
                        {notif.createdAt.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  {!notif.read && (
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-600 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full font-ui text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors py-1.5"
            >
              Close
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
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-[13px] transition-all ${
        active
          ? "bg-gold text-bordo-deep shadow-lg shadow-gold/30"
          : "text-cream/70 hover:bg-white/5 hover:text-cream"
      }`}
    >
      {icon ? (
        <Icon d={icon} className={`h-[18px] w-[18px] transition-transform group-hover:scale-110 ${active ? "text-bordo-deep" : "text-cream/60"}`} />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-bordo-deep" : "bg-cream/40"}`} />
      )}
      <span className="flex-1 truncate font-medium">{label}</span>
      {badge && (
        <span className="rounded-full bg-gold/30 px-2 py-0.5 font-ui text-[10px] font-semibold text-gold-soft">
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
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  if (!configured) return <SetupNotice />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RoseMark className="mx-auto h-10 w-10 animate-pulse text-purple-600/60" strokeWidth={1} />
          <p className="mt-4 font-ui text-xs uppercase tracking-[0.2em] text-slate-500">
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
      {/* Logo və branding */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <RoseMark className="h-8 w-8 text-gold" strokeWidth={1.5} />
          <div>
            <p className="font-ui text-[15px] font-bold text-cream">NESREEN</p>
            <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-cream/60">Magazine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* İdarə Panelim */}
        <p className="px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          İdarə Panelim
        </p>
        <NavLink
          href="/admin"
          label="İcmal"
          icon={ICONS.dashboard}
          active={pathname === "/admin"}
        />
        <NavLink
          href="/admin/analytics"
          label="Analitika"
          icon={ICONS.analytics}
          active={pathname.startsWith("/admin/analytics")}
        />

        {/* Kontent */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Kontent
        </p>
        <NavLink
          href="/admin/articles"
          label="Məqalələr"
          icon={ICONS.articles}
          active={pathname === "/admin/articles" && !activeCategory}
        />
        {categories.slice(0, 5).map((category) => (
          <NavLink
            key={category.slug}
            href={`/admin/articles?category=${category.slug}`}
            label={category.name.az}
            active={pathname === "/admin/articles" && activeCategory === category.slug}
          />
        ))}

        {/* SEO Alətləri */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          SEO Alətləri
        </p>
        <NavLink
          href="/admin/seo"
          label="SEO İdarəçisi"
          icon={ICONS.seo}
          active={pathname.startsWith("/admin/seo")}
        />
        <NavLink
          href="/admin/astrology"
          label="Astrologiya"
          icon={ICONS.stars}
          active={pathname.startsWith("/admin/astrology")}
        />

        {/* Alətlər */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Alətlər
        </p>
        <NavLink
          href="/admin/translations"
          label="Tərcümə İdarəçisi"
          icon={ICONS.site}
          active={pathname.startsWith("/admin/translations")}
        />
        <NavLink
          href="/admin/categories"
          label="Kateqoriyalar"
          icon={ICONS.site}
          active={pathname.startsWith("/admin/categories")}
        />
        <NavLink
          href="/admin/media"
          label="Media Kitabxanası"
          icon={ICONS.media}
          active={pathname.startsWith("/admin/media")}
        />
        <NavLink
          href="/admin/content-plan"
          label="Kontent Planı"
          icon={ICONS.contentplan}
          active={pathname.startsWith("/admin/content-plan")}
        />

        {/* Marketinq */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Marketinq
        </p>
        <NavLink
          href="/admin/banners"
          label="Reklam Bannerləri"
          icon={ICONS.banner}
          active={pathname.startsWith("/admin/banners")}
        />
        <NavLink
          href="/admin/ejournals"
          label="E-Jurnallar"
          icon={ICONS.ejournal}
          active={pathname.startsWith("/admin/ejournals")}
        />
        <NavLink
          href="/admin/subscriptions"
          label="Üzvlük Planları"
          icon={ICONS.crm}
          active={pathname.startsWith("/admin/subscriptions")}
        />
        <NavLink
          href="/admin/push-notifications"
          label="Push Bildirişlər"
          icon={ICONS.mail}
          active={pathname.startsWith("/admin/push-notifications")}
        />
        <NavLink
          href="/admin/subscribers"
          label="Abunəçilər"
          icon={ICONS.subscribers}
          active={pathname.startsWith("/admin/subscribers")}
        />

        {/* CRM bölməsi */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          CRM
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

        {/* Bildirişlər */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Bildirişlər
        </p>
        <NavLink
          href="/admin/messages"
          label="Mesajlar"
          icon={ICONS.mail}
          active={pathname.startsWith("/admin/messages")}
        />

        {/* Parametrlər */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Parametrlər
        </p>
        <NavLink
          href="/admin/site-settings"
          label="Sayt Parametrləri"
          icon={ICONS.settings}
          active={pathname.startsWith("/admin/site-settings")}
        />
        {canManage && (
          <>
            <NavLink
              href="/admin/staff"
              label="İşçilər"
              icon={ICONS.staff}
              active={pathname.startsWith("/admin/staff")}
            />
            <NavLink
              href="/admin/audit"
              label="Audit Jurnalı"
              icon={ICONS.audit}
              active={pathname.startsWith("/admin/audit")}
            />
          </>
        )}

        {/* Profil */}
        <p className="mt-5 px-3 pb-2 font-ui text-[10px] uppercase tracking-[0.16em] text-cream/50 font-semibold">
          Profil
        </p>
        <a
          href="/az"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-ui text-[13px] text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
        >
          <Icon d={ICONS.site} />
          <span>Sayta bax</span>
        </a>
      </nav>

      {/* User profil */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-ui text-[13px] font-bold text-bordo-deep">
            {(session.name || "Nesrin Abbasova").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-ui text-[13px] font-semibold text-white">
              {session.name || "Nesrin Abbasova"}
            </p>
            <p className="truncate font-ui text-[11px] text-slate-400">{roleLabels[session.role]}</p>
          </div>
          <NotificationBell userRole={session.role} />
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 font-ui text-[12px] text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <Icon d={ICONS.logout} className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Top Bar with Search */}
        <div className="hidden border-b border-slate-200 bg-white px-6 py-4 lg:block">
          <div className="flex items-center gap-4">
            <SearchBar />
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 font-ui text-[13px] font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Tez Yarat</span>
            </button>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menyu"
            className="p-1 text-slate-700 hover:text-slate-900"
          >
            <Icon d={ICONS.menu} className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <RoseMark className="h-6 w-6 text-purple-600" strokeWidth={1.5} />
            <span className="font-ui text-[14px] font-bold text-slate-900">NESREEN</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow-lg transition-transform hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <NotificationBell userRole={session.role} />
          </div>
        </div>

        <main className="min-w-0 flex-1 bg-slate-50">{children}</main>
      </div>

      {/* Quick Create Modal */}
      <QuickCreateModal isOpen={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />
    </div>
  );
}
