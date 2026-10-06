"use client";

import type { ReactNode } from "react";

import { localeNames, locales, type Locale } from "@/lib/i18n/config";

/** Admin panelin təkrarlanan kiçik hissələri. */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-line bg-paper px-6 py-7 lg:px-10 lg:py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-paper ${className}`}>
      {(title || description) && (
        <header className="border-b border-line px-6 py-4">
          {title && <h2 className="font-display text-xl">{title}</h2>}
          {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
        </header>
      )}
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

export const inputClass =
  "w-full border border-line bg-paper px-3.5 py-2.5 font-ui text-[14px] text-ink transition-colors placeholder:text-muted/55 focus:border-bordo focus:outline-none";

export const labelClass = "eyebrow mb-2 block text-muted";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 font-ui text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: "border-bordo bg-bordo text-cream hover:bg-bordo-deep hover:border-bordo-deep",
    ghost: "border-line bg-transparent text-ink hover:border-bordo hover:text-bordo",
    danger: "border-bordo/40 bg-transparent text-bordo hover:bg-bordo hover:text-cream",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 border px-5 py-2.5 font-ui text-[11px] uppercase tracking-[0.16em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

/** Beş dil arasında keçid — məqalə və bürc redaktorlarında istifadə olunur. */
export function LocaleTabs({
  active,
  onChange,
  filled,
}: {
  active: Locale;
  onChange: (locale: Locale) => void;
  /** Hansı dillərin doldurulduğunu göstərir — boş dillərdə xəbərdarlıq nöqtəsi çıxır. */
  filled?: Record<Locale, boolean>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {locales.map((code) => {
        const selected = code === active;
        const isFilled = filled?.[code] ?? true;
        return (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(code)}
            className={`flex items-center gap-2 border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
              selected
                ? "border-ink bg-ink text-cream"
                : "border-line bg-transparent text-ink hover:border-bordo hover:text-bordo"
            }`}
          >
            {localeNames[code]}
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isFilled ? "bg-gold" : selected ? "bg-cream/40" : "bg-line"
              }`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="border border-dashed border-line px-8 py-16 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted">{text}</p>}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-gold bg-gold/10 text-ink-soft",
    error: "border-bordo bg-bordo/5 text-bordo",
    success: "border-gold bg-gold/15 text-ink",
  }[tone];

  return (
    <p className={`border-s-2 px-4 py-3 font-ui text-[13px] ${styles}`} role="status">
      {children}
    </p>
  );
}

export function StatusPill({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={`inline-block border px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] ${
        published ? "border-gold bg-gold/15 text-ink" : "border-line bg-cream-deep text-muted"
      }`}
    >
      {published ? "Dərc olunub" : "Qaralama"}
    </span>
  );
}
