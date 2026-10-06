"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import Logo from "@/components/Logo";
import SearchOverlay, { type SearchItem } from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import { categories } from "@/lib/categories";
import {
  localeNames,
  localeShort,
  locales,
  formatDate,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes, swapLocale } from "@/lib/routes";

function IconMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type SubLink = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  exact: boolean;
  subs: SubLink[];
  /** Kateqoriyalarda açılan siyahının başındakı «Hamısı» linki. */
  allHref?: string;
  /** Bölmənin aktiv sayıldığı əlavə ünvanlar — «Jurnal» qrupu üçün. */
  matches?: string[];
};

/**
 * Naviqasiyada bölmənin altında açılan siyahı.
 * Açılma yalnız CSS ilə idarə olunur: kursor üstünə gələndə (`group-hover`)
 * və ya daxildəki linklərdən biri fokus alanda (`group-focus-within`).
 * Beləliklə klaviatura ilə gəzinti də işləyir.
 */
function Dropdown({ items, label }: { items: SubLink[]; label: string }) {
  return (
    <div
      className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      <ul
        aria-label={label}
        className="min-w-[13rem] border border-line bg-cream py-2 shadow-[0_22px_45px_-28px_rgba(43,20,28,0.7)]"
      >
        {items.map((sub) => (
          <li key={sub.href}>
            <Link
              href={sub.href}
              className="block whitespace-nowrap px-6 py-2.5 text-start font-ui text-[11.5px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-cream-deep/60 hover:text-bordo"
            >
              {sub.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Header({
  locale,
  searchIndex,
}: {
  locale: Locale;
  searchIndex: SearchItem[];
}) {
  const dict = getDictionary(locale);
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [today, setToday] = useState("");
  // Mobil menyuda hazırda açıq olan bölmə (bir anda yalnız biri).
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const stripRef = useRef<HTMLElement | null>(null);

  // Tarix yalnız brauzerdə hesablanır ki, server və müştəri fərqlənməsin.
  // Oxucunun öz saat qurşağındakı gün götürülür (UTC deyil).
  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    setToday(formatDate(iso, locale));
  }, [locale]);

  /**
   * Mobil bölmə lenti öz-özünə sağdan sola gedir, sona çatanda geri qayıdır —
   * beləcə bütün bölmələr növbə ilə görünür. Uc nöqtələrdə bir anlıq dayanır ki,
   * kənardakı adlar oxuna bilsin. Oxucu lentə toxunduqda və ya kursoru üstünə
   * gətirdikdə dayanır, əl çəkiləndən iki saniyə sonra davam edir.
   */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const SPEED = 55; // piksel / saniyə
    const HOLD = 2000; // toxunuşdan sonra gözləmə (ms)
    const EDGE_HOLD = 900; // uc nöqtədə dayanma (ms)

    // Ərəb dilində sürüşmə sıfırdan mənfiyə doğru gedir.
    const rtl = getComputedStyle(strip).direction === "rtl";

    let direction = 1;
    let position = 0;
    // Oxucu özü sürüşdürdükdən sonra mövqeyi lentdən yenidən oxuyuruq.
    let resync = true;
    let pausedUntil = 0;
    let last = 0;
    let frame = 0;

    const hold = () => {
      pausedUntil = performance.now() + HOLD;
      resync = true;
    };

    const step = (now: number) => {
      frame = window.requestAnimationFrame(step);

      // Səhifə uzun müddət çəkilməyibsə bir kadrda böyük sıçrayış olmasın.
      const elapsed = Math.min(now - last, 64);
      last = now;

      const max = strip.scrollWidth - strip.clientWidth;
      if (max < 8 || document.hidden || now < pausedUntil) return;

      if (resync) {
        position = Math.abs(strip.scrollLeft);
        resync = false;
      }

      position += (direction * SPEED * elapsed) / 1000;

      if (position >= max) {
        position = max;
        direction = -1;
        pausedUntil = now + EDGE_HOLD;
      } else if (position <= 0) {
        position = 0;
        direction = 1;
        pausedUntil = now + EDGE_HOLD;
      }

      strip.scrollLeft = rtl ? -position : position;
    };

    frame = window.requestAnimationFrame((now) => {
      last = now;
      frame = window.requestAnimationFrame(step);
    });

    // Kursor üstündə gəzdikcə `pointermove` gözləməni təzələyir — beləcə
    // lent oxucu ilə maraqlandığı müddətdə dayanır, sonra öz-özünə davam edir.
    const events = ["pointerdown", "pointermove", "touchstart", "wheel"] as const;
    for (const event of events) strip.addEventListener(event, hold, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      for (const event of events) strip.removeEventListener(event, hold);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Səhifə dəyişəndə menyu bağlanır.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  // «Jurnal» qrupu — kateqoriya deyil, ona görə linkləri əl ilə verilir.
  const magazineLinks: SubLink[] = [
    { href: routes.ejournal(locale), label: dict.nav.ejournal },
    { href: routes.issues(locale), label: dict.nav.editions },
    { href: routes.selected(locale), label: dict.nav.selected },
  ];

  /** Menyu sətri aktiv görünürmü — qrupun istənilən alt səhifəsi də sayılır. */
  const isItemActive = (item: NavItem) =>
    item.matches
      ? item.matches.some((href) => isActive(href))
      : item.exact
        ? pathname === item.href
        : isActive(item.href);

  const navItems: NavItem[] = [
    { href: routes.home(locale), label: dict.nav.home, exact: true, subs: [] },
    ...categories.map((category) => ({
      href: routes.category(locale, category.slug),
      label: category.name[locale],
      exact: false,
      allHref: routes.category(locale, category.slug),
      subs: category.subcategories.map((sub) => ({
        href: routes.subcategory(locale, category.slug, sub.slug),
        label: sub.name[locale],
      })),
    })),
    {
      href: routes.ejournal(locale),
      label: dict.nav.magazine,
      exact: false,
      subs: magazineLinks,
      matches: magazineLinks.map((link) => link.href),
    },
    { href: routes.contact(locale), label: dict.nav.contact, exact: true, subs: [] },
  ];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-bordo focus:px-4 focus:py-2 focus:font-ui focus:text-xs focus:uppercase focus:tracking-widest focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>

      <header className="relative z-40 bg-cream">
        {/* ---------- Üst zolaq: tarix və dillər ---------- */}
        <div className="border-b border-line bg-bordo-deep text-cream">
          <div className="container-mag flex h-9 items-center justify-between gap-4">
            <p className="hidden font-ui text-[10.5px] uppercase tracking-[0.2em] opacity-85 sm:block">
              {today}
            </p>

            <nav aria-label={dict.nav.language} className="flex items-center gap-0.5">
              {locales.map((code) => {
                const active = code === locale;
                return (
                  <Link
                    key={code}
                    href={swapLocale(pathname, code)}
                    hrefLang={code}
                    title={localeNames[code]}
                    aria-current={active ? "true" : undefined}
                    className={`px-1.5 py-1 font-ui text-[10.5px] uppercase tracking-[0.14em] transition-colors ${
                      active ? "text-gold-soft" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {localeShort[code]}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ---------- Başlıq: loqo ---------- */}
        <div className="container-mag relative flex items-center justify-between py-7 md:py-9">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={dict.nav.menu}
            className="flex items-center gap-2 p-1 text-ink transition-opacity hover:opacity-60 lg:hidden"
          >
            <IconMenu className="h-6 w-6" />
          </button>

          <Link
            href={routes.home(locale)}
            aria-label="Nesreen Magazine"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <span className="hidden md:block">
              <Logo size="lg" className="text-ink" />
            </span>
            <span className="md:hidden">
              <Logo size="md" className="text-ink" />
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle locale={locale} />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={dict.nav.openSearch}
              className="p-1.5 text-ink transition-opacity hover:opacity-60"
            >
              <IconSearch className="h-5 w-5" />
            </button>
            <Link href={routes.subscribe(locale)} className="btn-ghost hidden !py-3 !text-[11px] lg:inline-flex">
              {dict.nav.subscribe}
            </Link>
          </div>
        </div>

        {/* ---------- Naviqasiya ---------- */}
        <div className="border-y border-line">
          <nav
            className="container-mag hidden items-center justify-center gap-5 py-4 lg:flex xl:gap-8"
            aria-label={dict.nav.menu}
          >
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block whitespace-nowrap font-ui text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 xl:text-[12px] xl:tracking-[0.18em] ${
                      active ? "text-bordo" : "text-ink group-hover:text-bordo"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`mx-auto mt-1.5 block h-px bg-gold transition-all duration-500 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                      aria-hidden="true"
                    />
                  </Link>

                  {item.subs.length > 0 && (
                    <Dropdown
                      label={dict.nav.sections}
                      items={
                        item.allHref
                          ? [{ href: item.allHref, label: dict.nav.allIn }, ...item.subs]
                          : item.subs
                      }
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobil: sürüşən bölmə lenti */}
          <nav
            ref={stripRef}
            className="scrollbar-none flex gap-6 overflow-x-auto px-5 py-3.5 lg:hidden"
            aria-label={dict.nav.menu}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 font-ui text-[11.5px] uppercase tracking-[0.18em] ${
                  isItemActive(item) ? "text-bordo" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ---------- Sürüşdürəndə görünən yığcam zolaq ---------- */}
      <div
        className={`fixed inset-x-0 top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-sm transition-transform duration-500 ${
          condensed ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container-mag flex h-14 items-center justify-between gap-4 lg:gap-8">
          {/* Dar ekranda bölmələr sığmır — onların yerinə menyu düyməsi durur. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={dict.nav.menu}
            className="p-1 text-ink transition-opacity hover:opacity-60 lg:hidden"
          >
            <IconMenu className="h-6 w-6" />
          </button>

          <Link href={routes.home(locale)} aria-label="Nesreen Magazine">
            <Logo size="sm" className="text-ink" />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label={dict.nav.menu}>
            {categories.map((category) => {
              const href = routes.category(locale, category.slug);
              return (
                <div key={category.slug} className="group relative">
                  <Link
                    href={href}
                    className={`block whitespace-nowrap py-4 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors xl:tracking-[0.18em] ${
                      isActive(href) ? "text-bordo" : "text-ink group-hover:text-bordo"
                    }`}
                  >
                    {category.name[locale]}
                  </Link>

                  <Dropdown
                    label={dict.nav.sections}
                    items={[
                      { href, label: dict.nav.allIn },
                      ...category.subcategories.map((sub) => ({
                        href: routes.subcategory(locale, category.slug, sub.slug),
                        label: sub.name[locale],
                      })),
                    ]}
                  />
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={dict.nav.openSearch}
            className="p-1 text-ink transition-opacity hover:opacity-60"
          >
            <IconSearch className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* ---------- Mobil menyu ---------- */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        // `inert` həm ekran oxuyucudan gizlədir, həm də fokusu içəridə saxlamır.
        inert={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.menu}
          className={`absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-500 ease-out ${
            menuOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Logo size="sm" className="text-ink" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={dict.nav.close}
              className="p-1 text-ink"
            >
              <IconClose className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-7" aria-label={dict.nav.menu}>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const expanded = openGroup === item.href;
                return (
                  <li key={item.href} className="border-b border-line-soft">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={item.href} className="block flex-1 py-3.5 font-display text-2xl text-ink">
                        {item.label}
                      </Link>

                      {item.subs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOpenGroup(expanded ? null : item.href)}
                          aria-expanded={expanded}
                          aria-label={`${item.label} — ${dict.nav.sections}`}
                          className="p-2 text-muted transition-colors hover:text-bordo"
                        >
                          <IconChevron
                            className={`h-5 w-5 transition-transform duration-300 ${
                              expanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {item.subs.length > 0 && expanded && (
                      <ul className="pb-4 ps-1">
                        {item.subs.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block py-2 font-ui text-[11.5px] uppercase tracking-[0.16em] text-ink-soft hover:text-bordo"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-9">
              <p className="eyebrow text-muted">{dict.nav.language}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {locales.map((code) => (
                  <Link
                    key={code}
                    href={swapLocale(pathname, code)}
                    hrefLang={code}
                    className={`border px-3 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      code === locale
                        ? "border-bordo bg-bordo text-cream"
                        : "border-line text-ink hover:border-bordo"
                    }`}
                  >
                    {localeShort[code]}
                  </Link>
                ))}
              </div>
            </div>

            <Link href={routes.subscribe(locale)} className="btn-primary mt-9 w-full">
              {dict.nav.subscribe}
            </Link>
          </nav>
        </div>
      </div>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
        items={searchIndex}
      />
    </>
  );
}
