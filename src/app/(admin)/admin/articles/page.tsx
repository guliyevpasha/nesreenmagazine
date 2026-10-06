"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Empty, PageHeader, StatusPill } from "@/components/admin/ui";
import { categories, getCategory, isCategorySlug } from "@/lib/categories";
import { listArticles } from "@/lib/data/admin";
import { formatDate, locales, localeShort, type Locale } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

export default function ArticlesListPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const category = categoryParam && isCategorySlug(categoryParam) ? categoryParam : null;

  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    let cancelled = false;
    listArticles()
      .then((list) => {
        if (!cancelled) setArticles(list);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Məqalələr oxunmadı.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (!articles) return [];
    const needle = term.trim().toLowerCase();
    return articles.filter((article) => {
      if (category && article.category !== category) return false;
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        article.slug.includes(needle) ||
        locales.some((code) => article.title[code]?.toLowerCase().includes(needle))
      );
    });
  }, [articles, category, statusFilter, term]);

  const title = category ? getCategory(category)?.name.az ?? "Məqalələr" : "Bütün məqalələr";

  return (
    <>
      <PageHeader
        title={title}
        description={
          category
            ? getCategory(category)?.tagline.az
            : "Bütün bölmələrdəki məqalələr. Redaktə etmək üçün başlığa toxunun."
        }
        actions={
          <Link href="/admin/articles/new" className="btn-primary !py-2.5 !text-[11px]">
            Yeni məqalə
          </Link>
        }
      />

      <div className="px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {/* Filtrlər */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Başlıq və ya ünvana görə axtar…"
            className="w-full max-w-xs border border-line bg-paper px-3.5 py-2.5 font-ui text-[14px] text-ink placeholder:text-muted/55 focus:border-bordo focus:outline-none"
          />

          <div className="flex gap-1.5">
            {(
              [
                { key: "all", label: "Hamısı" },
                { key: "published", label: "Dərc olunub" },
                { key: "draft", label: "Qaralama" },
              ] as const
            ).map((option) => (
              <Button
                key={option.key}
                variant={statusFilter === option.key ? "primary" : "ghost"}
                onClick={() => setStatusFilter(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <span className="ms-auto font-ui text-[12px] text-muted">
            {articles ? `${visible.length} məqalə` : "yüklənir…"}
          </span>
        </div>

        {/* Bölmə keçidləri */}
        <div className="mb-6 flex flex-wrap gap-1.5 border-b border-line pb-5">
          <Link
            href="/admin/articles"
            className={`border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
              !category
                ? "border-ink bg-ink text-cream"
                : "border-line text-ink hover:border-bordo hover:text-bordo"
            }`}
          >
            Hamısı
          </Link>
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/admin/articles?category=${item.slug}`}
              className={`border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
                category === item.slug
                  ? "border-ink bg-ink text-cream"
                  : "border-line text-ink hover:border-bordo hover:text-bordo"
              }`}
            >
              {item.name.az}
            </Link>
          ))}
        </div>

        {/* Siyahı */}
        {!articles ? (
          <p className="py-16 text-center font-ui text-[13px] text-muted">Yüklənir…</p>
        ) : visible.length === 0 ? (
          <Empty
            title="Məqalə tapılmadı"
            text="Bu bölmədə hələ yazı yoxdur. «Yeni məqalə» düyməsi ilə başlaya bilərsiniz."
          />
        ) : (
          <div className="overflow-x-auto border border-line bg-paper">
            <table className="w-full min-w-[760px] text-start">
              <thead>
                <tr className="border-b border-line bg-cream-deep/40">
                  {["Başlıq", "Bölmə", "Dillər", "Tarix", "Vəziyyət"].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-start font-ui text-[10.5px] uppercase tracking-[0.16em] text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((article) => (
                  <tr key={article.id} className="transition-colors hover:bg-cream-deep/30">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="font-display text-[1.0625rem] leading-snug text-ink hover:text-bordo"
                      >
                        {article.title.az || article.title.en || article.slug}
                      </Link>
                      <p className="mt-1 font-mono text-[11px] text-muted">/{article.slug}</p>
                    </td>
                    <td className="px-5 py-4 font-ui text-[13px] text-ink-soft">
                      {getCategory(article.category)?.name.az}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {locales.map((code: Locale) => {
                          const done = Boolean(
                            article.title[code]?.trim() && article.body[code]?.trim(),
                          );
                          return (
                            <span
                              key={code}
                              title={done ? "dolu" : "boş"}
                              className={`border px-1.5 py-0.5 font-ui text-[9.5px] tracking-wide ${
                                done
                                  ? "border-gold bg-gold/15 text-ink"
                                  : "border-line text-muted/60"
                              }`}
                            >
                              {localeShort[code]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-ui text-[13px] text-ink-soft">
                      {formatDate(article.publishedAt, "az")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={article.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
