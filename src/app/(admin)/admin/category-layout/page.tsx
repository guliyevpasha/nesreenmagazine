"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { MOSAIC_CATEGORIES } from "@/components/category/CategoryMosaic";
import { categories, subcategoryName, type CategorySlug } from "@/lib/categories";
import {
  fetchCategoryLayout,
  revalidateCategoryPages,
  saveCategoryLayout,
} from "@/lib/data/admin-category-layout";
import { CATEGORY_LAYOUT_MAX } from "@/lib/data/category-layout";
import { canEditCategory, useAuth } from "@/lib/firebase/auth";
import { pick, type Article } from "@/lib/types";

/**
 * Bölmə düzülüşü — hər bölmənin səhifəsində ilk yerlərə hansı məqalələrin
 * düşəcəyini admin/redaktor seçir. Qalan yerləri ən yeni məqalələr tutur.
 */

type LayoutKind = "mosaic" | "lookbook" | "cover";

function layoutKind(category: CategorySlug): LayoutKind {
  if (MOSAIC_CATEGORIES.has(category)) return "mosaic";
  if (category === "moda") return "lookbook";
  return "cover";
}

const LAYOUT_INFO: Record<LayoutKind, string> = {
  mosaic: "Mozaika: 2 böyük şəkilli kart, altında 4 sütunlu kiçik kartlar (hər 10 məqalədə təkrarlanır).",
  lookbook: "Jurnal üz qabığı + altında nömrələnmiş «Lookbook» kartları.",
  cover: "Bölmənin üz qabığı + altında 3 sütunlu kartlar.",
};

/** Mövqeyə görə yerin adı (1-dən başlayır). */
function slotLabel(kind: LayoutKind, position: number): string {
  if (kind === "mosaic") {
    const inBlock = ((position - 1) % 10) + 1;
    return inBlock <= 2 ? `Böyük kart ${inBlock}` : `Kiçik kart ${inBlock - 2}`;
  }
  if (position === 1) return "Üz qabığı";
  return kind === "lookbook" ? `Lookbook ${position - 1}` : `Kart ${position - 1}`;
}

function Thumb({ article, className = "" }: { article: Article; className?: string }) {
  return article.coverImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={article.coverImage} alt="" className={`object-cover ${className}`} loading="lazy" />
  ) : (
    <span className={`block bg-cream-deep ${className}`} aria-hidden="true" />
  );
}

function shortDate(iso?: string) {
  return iso ? iso.slice(0, 10) : "";
}

export default function CategoryLayoutPage() {
  const { session } = useAuth();
  const canWrite = session?.role === "admin" || session?.role === "editor";
  const allowed = useMemo(
    () => categories.filter((c) => canEditCategory(session, c.slug)),
    [session],
  );

  const [category, setCategory] = useState<CategorySlug>("gundem");
  const [articles, setArticles] = useState<Article[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [savedPinned, setSavedPinned] = useState<string[]>([]);
  const [meta, setMeta] = useState({ updatedAt: "", updatedByName: "" });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redaktor bəzi bölmələrə məhdud ola bilər — icazəsiz bölmə seçilibsə birincisi götürülür
  const activeCategory: CategorySlug = allowed.some((c) => c.slug === category)
    ? category
    : (allowed[0]?.slug ?? category);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchCategoryLayout(activeCategory)
      .then((state) => {
        if (cancelled) return;
        setArticles(state.articles);
        setPinned(state.pinnedIds);
        setSavedPinned(state.pinnedIds);
        setMeta({ updatedAt: state.updatedAt, updatedByName: state.updatedByName });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Məlumatlar yüklənmədi.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, session]);

  function selectCategory(slug: CategorySlug) {
    if (slug === activeCategory) return;
    if (pinned.join("|") !== savedPinned.join("|") && !confirm("Saxlanmamış dəyişikliklər itəcək. Davam edilsin?")) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setQuery("");
    setCategory(slug);
  }

  const byId = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);
  const pinnedArticles = pinned.map((id) => byId.get(id)).filter((a): a is Article => Boolean(a));
  const pinnedSet = new Set(pinned);
  // Saytda görünəcək sıra: sabitlənənlər + qalanları tarixə görə
  const effective = [...pinnedArticles, ...articles.filter((a) => !pinnedSet.has(a.id))];
  const hasChanges = pinned.join("|") !== savedPinned.join("|");
  const kind = layoutKind(activeCategory);
  const full = pinned.length >= CATEGORY_LAYOUT_MAX;

  const q = query.trim().toLowerCase();
  const available = articles.filter(
    (a) =>
      !pinnedSet.has(a.id) &&
      (!q || pick(a.title, "az").toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
  );

  function move(index: number, delta: number) {
    const next = [...pinned];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPinned(next);
  }

  async function handleSave() {
    if (!session || !canWrite) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await saveCategoryLayout({
        category: activeCategory,
        articleIds: pinned,
        updatedBy: session.email,
        updatedByName: session.name,
      });
      const revalidated = await revalidateCategoryPages(activeCategory);
      setSavedPinned(pinned);
      setMeta({ updatedAt: new Date().toISOString(), updatedByName: session.name });
      setSuccess(
        revalidated
          ? "Saxlanıldı. Saytda dərhal yeniləndi."
          : "Saxlanıldı. Saytda ən geci 1 dəqiqəyə yenilənəcək.",
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Saxlamaq alınmadı.");
    } finally {
      setSaving(false);
    }
  }

  const categoryInfo = categories.find((c) => c.slug === activeCategory);

  return (
    <>
      <PageHeader
        title="Bölmə düzülüşü"
        description="Bölmə səhifəsində ilk yerlərə (böyük kartlar, üz qabığı) hansı məqalələrin düşəcəyini seçin. Boş qalan yerləri ən yeni məqalələr avtomatik tutur."
        actions={
          categoryInfo && (
            <Link
              href={`/az/${activeCategory}`}
              target="_blank"
              className="font-ui text-[12px] uppercase tracking-[0.16em] text-bordo hover:underline"
            >
              Saytda bax ↗
            </Link>
          )
        }
      />

      <div className="space-y-6 px-6 py-8 lg:px-10">
        {/* Bölmə seçimi */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Bölmə">
          {allowed.map((c) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              aria-selected={c.slug === activeCategory}
              onClick={() => selectCategory(c.slug)}
              className={`border px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] transition-colors ${
                c.slug === activeCategory ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
              }`}
            >
              {c.name.az}
            </button>
          ))}
        </div>

        <p className="font-ui text-[13px] text-muted">
          <strong className="text-ink">Düzülüş:</strong> {LAYOUT_INFO[kind]} Seçilmiş sıra bölmənin alt bölmə
          səhifələrində də qorunur.
        </p>

        {!canWrite && (
          <Alert tone="info">Siz baxa bilərsiniz; dəyişiklik etmək üçün admin və ya redaktor rolu lazımdır.</Alert>
        )}
        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        {loading ? (
          <p className="font-ui text-sm text-muted">Yüklənir…</p>
        ) : (
          <div className="grid gap-6 xl:grid-cols-12">
            {/* ---------- Sabitlənmiş yerlər ---------- */}
            <div className="space-y-6 xl:col-span-7">
              <Panel
                title={`Sabitlənmiş yerlər (${pinned.length}/${CATEGORY_LAYOUT_MAX})`}
                description="Sıra saytdakı yerlərə uyğundur. Oxlarla yerini dəyişin."
                actions={
                  <div className="flex gap-2">
                    {pinned.length > 0 && (
                      <Button variant="ghost" onClick={() => setPinned([])} disabled={!canWrite || saving}>
                        Hamısını avtomatik et
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={!canWrite || saving || !hasChanges}>
                      {saving ? "Saxlanılır…" : "Saxla"}
                    </Button>
                  </div>
                }
              >
                {pinnedArticles.length === 0 ? (
                  <p className="py-6 text-center font-ui text-[13px] text-muted">
                    Heç bir məqalə sabitlənməyib — bütün yerlər ən yeni məqalələrlə avtomatik dolur.
                  </p>
                ) : (
                  <ol className="divide-y divide-line border-y border-line">
                    {pinnedArticles.map((article, index) => (
                      <li key={article.id} className="flex items-center gap-4 py-3">
                        <span className="w-28 shrink-0 font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-bordo">
                          {index + 1}. {slotLabel(kind, index + 1)}
                        </span>
                        <Thumb article={article} className="h-12 w-16 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-[1.02rem] text-ink">{pick(article.title, "az")}</p>
                          <p className="font-ui text-[11px] text-muted">
                            {article.subcategory ? subcategoryName(activeCategory, article.subcategory, "az") : "—"} ·{" "}
                            {shortDate(article.publishedAt)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => move(index, -1)}
                            disabled={!canWrite || index === 0}
                            className="h-8 w-8 border border-line font-ui text-sm hover:border-ink disabled:opacity-30"
                            aria-label="Yuxarı"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => move(index, 1)}
                            disabled={!canWrite || index === pinnedArticles.length - 1}
                            className="h-8 w-8 border border-line font-ui text-sm hover:border-ink disabled:opacity-30"
                            aria-label="Aşağı"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => setPinned(pinned.filter((id) => id !== article.id))}
                            disabled={!canWrite}
                            className="h-8 w-8 border border-line font-ui text-sm text-bordo hover:border-bordo disabled:opacity-30"
                            aria-label="Sabitləmədən çıxar"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {meta.updatedAt && (
                  <p className="mt-4 font-ui text-[11px] text-muted">
                    Son dəyişiklik: {meta.updatedAt.slice(0, 16).replace("T", " ")}
                    {meta.updatedByName ? ` · ${meta.updatedByName}` : ""}
                  </p>
                )}
              </Panel>

              {/* ---------- Önizləmə ---------- */}
              <Panel title="Saytda görünəcək düzülüş" description="İlk 10 yer. Qızılı haşiyə — sabitlənmiş, boz — avtomatik (ən yeni).">
                {effective.length === 0 ? (
                  <p className="py-6 text-center font-ui text-[13px] text-muted">Bu bölmədə dərc olunmuş məqalə yoxdur.</p>
                ) : (
                  <div
                    className={`grid gap-3 ${kind === "mosaic" ? "grid-cols-4" : "grid-cols-3"}`}
                  >
                    {effective.slice(0, 10).map((article, index) => {
                      const big = kind === "mosaic" ? index < 2 : index === 0;
                      const isPinned = pinnedSet.has(article.id);
                      return (
                        <div
                          key={article.id}
                          className={`relative overflow-hidden border-2 ${isPinned ? "border-gold" : "border-line"} ${
                            big ? (kind === "mosaic" ? "col-span-2" : "col-span-3") : ""
                          }`}
                        >
                          <Thumb article={article} className={`w-full ${big ? "aspect-[16/7]" : "aspect-[4/3]"}`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 p-2">
                            <p className="font-ui text-[9px] uppercase tracking-[0.12em] text-gold-soft">
                              {slotLabel(kind, index + 1)}
                            </p>
                            <p className={`line-clamp-2 font-display leading-tight text-white ${big ? "text-[0.95rem]" : "text-[0.75rem]"}`}>
                              {pick(article.title, "az")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>

            {/* ---------- Bölmənin məqalələri ---------- */}
            <div className="xl:col-span-5">
              <Panel title={`Bölmənin məqalələri (${articles.length})`} description="Əlavə etdiyiniz məqalə növbəti boş yerə düşür.">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlıq və ya ID ilə axtar…"
                  className={inputClass}
                />
                {full && (
                  <p className="mt-3 font-ui text-[12px] text-bordo">
                    Maksimum {CATEGORY_LAYOUT_MAX} yer sabitlənə bilər — əvvəlcə birini çıxarın.
                  </p>
                )}
                <ul className="mt-4 max-h-[640px] divide-y divide-line overflow-y-auto border-y border-line">
                  {available.length === 0 ? (
                    <li className="py-6 text-center font-ui text-[13px] text-muted">Məqalə tapılmadı.</li>
                  ) : (
                    available.map((article) => (
                      <li key={article.id} className="flex items-center gap-3 py-3">
                        <Thumb article={article} className="h-11 w-14 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-display text-[0.98rem] leading-snug text-ink">
                            {pick(article.title, "az")}
                          </p>
                          <p className="font-ui text-[11px] text-muted">
                            {article.subcategory ? subcategoryName(activeCategory, article.subcategory, "az") : "—"} ·{" "}
                            {shortDate(article.publishedAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPinned([...pinned, article.id])}
                          disabled={!canWrite || full}
                          className="shrink-0 border border-bordo px-3 py-1.5 font-ui text-[10px] uppercase tracking-[0.14em] text-bordo transition-colors hover:bg-bordo hover:text-cream disabled:opacity-30"
                        >
                          + {slotLabel(kind, pinned.length + 1)}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
