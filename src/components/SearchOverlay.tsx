"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";

export type SearchItem = {
  title: string;
  excerpt: string;
  section: string;
  href: string;
  tags: string[];
};

/** Axtarışda diakritik və hərf fərqlərini nəzərə almamaq üçün. */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[əe]/g, "e")
    .replace(/[ıi]/g, "i")
    .replace(/[öo]/g, "o")
    .replace(/[üu]/g, "u")
    .replace(/[ğg]/g, "g")
    .replace(/[şs]/g, "s")
    .replace(/[çc]/g, "c");
}

export default function SearchOverlay({
  open,
  onClose,
  locale,
  items,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  items: SearchItem[];
}) {
  const dict = getDictionary(locale);
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTerm("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const needle = normalize(term.trim());
    if (needle.length < 2) return [];
    return items
      .filter((item) => {
        const haystack = normalize(
          `${item.title} ${item.excerpt} ${item.section} ${item.tags.join(" ")}`,
        );
        return haystack.includes(needle);
      })
      .slice(0, 8);
  }, [items, term]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={dict.search.title}>
      <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />

      <div className="relative mx-auto mt-0 w-full max-w-3xl animate-fade-up bg-cream px-6 pb-10 pt-8 shadow-2xl sm:mt-20 sm:px-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-bordo">{dict.search.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="font-ui text-[11px] uppercase tracking-[0.16em] text-muted hover:text-bordo"
          >
            {dict.nav.close}
          </button>
        </div>

        <div className="mt-5 border-b-2 border-ink pb-3">
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={dict.search.placeholder}
            className="w-full bg-transparent font-display text-2xl text-ink placeholder:text-muted/60 focus:outline-none sm:text-3xl"
            aria-label={dict.search.title}
          />
        </div>

        <div className="mt-6 max-h-[55vh] overflow-y-auto">
          {term.trim().length < 2 ? (
            <p className="py-6 text-center font-ui text-xs uppercase tracking-[0.18em] text-muted">
              {dict.search.hint}
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center font-ui text-xs uppercase tracking-[0.18em] text-muted">
              {dict.search.noResults}
            </p>
          ) : (
            <>
              <p className="mb-4 font-ui text-[11px] uppercase tracking-[0.18em] text-muted">
                {interpolate(dict.search.resultsCount, { n: results.length })}
              </p>
              <ul className="divide-y divide-line">
                {results.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group block py-4 transition-colors hover:bg-cream-deep/50"
                    >
                      <span className="eyebrow text-bordo">{item.section}</span>
                      <span className="mt-1.5 block font-display text-xl leading-snug text-ink">
                        {item.title}
                      </span>
                      <span className="clamp-2 mt-1 block text-sm text-ink-soft">
                        {item.excerpt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
