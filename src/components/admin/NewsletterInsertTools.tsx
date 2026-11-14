"use client";

import { useMemo, useRef, useState } from "react";

import { getArticleSlug } from "@/lib/article-helpers";
import { listArticles } from "@/lib/data/admin";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { emailImageUrl, newsletterSiteUrl } from "@/lib/newsletter/markdown";
import { routes } from "@/lib/routes";
import type { Article } from "@/lib/types";

/** Markdown mətnində problem yaratmasın deyə [ ] ( ) simvollarını yumşaldır */
function mdSafe(text: string): string {
  return text.replace(/[\[\]]/g, "").replace(/\s+/g, " ").trim();
}

/** Seçilmiş məqalə üçün hazır blok: linkli şəkil, başlıq, qısa mətn, «Oxu →» */
export function articleBlock(article: Article, locale: Locale): string {
  const url = `${newsletterSiteUrl}${routes.article(locale, article.category, getArticleSlug(article, locale))}`;
  const title = mdSafe(article.title?.[locale] ?? "");
  const excerpt = mdSafe(article.excerpt?.[locale] ?? "");
  const readMore = getDictionary(locale).newsletter.readMore;
  return [
    article.coverImage ? `[![${title}](${emailImageUrl(article.coverImage)})](${url})` : "",
    `### [${title}](${url})`,
    excerpt,
    `[${readMore}](${url})`,
    "---",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Bülleten redaktorunun üstündəki alətlər:
 *  • «Şəkil yüklə» — kompüterdən şəkil seçilir, Cloudinary-yə yüklənir və mətnə əlavə olunur;
 *  • «Məqalə əlavə et» — saytdakı dərc olunmuş məqaləni seçdikdə hazır blok əlavə olunur.
 * Əlavə olunan hissə mətnin sonuna yazılır.
 */
export default function NewsletterInsertTools({
  locale,
  disabled,
  onInsert,
}: {
  locale: Locale;
  disabled?: boolean;
  onInsert: (markdown: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [search, setSearch] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { uploadMedia } = await import("@/lib/upload-client");
      const result = await uploadMedia(file, "newsletter");
      onInsert(`![](${emailImageUrl(result.url)})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şəkil yüklənmədi");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function openPicker() {
    setPickerOpen((open) => !open);
    if (articles) return;
    try {
      setArticles(await listArticles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Məqalələr yüklənmədi");
      setArticles([]);
    }
  }

  /** Seçilmiş dildə başlığı olan dərc olunmuş məqalələr, ən yenisi əvvəl */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (articles ?? [])
      .filter((a) => a.status === "published" && a.title?.[locale]?.trim())
      .filter((a) => !q || a.title[locale].toLowerCase().includes(q))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, 30);
  }, [articles, search, locale]);

  const buttonClass =
    "border border-line bg-paper px-3.5 py-2 font-ui text-[12px] text-ink transition-colors hover:border-bordo disabled:opacity-50";

  return (
    <div className="mb-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Yüklənir…" : "🖼  Şəkil yüklə"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className={`${buttonClass} ${pickerOpen ? "border-bordo" : ""}`}
          disabled={disabled}
          onClick={() => void openPicker()}
        >
          📰  Məqalə əlavə et
        </button>
      </div>

      {error && <p className="font-ui text-[12px] text-bordo">{error}</p>}

      {pickerOpen && (
        <div className="border border-line bg-paper p-3">
          <input
            className="w-full border border-line bg-paper px-3 py-2 font-ui text-[13px] focus:border-bordo focus:outline-none"
            placeholder="Məqalə başlığı ilə axtar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
          <div className="mt-2 max-h-80 overflow-auto">
            {articles === null && (
              <p className="py-6 text-center font-ui text-[12px] text-muted">Yüklənir…</p>
            )}
            {articles !== null && visible.length === 0 && (
              <p className="py-6 text-center font-ui text-[12px] text-muted">
                Bu dildə dərc olunmuş məqalə tapılmadı.
              </p>
            )}
            {visible.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onInsert(articleBlock(article, locale))}
                className="flex w-full items-center gap-3 border-b border-line px-1 py-2 text-start transition-colors last:border-b-0 hover:bg-cream-deep/50"
              >
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={emailImageUrl(article.coverImage)}
                    alt=""
                    className="h-12 w-16 shrink-0 object-cover"
                  />
                ) : (
                  <span className="h-12 w-16 shrink-0 bg-line" />
                )}
                <span className="min-w-0 flex-1" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <span className="block truncate font-ui text-[13px] text-ink">
                    {article.title[locale]}
                  </span>
                  <span className="block font-ui text-[11px] text-muted">
                    {article.category} · {(article.publishedAt ?? "").slice(0, 10)}
                  </span>
                </span>
                <span className="shrink-0 font-ui text-[11px] uppercase tracking-[0.1em] text-bordo">
                  + Əlavə et
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 font-ui text-[11px] text-muted">
            Məqaləyə klikləyəndə şəkli, başlığı, qısa mətni və «Oxu →» linki məktubun sonuna əlavə olunur.
          </p>
        </div>
      )}
    </div>
  );
}
