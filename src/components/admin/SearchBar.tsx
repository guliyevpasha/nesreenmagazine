/**
 * Modern Search Bar - NewsPilot style
 * Global search with keyboard shortcuts
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder = "Məqalə, səhifə, etiket, media, şərh, işçi axtar...",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC to clear
      if (e.key === "Escape" && focused) {
        setQuery("");
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query);
    } else {
      // Default: search in articles
      router.push(`/admin/articles?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <div
        className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-2.5 transition-all ${
          focused
            ? "border-gold shadow-lg ring-4 ring-gold/20"
            : "border-slate-200 shadow-sm hover:border-slate-300"
        }`}
      >
        {/* Search icon */}
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition-colors ${focused ? "text-gold" : "text-slate-400"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 font-ui text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Keyboard shortcut hint */}
        {!focused && !query && (
          <div className="hidden items-center gap-1 rounded bg-slate-100 px-2 py-1 lg:flex">
            <kbd className="font-ui text-[11px] font-medium text-slate-500">⌘</kbd>
            <kbd className="font-ui text-[11px] font-medium text-slate-500">K</kbd>
          </div>
        )}
      </div>

      {/* Quick suggestions (when focused) */}
      {focused && !query && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 font-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            Tez Keçid
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-ui text-[13px] text-slate-700 transition-colors hover:bg-cream hover:text-bordo"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
              </svg>
              <span>Bütün Məqalələr</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/articles/new")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-ui text-[13px] text-slate-700 transition-colors hover:bg-cream hover:text-bordo"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Yeni Məqalə</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/media")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-ui text-[13px] text-slate-700 transition-colors hover:bg-cream hover:text-bordo"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
              </svg>
              <span>Media Kitabxanası</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
