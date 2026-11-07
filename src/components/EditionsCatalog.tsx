"use client";

/**
 * «Nəşrlər» kataloqu — satışdakı nömrələr, kateqoriya və il filtri ilə.
 * Məlumat serverdə hazırlanır (dil seçilmiş mətnlər), burada yalnız filtr işləyir.
 */
import { useMemo, useState } from "react";

import IssueOrderButton from "@/components/IssueOrderButton";
import { RoseMark } from "@/components/Logo";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";

export type CatalogIssue = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  coverImage: string;
  price: number;
  category: string;
  categoryName: string;
  year: string;
  dateLabel: string;
  pagesLabel: string;
  inStock: boolean;
};

export default function EditionsCatalog({ locale, issues }: { locale: Locale; issues: CatalogIssue[] }) {
  const t = getDictionary(locale).editions;
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const issue of issues) if (issue.category) seen.set(issue.category, issue.categoryName);
    return [...seen.entries()];
  }, [issues]);

  const years = useMemo(
    () => [...new Set(issues.map((issue) => issue.year))].sort((a, b) => b.localeCompare(a)),
    [issues],
  );

  const visible = issues.filter(
    (issue) => (!category || issue.category === category) && (!year || issue.year === year),
  );

  const chip = (active: boolean) =>
    `border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
      active ? "border-bordo bg-bordo text-cream" : "border-line text-ink hover:border-bordo"
    }`;

  return (
    <>
      {(categoryOptions.length > 1 || years.length > 1) && (
        <div className="mb-10 flex flex-col gap-4 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(category === "")} onClick={() => setCategory("")}>
              {t.all}
            </button>
            {categoryOptions.map(([slug, name]) => (
              <button key={slug} type="button" className={chip(category === slug)} onClick={() => setCategory(slug)}>
                {name}
              </button>
            ))}
          </div>
          {years.length > 1 && (
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              aria-label={t.allYears}
              className="border border-line bg-paper px-4 py-2 font-ui text-[12px] text-ink focus:border-bordo focus:outline-none"
            >
              <option value="">{t.allYears}</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <p className="mb-6 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
        {interpolate(t.count, { n: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">{t.empty}</p>
      ) : (
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visible.map((issue) => (
            <article key={issue.id} className="flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden border border-line bg-cream-deep">
                {issue.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={issue.coverImage} alt={issue.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <RoseMark className="h-16 w-16 text-bordo/25" strokeWidth={1} />
                  </div>
                )}
                <span className="absolute end-3 top-3 bg-cream/95 px-3 py-1.5 font-display text-lg text-bordo shadow-sm">
                  {issue.price} ₼
                </span>
              </div>

              <p className="mt-5 font-ui text-[11px] uppercase tracking-[0.2em] text-muted">
                {[issue.categoryName, issue.dateLabel, issue.pagesLabel].filter(Boolean).join(" · ")}
              </p>
              <h2 className="mt-2 font-display text-2xl leading-snug text-ink">{issue.title}</h2>
              {issue.description && (
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{issue.description}</p>
              )}

              {issue.highlights.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="eyebrow text-muted">{t.inThisIssue}</p>
                  <ul className="mt-2 space-y-1.5">
                    {issue.highlights.map((line) => (
                      <li key={line} className="flex gap-2 text-[0.9rem] leading-snug text-ink-soft">
                        <span className="mt-[0.45em] h-1 w-1 shrink-0 bg-gold" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6">
                {issue.inStock ? (
                  <IssueOrderButton locale={locale} issueId={issue.id} issueTitle={issue.title} price={issue.price} />
                ) : (
                  <span className="inline-block border border-line px-5 py-3 font-ui text-[11px] uppercase tracking-[0.16em] text-muted">
                    {t.outOfStock}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
