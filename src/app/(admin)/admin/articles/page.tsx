"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Empty, PageHeader, StatusPill } from "@/components/admin/ui";
import { categories, getCategory, isCategorySlug } from "@/lib/categories";
import { listArticles, removeArticle, saveArticle } from "@/lib/data/admin";
import { canEditCategory, isAdmin, useAuth } from "@/lib/firebase/auth";
import { formatDate, locales, localeShort, type Locale } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";
import { getArticleTitle, getArticleSlug, isArticleComplete } from "@/lib/article-helpers";
import { getArticleViews, type ArticleViews } from "@/lib/analytics/track-views";

/* ── CSV ixrac köməkçisi ─────────────────────────────────────────────────── */
function exportCsv(articles: Article[]) {
  const header = "ID,Başlıq (AZ),Bölmə,Status,Tarix,Slug (AZ)";
  const rows = articles.map((a) => {
    const title = getArticleTitle(a, "az");
    return [
      a.id,
      title,
      a.category,
      a.status,
      a.publishedAt.slice(0, 10),
      getArticleSlug(a, "az"),
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
function ArticleStatusPill({ status, publishedAt }: { status: string; publishedAt?: string }) {
  // Gələcək tarixli «published» = planlaşdırılıb (vaxtı çatanda saytda avtomatik görünür)
  const future = Boolean(publishedAt) && Date.parse(publishedAt ?? "") > Date.now();
  if (status === "scheduled" || (status === "published" && future)) {
    return (
      <span className="inline-block border border-blue-300 bg-blue-50 px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] text-blue-700">
        Planlaşdırılıb
      </span>
    );
  }
  return <StatusPill status={status} />;
}

/* ── Actions Menu ─────────────────────────────────────────────────────────── */
function ArticleActionsMenu({
  article,
  onDelete,
}: {
  article: Article;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  
  // Seed məqalələri silinə bilməz
  const isSeedArticle = article.id.startsWith('seed-');
  const canDelete = isAdmin(session) && !isSeedArticle;

  async function handleDelete() {
    if (isSeedArticle) {
      alert("⚠️ Bu seed məqaləsidir və silinə bilməz!\n\nSeed məqalələr kod içində hard-coded olaraq saxlanılır.\n\nƏgər silmək istəyirsinizsə, src/lib/content/ qovluğundakı fayllardan silin.");
      return;
    }
    
    const articleTitle = getArticleTitle(article, "az");
    if (!confirm(`"${articleTitle}" məqaləsi silinsin?\n\nBu əməliyyat geri qaytarıla bilməz!`)) return;
    
    setBusy(true);
    setOpen(false); // Menu-nu bağla
    
    try {
      console.log("🗑️ Məqalə silinir:", article.id, articleTitle);
      
      // Məqaləni sil
      await removeArticle(article.id);
      
      console.log("✅ Məqalə uğurla silindi!");
      
      // Siyahını yenilə
      onDelete();
      
      // Təsdiq mesajı
      alert(`✅ "${articleTitle}" məqaləsi uğurla silindi!`);
      
    } catch (error) {
      console.error("❌ Silmə xətası:", error);
      
      let errorMessage = "Naməlum xəta";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as Error).message);
      }
      
      alert(`❌ Məqalə silinmədi!\n\nXəta: ${errorMessage}\n\nMəqalə ID: ${article.id}\n\nƏgər problem davam edərsə, Firebase Console-dan silməyi sınayın.`);
      
      setBusy(false);
      setOpen(true); // Menu-nu yenidən aç
    }
  }

  async function handleDuplicate() {
    setBusy(true);
    try {
      // Create a copy without id
      const copy = {
        ...article,
        slug: {
          az: `${getArticleSlug(article, "az")}-kopyası-${Date.now()}`,
          en: `${getArticleSlug(article, "en")}-copy-${Date.now()}`,
          ru: `${getArticleSlug(article, "ru")}-копия-${Date.now()}`,
          tr: `${getArticleSlug(article, "tr")}-kopyası-${Date.now()}`,
          ar: `${getArticleSlug(article, "ar")}-نسخة-${Date.now()}`,
        },
        status: "draft" as const,
        publishedAt: new Date().toISOString(),
      };
      delete (copy as any).id;
      
      const newId = await saveArticle("new", copy);
      router.push(`/admin/articles/${newId}`);
    } catch (error) {
      alert("Kopyalana bilmədi: " + (error instanceof Error ? error.message : "Xəta"));
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="rounded border border-line bg-white px-3 py-1.5 font-ui text-[11px] text-ink hover:border-bordo hover:bg-cream transition-colors disabled:opacity-50"
      >
        ⋯
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 border border-line bg-white shadow-lg">
            <Link
              href={`/admin/articles/${article.id}`}
              className="block px-4 py-2.5 font-ui text-[12px] text-ink hover:bg-cream-deep transition-colors"
              onClick={() => setOpen(false)}
            >
              ✏️ Redaktə et
            </Link>
            <button
              onClick={handleDuplicate}
              disabled={busy}
              className="w-full px-4 py-2.5 text-left font-ui text-[12px] text-ink hover:bg-cream-deep transition-colors disabled:opacity-50"
            >
              📋 Kopyala
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={busy}
                className="w-full px-4 py-2.5 text-left font-ui text-[12px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                🗑️ Sil
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  /* View statistics state */
  const [viewsMap, setViewsMap] = useState<Map<string, ArticleViews>>(new Map());
  const [loadingViews, setLoadingViews] = useState(false);

  /* Bulk state */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  async function load() {
    try {
      const list = await listArticles();
      setArticles(list);
      setSelected(new Set()); // seçimi sıfırla
      
      // Load view statistics for all articles
      await loadViewStats(list);
    } catch (caught) {
      console.error('❌ Error loading articles:', caught);
      setError(caught instanceof Error ? caught.message : "Məqalələr oxunmadı.");
    }
  }

  async function loadViewStats(articleList: Article[]) {
    setLoadingViews(true);
    try {
      console.log('📊 Loading view stats for', articleList.length, 'articles');
      const viewsData = await Promise.all(
        articleList.map(async (article) => {
          const views = await getArticleViews(article.id);
          console.log('📈 Views for', article.id, ':', views);
          return [article.id, views] as const;
        })
      );
      console.log('✅ View stats loaded:', viewsData.length, 'articles');
      setViewsMap(new Map(viewsData));
    } catch (error) {
      console.error('❌ Error loading view stats:', error);
    } finally {
      setLoadingViews(false);
    }
  }

  useEffect(() => { 
    void load(); 
  }, []);

  // Məqalələr yükləndikdən sonra baxış statistikasını yüklə
  useEffect(() => {
    if (articles && articles.length > 0) {
      void loadViewStats(articles);
    }
  }, [articles]);

  // Redaktor/müəllif yalnız öz bölmələrini görür (admin hamısını)
  const restrictToOwn = session?.role === "editor" || session?.role === "author";
  const allowedCategories = useMemo(
    () => (restrictToOwn ? categories.filter((item) => canEditCategory(session, item.slug)) : categories),
    [restrictToOwn, session],
  );

  const visible = useMemo(() => {
    if (!articles) return [];
    const needle = term.trim().toLowerCase();
    return articles.filter((article) => {
      if (restrictToOwn && !canEditCategory(session, article.category)) return false;
      if (category && article.category !== category) return false;
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (!needle) return true;
      
      // Slug-da axtarış (hər dildə)
      const slugMatch = locales.some((code) => {
        const slug = getArticleSlug(article, code);
        return slug.toLowerCase().includes(needle);
      });
      
      if (slugMatch) return true;
      
      // Check all locales for title
      return locales.some((code) => {
        const title = getArticleTitle(article, code);
        return title.toLowerCase().includes(needle);
      });
    });
  }, [articles, category, statusFilter, term, restrictToOwn, session]);

  // Pagination hesablamaları
  const totalPages = Math.ceil(visible.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = visible.slice(startIndex, endIndex);

  // Filtr və ya axtarış dəyişdikdə 1-ci səhifəyə qayıt
  useEffect(() => {
    setCurrentPage(1);
  }, [term, statusFilter, category]);

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
    if (selected.size === paginatedArticles.length) {
      // Səhifədəki seçimi ləğv et
      const pageIds = new Set(paginatedArticles.map((a) => a.id));
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Səhifədəkiləri seç
      setSelected((prev) => {
        const next = new Set(prev);
        paginatedArticles.forEach((a) => next.add(a.id));
        return next;
      });
    }
  }

  function reportBulk(results: PromiseSettledResult<unknown>[], action: string) {
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    const text = `${ok} uğurlu, ${failed} uğursuz`;
    if (failed > 0) {
      setError(`Kütləvi ${action}: ${text}.`);
      if (ok > 0) setSuccess(`Kütləvi ${action}: ${text}.`);
    } else {
      setSuccess(`Kütləvi ${action}: ${text}.`);
    }
  }

  /* ── Kütləvi dərc ── */
  async function handleBulkPublish() {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} məqaləni dərc etmək istəyirsiniz?`)) return;
    setBulkLoading(true);
    setError(""); setSuccess("");
    try {
      const toPublish = (articles ?? []).filter(
        (a) => selected.has(a.id) && canEditCategory(session, a.category),
      );
      const results = await Promise.allSettled(
        toPublish.map((a) => saveArticle(a.id, { ...a, status: "published" })),
      );
      reportBulk(results, "dərc");
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
      const toDraft = (articles ?? []).filter(
        (a) => selected.has(a.id) && canEditCategory(session, a.category),
      );
      const results = await Promise.allSettled(
        toDraft.map((a) => saveArticle(a.id, { ...a, status: "draft" })),
      );
      reportBulk(results, "qaralama");
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
          {allowedCategories.map((item) => (
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
          <>
            <div className="overflow-x-auto border border-line bg-paper">
              <table className="w-full min-w-[800px] text-start">
                <thead>
                  <tr className="border-b border-line bg-cream-deep/40">
                    {/* Seçim checkbox */}
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          paginatedArticles.length > 0 &&
                          paginatedArticles.every((a) => selected.has(a.id))
                        }
                        onChange={toggleAll}
                        className="h-4 w-4 accent-bordo"
                        aria-label="Səhifədəkiləri seç"
                      />
                    </th>
                    {["Başlıq", "Bölmə", "Dillər", "Tarix", "Baxış", "Vəziyyət", "Əməliyyatlar"].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 font-ui text-[10.5px] uppercase tracking-[0.16em] text-muted ${
                          heading === "Əməliyyatlar" ? "text-end" : "text-start"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {paginatedArticles.map((article) => {
                    const isSeed = article.id.startsWith('seed-');
                    return (
                    <tr
                      key={article.id}
                      className={`transition-colors hover:bg-cream-deep/30 ${
                        selected.has(article.id) ? "bg-gold/5" : ""
                      } ${isSeed ? "bg-blue-50/30" : ""}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(article.id)}
                          onChange={() => toggleSelect(article.id)}
                          className="h-4 w-4 accent-bordo"
                          aria-label={`${getArticleTitle(article, "az")} seç`}
                          disabled={isSeed}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="font-display text-[1.0625rem] leading-snug text-ink hover:text-bordo"
                          >
                            {getArticleTitle(article, "az")}
                          </Link>
                          {isSeed && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-ui text-[9px] uppercase tracking-wide text-blue-700">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                              SEED
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-muted">/{getArticleSlug(article, "az")}</p>
                        {article.scheduledAt && (
                          <p className="mt-0.5 font-ui text-[10px] text-blue-600">
                            ⏰ {new Date(article.scheduledAt).toLocaleString("az-AZ")}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-ui text-[13px] text-ink-soft">
                        {getCategory(article.category)?.name.az || article.category}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          {locales.map((code: Locale) => {
                            const done = isArticleComplete(article, code);
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
                        {loadingViews ? (
                          <span className="font-ui text-[11px] text-muted">...</span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[15px] text-ink font-medium">
                                {viewsMap.get(article.id)?.totalViews.toLocaleString('az-AZ') || '0'}
                              </span>
                              <span className="font-ui text-[10px] text-muted uppercase tracking-wide">
                                cəmi
                              </span>
                            </div>
                            {(viewsMap.get(article.id)?.last7Days || 0) > 0 && (
                              <div className="font-ui text-[10px] text-muted">
                                📈 {viewsMap.get(article.id)?.last7Days} son 7 gün
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <ArticleStatusPill status={article.status} publishedAt={article.publishedAt} />
                      </td>
                      <td className="px-5 py-4">
                        <ArticleActionsMenu article={article} onDelete={load} />
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>

              {/* Footer with pagination info */}
              <div className="border-t border-line px-5 py-3 flex items-center justify-between">
                <p className="font-ui text-[12px] text-muted">
                  {startIndex + 1}-{Math.min(endIndex, visible.length)} məqalə, cəmi {visible.length}
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

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border border-line px-4 py-2 font-ui text-[11px] text-ink hover:border-bordo hover:text-bordo disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Əvvəlki
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Göstəriləcək səhifə nömrələrini məhdudlaşdır
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2);

                  if (!showPage) {
                    // "..." göstər (yalnız bir dəfə)
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <span key={page} className="px-2 font-ui text-[11px] text-muted">
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] border px-3 py-2 font-ui text-[11px] transition-all ${
                        page === currentPage
                          ? "border-gold bg-gold text-bordo-deep shadow-sm"
                          : "border-line text-ink hover:border-bordo hover:text-bordo"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-line px-4 py-2 font-ui text-[11px] text-ink hover:border-bordo hover:text-bordo disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Növbəti →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
