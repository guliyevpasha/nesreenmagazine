"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";

import { RoseMark } from "@/components/Logo";
import type { Locale } from "@/lib/i18n/config";
import type { TocItem } from "@/lib/content/sanitize-article";

/**
 * Məqalənin mündəricatı — jurnal üslubunda kart.
 *  • H2 bölmələri nömrələnir (01, 02 …, Playfair kursiv), H3-lər alt sətir kimi.
 *  • Oxucu sürüşdükcə hazırda oxunan bölmə vurğulanır (scroll-spy).
 *  • Mobil: 5-dən çox bölmə varsa siyahı yığılır, «Hamısını göstər» ilə açılır.
 *  • RTL (ar) üçün məntiqi xassələr (ps/pe, border-s) istifadə olunur.
 */

const LABELS: Record<Locale, { title: string; more: string; less: string; sections: (n: number) => string }> = {
  az: { title: "Mündəricat", more: "Hamısını göstər", less: "Gizlət", sections: (n) => `${n} bölmə` },
  en: { title: "Contents", more: "Show all", less: "Show less", sections: (n) => `${n} ${n === 1 ? "section" : "sections"}` },
  ru: {
    title: "Содержание",
    more: "Показать все",
    less: "Свернуть",
    sections: (n) => {
      const m10 = n % 10;
      const m100 = n % 100;
      const word = m10 === 1 && m100 !== 11 ? "раздел" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "раздела" : "разделов";
      return `${n} ${word}`;
    },
  },
  tr: { title: "İçindekiler", more: "Tümünü göster", less: "Gizle", sections: (n) => `${n} bölüm` },
  ar: { title: "المحتويات", more: "عرض الكل", less: "عرض أقل", sections: (n) => `${n} أقسام` },
};

/** Mobil görünüşdə yığılmadan göstərilən sətir sayı */
const COLLAPSED_COUNT = 5;

export default function ArticleToc({ items, locale }: { items: TocItem[]; locale: Locale }) {
  const t = LABELS[locale];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // H2-lərə ardıcıl nömrə, H3-lər nömrəsiz
  const numbered = useMemo(() => {
    let n = 0;
    return items.map((item) => ({ ...item, num: item.level === 2 ? ++n : null }));
  }, [items]);
  const sectionCount = numbered.filter((i) => i.num !== null).length || items.length;

  /** Başlığa yumşaq sürüşmə — sabit menyunun hündürlüyü qədər boşluq saxlanılır */
  function goTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 96;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    setActiveId(id);
  }
  const collapsible = items.length > COLLAPSED_COUNT;

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    // Ekranın yuxarı üçdə birinə çatan son başlıq «aktiv» sayılır
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav
      aria-label={t.title}
      data-testid="article-toc"
      className="nm-toc relative mb-12 border border-line bg-cream-deep/60 px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9"
    >
      {/* İç nazik qızılı çərçivə */}
      <span aria-hidden className="pointer-events-none absolute inset-[5px] border border-gold/35" />

      {/* Başlıq: ornament + aralıqlı yazı + qızılı xətlər */}
      <div className="relative flex flex-col items-center text-center">
        <RoseMark className="h-7 w-7 text-gold" strokeWidth={1.1} />
        <div className="mt-3 flex w-full items-center gap-4">
          <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/60 rtl:bg-gradient-to-l" />
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.32em] text-bordo">{t.title}</p>
          <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/60 rtl:bg-gradient-to-r" />
        </div>
        <p className="mt-2 font-display text-[13px] italic text-muted">{t.sections(sectionCount)}</p>
      </div>

      <ol
        className={`relative mt-6 sm:mt-7 ${
          collapsible && !expanded ? "nm-toc-collapsed max-h-[19rem] overflow-hidden sm:max-h-none sm:overflow-visible" : ""
        }`}
      >
        {numbered.map((item) => {
          const active = item.id === activeId;
          if (item.level === 3) {
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => goTo(e, item.id)}
                  className={`group flex items-baseline gap-3 py-1.5 ps-[3.25rem] font-ui text-[13px] leading-snug transition-colors sm:ps-16 ${
                    active ? "text-bordo" : "text-muted hover:text-bordo"
                  }`}
                >
                  <span aria-hidden className={`h-px w-3 shrink-0 translate-y-[-0.3em] transition-colors ${active ? "bg-bordo" : "bg-gold/70"}`} />
                  <span>{item.text}</span>
                </a>
              </li>
            );
          }
          return (
            <li key={item.id} className="border-t border-line/80 first:border-t-0">
              <a
                href={`#${item.id}`}
                onClick={(e) => goTo(e, item.id)}
                aria-current={active ? "location" : undefined}
                className="group relative flex items-baseline gap-4 py-3 sm:gap-6 sm:py-3.5"
              >
                {/* Aktiv bölmə üçün bordo zolaq */}
                <span
                  aria-hidden
                  className={`absolute -start-5 top-1/2 h-7 w-[2px] -translate-y-1/2 bg-bordo transition-opacity duration-300 sm:-start-9 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`w-9 shrink-0 font-display text-[22px] italic leading-none tabular-nums transition-colors sm:w-10 sm:text-[26px] ${
                    active ? "text-bordo" : "text-gold group-hover:text-bordo"
                  }`}
                >
                  {String(item.num).padStart(2, "0")}
                </span>
                <span
                  className={`flex-1 font-display text-[17px] leading-snug transition-colors sm:text-[19px] ${
                    active ? "text-bordo" : "text-ink group-hover:text-bordo"
                  }`}
                >
                  {item.text}
                </span>
                <span
                  aria-hidden
                  className="hidden shrink-0 translate-x-0 font-ui text-[13px] text-bordo opacity-0 transition-all duration-300 group-hover:opacity-100 sm:inline rtl:-scale-x-100"
                >
                  →
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      {collapsible && (
        <div className="relative mt-4 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="font-ui text-[11px] uppercase tracking-[0.2em] text-bordo underline decoration-gold/60 underline-offset-[6px]"
          >
            {expanded ? t.less : t.more}
          </button>
        </div>
      )}
    </nav>
  );
}
