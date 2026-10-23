"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Empty, PageHeader, StatusPill } from "@/components/admin/ui";
import { categories, getCategory, isCategorySlug } from "@/lib/categories";
import { listArticles, removeArticle, saveArticle } from "@/lib/data/admin";
import { isAdmin, useAuth } from "@/lib/firebase/auth";
import { formatDate, locales, localeShort, type Locale } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

/* ── CSV ixrac köməkçisi ─────────────────────────────────────────────────── */
function exportCsv(articles: Article[]) {
  const header = "ID,Başlıq (AZ),Bölmə,Status,Tarix,Slug";
  const rows = articles.map((a) => {
    const title = typeof a.title === 'string' ? a.title : (a.title?.az || a.title?.en || a.slug);
    return [
      a.id,
      title,
      a.category,
      a.status,
      a.publishedAt.slice(0, 10),
      a.slug,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meqaleler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Status pill — scheduled dəstəyi ilə ────────────────────────────────── */
function ArticleStatusPill({ status }: { status: string }) {
  if (status === "scheduled") {
    return (
      <span className="inline-block border border-blue-300 bg-blue-50 px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] text-blue-700">
        Planlaşdırılıb
      </span>
    );
  }
  return <StatusPill status={status} />;
}

export default function ArticlesListPage() {
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const categoryParam = searchParams.get("category");
  const category = categoryParam && isCategorySlug(categoryParam) ? categoryParam : null;

  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [term, setTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "scheduled">("all");

  /* Bulk state */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  async function load() {
    try {
      const list = await listArticles();
      setArticles(list);
      setSelected(new Set()); // seçimi sıfırla
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Məqalələr oxunmadı.");
    }
  }

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    if (!articles) return [];
    const needle = term.trim().toLowerCase();
    return articles.filter((article) => {
      if (category && article.category !== category) return false;
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (!needle) return true;
      const titleText = typeof article.title === 'string' ? article.title : '';
      return (
        article.slug.includes(needle) ||
        titleText.toLowerCase().includes(needle) ||
        (typeof article.title !== 'string' && locales.some((code) => article.title[code]?.toLowerCase().includes(needle)))
      );
    });
  }, [articles, category, statusFilter, term]);

  const title = category ? getCategory(category)?.name.az ?? "Məqalələr" : "Bütün məqalələr";

  /* ── Seçim əməliyyatları ── */
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((a) => a.id)));
    }
  }

  /* ── Kütləvi dərc ── */
  async function handleBulkPublish() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} məqaləni dərc etmək istəyirsiniz?`)) return;
    setBulkLoading(true);
    setError(""); setSuccess("");
    try {
      const toPublish = (articles ?? []).filter((a) => selected.has(a.id));
      await Promise.all(
        toPublish.map((a) => saveArticle(a.id, { ...a, status: "published" })),
      );
      setSuccess(`${selected.size} məqalə dərc edildi.`);
      await load();
    } catch {
      setError("Kütləvi dərc xətası baş verdi.");
    } finally {
      setBulkLoading(false);
    }
  }

  /* ── Kütləvi qaralama ── */
  async function handleBulkDraft() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} məqaləni qaralamaya almaq istəyirsiniz?`)) return;
    setBulkLoading(true);
    setError(""); setSuccess("");
    try {
      const toDraft = (articles ?? []).filter((a) => selected.has(a.id));
      await Promise.all(
        toDraft.map((a) => saveArticle(a.id, { ...a, status: "draft" })),
      );
      setSuccess(`${selected.size} məqalə qaralamaya alındı.`);
      await load();
    } catch {
      setError("Kütləvi qaralama xətası baş verdi.");
    } finally {
      setBulkLoading(false);
    }
  }

  /* ── Kütləvi sil ── */
  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} məqaləni həmişəlik silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.`)) return;
    setBulkLoading(true);
    setError(""); setSuccess("");
    try {
      await Promise.all([...selected].map((id) => removeArticle(id)));
      setSuccess(`${selected.size} məqalə silindi.`);
      await load();
    } catch {
      setError("Kütləvi silmə xətası baş verdi.");
    } finally {
      setBulkLoading(false);
    }
  }

  const canManage = isAdmin(session);

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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => exportCsv(visible)}
              disabled={visible.length === 0}
            >
              ↓ CSV
            </Button>
            <Link href="/admin/articles/new" className="btn-primary !py-2.5 !text-[11px]">
              Yeni məqalə
            </Link>
          </div>
        }
      />

      <div className="px-6 py-8 lg:px-10">
        {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
        {success && <div className="mb-4"><Alert tone="success">{success}</Alert></div>}

        {/* Filtrlər */}
        <div className="mb-6 space-y-4">
          {/* Status filter tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
            <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted mr-2">
              Status:
            </span>
            {(
              [
                { key: "all", label: "Hamısı" },
                { key: "published", label: "Dərc olunub" },
                { key: "draft", label: "Qaralama" },
                { key: "scheduled", label: "Planlaşdırılıb" },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                onClick={() => setStatusFilter(option.key)}
                className={`border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-all duration-200 ${
                  statusFilter === option.key
                    ? "border-gold bg-gold text-bordo-deep shadow-sm"
                    : "border-line text-ink hover:border-gold hover:text-bordo"
                }`}
              >
                {option.label}
              </button>
            ))}
            <span className="ml-auto font-ui text-[12px] text-muted">
              {articles ? `${visible.length} məqalə` : "yüklənir…"}
            </span>
          </div>

          {/* Search input */}
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Başlıq və ya ünvana görə axtar…"
            className="w-full max-w-md border border-line bg-paper px-3.5 py-2.5 font-ui text-[14px] text-ink placeholder:text-muted/55 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
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

        {/* Kütləvi əməliyyatlar paneli */}
        {selected.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 border border-gold/30 bg-gold/10 px-4 py-3">
            <span className="font-ui text-[13px] text-ink font-medium">
              {selected.size} məqalə seçilib
            </span>
            <Button
              variant="ghost"
              onClick={() => void handleBulkPublish()}
              disabled={bulkLoading}
              className="py-1.5"
            >
              Dərc et
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleBulkDraft()}
              disabled={bulkLoading}
              className="py-1.5"
            >
              Qaralamaya al
            </Button>
            <Button
              variant="ghost"
              onClick={() => exportCsv((articles ?? []).filter((a) => selected.has(a.id)))}
              disabled={bulkLoading}
              className="py-1.5"
            >
              CSV ixrac
            </Button>
            {canManage && (
              <Button
                variant="danger"
                onClick={() => void handleBulkDelete()}
                disabled={bulkLoading}
                className="py-1.5"
              >
                {bulkLoading ? "Silinir…" : "Sil"}
              </Button>
            )}
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto font-ui text-[11px] text-muted hover:text-ink transition-colors"
            >
              Seçimi ləğv et
            </button>
          </div>
        )}

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
            <table className="w-full min-w-[800px] text-start">
              <thead>
                <tr className="border-b border-line bg-cream-deep/40">
                  {/* Seçim checkbox */}
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === visible.length && visible.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-bordo"
                      aria-label="Hamısını seç"
                    />
                  </th>
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
                  <tr
                    key={article.id}
                    className={`transition-colors hover:bg-cream-deep/30 ${
                      selected.has(article.id) ? "bg-gold/5" : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(article.id)}
                        onChange={() => toggleSelect(article.id)}
                        className="h-4 w-4 accent-bordo"
                        aria-label={`${typeof article.title === 'string' ? article.title : (article.title?.az || article.slug)} seç`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="font-display text-[1.0625rem] leading-snug text-ink hover:text-bordo"
                      >
                        {typeof article.title === 'string' ? article.title : (article.title?.az || article.title?.en || article.slug)}
                      </Link>
                      <p className="mt-1 font-mono text-[11px] text-muted">/{article.slug}</p>
                      {article.scheduledAt && (
                        <p className="mt-0.5 font-ui text-[10px] text-blue-600">
                          ⏰ {new Date(article.scheduledAt).toLocaleString("az-AZ")}
                        </p>
                      )}
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
                      <ArticleStatusPill status={article.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t border-line px-5 py-3 flex items-center justify-between">
              <p className="font-ui text-[12px] text-muted">
                {visible.length} məqalə göstərilir
                {selected.size > 0 && ` · ${selected.size} seçilib`}
              </p>
              <Button
                variant="ghost"
                onClick={() => exportCsv(visible)}
                className="py-1.5 text-[10px]"
              >
                ↓ CSV ixrac
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
