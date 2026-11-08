"use client";

/** Redaktor lentinin kiçik UI hissələri: düymə, açılan menyu, rəng seçici, ikonlar. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { HIGHLIGHTS, PALETTE } from "./commands";

const ICONS: Record<string, string> = {
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  redo: "m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13",
  cut: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12",
  copy: "M8 8h12v12H8zM4 16V4h12",
  paste: "M9 4h6v3H9zM8 5H5v16h14V5h-3",
  alignLeft: "M3 6h18M3 10h12M3 14h18M3 18h12",
  alignCenter: "M3 6h18M6 10h12M3 14h18M6 18h12",
  alignRight: "M3 6h18M9 10h12M3 14h18M9 18h12",
  justify: "M3 6h18M3 10h18M3 14h18M3 18h18",
  bullets: "M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01",
  numbers: "M10 6h11M10 12h11M10 18h11M4 4v4M3 8h2M3 14h2l-2 3h2",
  multilevel: "M8 5h13M12 12h9M16 19h5M3 5h.01M7 12h.01M11 19h.01",
  indent: "M3 4h18M11 9h10M11 14h10M3 19h18M3 9l4 2.5L3 14",
  outdent: "M3 4h18M11 9h10M11 14h10M3 19h18M7 9l-4 2.5L7 14",
  lineSpacing: "M11 6h10M11 12h10M11 18h10M5 4v16M2.5 6.5 5 4l2.5 2.5M2.5 17.5 5 20l2.5-2.5",
  paraSpacing: "M4 4h16M4 20h16M8 9h8M8 15h8M12 6v2M12 16v2",
  borders: "M4 4h16v16H4zM4 12h16M12 4v16",
  shading: "m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0L19 11ZM5 2l5 5M2 13h15M22 20a2 2 0 0 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  unlink: "M18.8 13.2 21 11a5 5 0 0 0-7-7l-2.2 2.2M5.2 10.8 3 13a5 5 0 0 0 7 7l2.2-2.2M8 2v3M2 8h3M16 22v-3M22 16h-3",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01",
  table: "M3 4h18v16H3zM3 10h18M3 15h18M9 4v16M15 4v16",
  hr: "M3 12h18M7 7h10M7 17h10",
  video: "M3 6h13v12H3zM16 10l5-3v10l-5-3",
  omega: "M5 20h4v-2.5A6.5 6.5 0 1 1 15 17.5V20h4",
  clear: "M4 7V4h16v3M9 20h6M12 4v16M3 3l18 18",
  quote: "M7 7H4v6h3l-1.5 4M17 7h-3v6h3l-1.5 4",
  code: "m8 7-5 5 5 5M16 7l5 5-5 5",
  pilcrow: "M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13",
  sort: "M3 16l4 4 4-4M7 20V4M14 4h6l-6 7h6M14 20l3-7 3 7M15 18h4",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14",
  growFont: "M3 20 9 4l6 16M5 14h8M17 8l2.5-3L22 8",
  shrinkFont: "M3 20 9 4l6 16M5 14h8M17 5l2.5 3L22 5",
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function Btn({
  title,
  onClick,
  active,
  disabled,
  children,
  wide,
  testId,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  wide?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      data-testid={testId}
      disabled={disabled}
      // Seçim itməsin deyə mousedown-da fokus redaktorda qalır.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-[3px] border text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        wide ? "px-2" : "w-8"
      } ${active ? "border-bordo/40 bg-bordo/10 text-bordo" : "border-transparent text-ink-soft hover:border-line hover:bg-cream-deep/60"}`}
    >
      {children}
    </button>
  );
}

/** Açılan menyu: ekran kənarına çıxmasın deyə `fixed` mövqe hesablanır. */
export function Dropdown({
  title,
  label,
  children,
  active,
  testId,
  width = 240,
  open: controlledOpen,
  onOpenChange,
}: {
  title: string;
  label: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  active?: boolean;
  testId?: string;
  width?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [innerOpen, setInnerOpen] = useState(false);
  const open = controlledOpen ?? innerOpen;
  const setOpen = (v: boolean) => {
    setInnerOpen(v);
    onOpenChange?.(v);
  };
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, maxH: 400 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const w = Math.min(width, vw - 16);
    const left = Math.max(8, Math.min(r.left, vw - w - 8));
    const top = r.bottom + 4;
    setPos({ top, left, maxH: Math.max(160, window.innerHeight - top - 12) });
  }, [open, width]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => setOpen(false);
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title={title}
        aria-label={title}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={testId}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-[3px] border px-1.5 text-[13px] ${
          active || open ? "border-bordo/40 bg-bordo/10 text-bordo" : "border-transparent text-ink-soft hover:border-line hover:bg-cream-deep/60"
        }`}
      >
        {label}
        <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          data-testid={testId ? `${testId}-menu` : undefined}
          onMouseDown={(e) => {
            // input/select-lərdə fokus işləsin, qalanında seçim qorunsun
            const tag = (e.target as HTMLElement).tagName;
            if (!["INPUT", "SELECT", "TEXTAREA", "LABEL"].includes(tag)) e.preventDefault();
          }}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.min(width, typeof window !== "undefined" ? window.innerWidth - 16 : width), maxHeight: pos.maxH }}
          className="z-[200] overflow-y-auto rounded-md border border-line bg-white p-1.5 shadow-xl"
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </>
  );
}

export function MenuItem({
  onClick,
  active,
  children,
  testId,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      data-testid={testId}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-[13px] ${
        active ? "bg-bordo/10 text-bordo" : "text-ink hover:bg-cream-deep/70"
      }`}
    >
      {children}
    </button>
  );
}

export function ColorGrid({
  onPick,
  onReset,
  resetLabel = "Avtomatik",
  highlight,
  testId,
}: {
  onPick: (color: string) => void;
  onReset: () => void;
  resetLabel?: string;
  highlight?: boolean;
  testId?: string;
}) {
  const [hex, setHex] = useState("#");
  const valid = /^#[0-9a-f]{6}$/i.test(hex) || /^#[0-9a-f]{3}$/i.test(hex);
  const colors = highlight ? HIGHLIGHTS : PALETTE;
  return (
    <div className="p-1" data-testid={testId}>
      <button type="button" onClick={onReset} className="mb-2 w-full rounded border border-line px-2 py-1 text-left text-[12px] hover:bg-cream-deep/70">
        ⨯ {resetLabel}
      </button>
      <div className="grid grid-cols-6 gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={c}
            data-color={c}
            onClick={() => onPick(c)}
            className="h-6 w-full rounded-sm border border-black/15 hover:scale-110"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <form
        className="mt-2 flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onPick(hex);
        }}
      >
        <input
          type="color"
          aria-label="Rəng seçici"
          value={valid && hex.length === 7 ? hex : "#7b2233"}
          onChange={(e) => setHex(e.target.value)}
          className="h-7 w-8 cursor-pointer border border-line"
        />
        <input
          value={hex}
          onChange={(e) => setHex(e.target.value.trim())}
          placeholder="#RRGGBB"
          aria-label="HEX kodu"
          data-testid={testId ? `${testId}-hex` : undefined}
          className="h-7 min-w-0 flex-1 rounded border border-line px-2 font-mono text-[12px]"
        />
        <button type="submit" disabled={!valid} className="h-7 rounded bg-bordo px-2 text-[12px] text-white disabled:opacity-40">
          OK
        </button>
      </form>
    </div>
  );
}

export function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col border-e border-line/70 px-2 last:border-e-0">
      <div className="flex flex-wrap items-center gap-0.5 py-1">{children}</div>
      <div className="hidden pb-0.5 text-center font-ui text-[10px] uppercase tracking-[0.12em] text-muted md:block">{label}</div>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  testId,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label={title}
        data-testid={testId}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-white p-5 shadow-2xl sm:rounded-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Bağla" className="text-2xl leading-none text-muted hover:text-bordo">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fieldCls = "w-full rounded border border-line px-3 py-2 text-[14px] focus:border-bordo focus:outline-none";
export const labelCls = "mb-1 block font-ui text-[11px] uppercase tracking-[0.12em] text-muted";
export const primaryBtn = "rounded bg-bordo px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-white hover:opacity-90 disabled:opacity-40";
export const ghostBtn = "rounded border border-line px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink-soft hover:bg-cream-deep/60";
