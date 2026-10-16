"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { categories, getSubcategories, type CategorySlug } from "@/lib/categories";
import {
  createArticle,
  removeArticle,
  saveArticle,
  snapshotArticleVersion,
  uploadImage,
} from "@/lib/data/admin";
import { canEditCategory, isAdmin, useAuth } from "@/lib/firebase/auth";
import { locales, type Locale } from "@/lib/i18n/config";
import { markdownToHtml } from "@/lib/markdown";
import {
  emptyLocalized,
  emptyLocalizedTags,
  estimateReadingMinutes,
  type Article,
  type ArticleInput,
  type ArticleStatus,
  type LocalizedTags,
  type LocalizedText,
} from "@/lib/types";

import {
  Alert,
  Button,
  Field,
  LocaleTabs,
  Panel,
  inputClass,
  labelClass,
} from "./ui";
import AIContentAssistant from "./AIContentAssistant";

/** Başlıqdan URL üçün ünvan düzəldir: "Payız 2026" → "payiz-2026". */
function slugify(value: string): string {
  const map: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya",
  };

  return value
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function emptyArticle(): ArticleInput {
  return {
    slug: "",
    category: "gundem",
    subcategory: "",
    status: "draft",
    featured: false,
    trending: false,
    coverImage: "",
    coverCredit: "",
    coverAlt: emptyLocalized(),
    title: emptyLocalized(),
    excerpt: emptyLocalized(),
    body: emptyLocalized(),
    tags: emptyLocalizedTags(),
    author: "Nesreen",
    publishedAt: new Date().toISOString().slice(0, 10),
    readingMinutes: 0,
    scheduledAt: undefined,
  };
}

const MARKDOWN_HELP = `## Başlıq      ### Alt başlıq
**qalın**     *maili*
> sitat
- siyahı      1. nömrəli siyahı
[mətn](https://ünvan)
![izah](şəkil.jpg)
---  (ayırıcı xətt)`;

export default function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const { session } = useAuth();

  const [draft, setDraft] = useState<ArticleInput>(() =>
    article ? { ...article } : emptyArticle(),
  );
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const allowedCategories = categories.filter((category) =>
    canEditCategory(session, category.slug),
  );

  const filled = useMemo(
    () =>
      Object.fromEntries(
        locales.map((code) => [
          code,
          Boolean(draft.title[code]?.trim() && draft.body[code]?.trim()),
        ]),
      ) as Record<Locale, boolean>,
    [draft.title, draft.body],
  );

  function setLocalized(field: "title" | "excerpt" | "body" | "coverAlt", value: string) {
    setDraft((current) => ({
      ...current,
      [field]: { ...(current[field] as LocalizedText), [activeLocale]: value },
    }));
  }

  function setTags(value: string) {
    const list = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setDraft((current) => ({
      ...current,
      tags: { ...(current.tags as LocalizedTags), [activeLocale]: list },
    }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadImage(file, "covers");
      setDraft((current) => ({ ...current, coverImage: url }));
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Şəkil yüklənmədi.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleInlineImageUpload(file: File) {
    setUploadingInline(true);
    setMessage(null);
    try {
      const url = await uploadImage(file, "inline-images");
      // Markdown formatında şəkil əlavə et
      const imageMarkdown = `\n![Şəkil təsviri](${url})\n`;
      setDraft((current) => ({
        ...current,
        body: {
          ...current.body,
          [activeLocale]: (current.body[activeLocale] || "") + imageMarkdown,
        },
      }));
      setMessage({ tone: "success", text: "Şəkil mətinə əlavə edildi." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Şəkil yüklənmədi.",
      });
    } finally {
      setUploadingInline(false);
    }
  }

  async function handleSave(nextStatus?: ArticleStatus) {
    setMessage(null);

    if (!draft.title.az.trim()) {
      setMessage({ tone: "error", text: "Azərbaycan dilində başlıq mütləqdir." });
      setActiveLocale("az");
      return;
    }

    const slug = draft.slug.trim() || slugify(draft.title.az);
    if (!slug) {
      setMessage({ tone: "error", text: "Ünvan (slug) yaradıla bilmədi." });
      return;
    }

    // Planlaşdırılmış dərc yoxlaması
    if (nextStatus === "scheduled" && !draft.scheduledAt) {
      setMessage({ tone: "error", text: "Planlaşdırılmış dərc üçün tarix-vaxt seçin." });
      return;
    }

    const payload: ArticleInput = {
      ...draft,
      slug,
      status: nextStatus ?? draft.status,
      readingMinutes:
        draft.readingMinutes > 0
          ? draft.readingMinutes
          : estimateReadingMinutes(draft.body.az || draft.body.en || ""),
      // Scheduled deyilsə scheduledAt-ı sil
      scheduledAt: nextStatus === "scheduled" ? draft.scheduledAt : undefined,
    };

    setBusy(true);
    try {
      if (article) {
        await saveArticle(article.id, payload);
        // Versiya snapshot-u yarat
        await snapshotArticleVersion({
          articleId: article.id,
          article: payload,
          summary: nextStatus === "published"
            ? "Dərc edildi"
            : nextStatus === "scheduled"
            ? `Planlaşdırıldı: ${draft.scheduledAt}`
            : "Redaktə edildi",
          userEmail: session?.email ?? "unknown",
        });
        setDraft(payload);
        setMessage({ tone: "success", text: "Dəyişikliklər yadda saxlanıldı." });
      } else {
        const id = await createArticle(payload);
        // Yeni məqalə üçün ilk versiya
        await snapshotArticleVersion({
          articleId: id,
          article: payload,
          summary: "Məqalə yaradıldı",
          userEmail: session?.email ?? "unknown",
          currentVersion: 0,
        });
        setMessage({ tone: "success", text: "Məqalə yaradıldı." });
        router.push(`/admin/articles/${id}`);
      }
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Yadda saxlanılmadı.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!article) return;
    if (!window.confirm("Bu məqalə həmişəlik silinsin?")) return;

    setBusy(true);
    try {
      await removeArticle(article.id);
      router.push("/admin/articles");
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Silinmədi.",
      });
      setBusy(false);
    }
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      {message && (
        <div className="mb-6">
          <Alert tone={message.tone}>{message.text}</Alert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        {/* ------------------------- Mətn ------------------------- */}
        <div className="space-y-6 xl:col-span-8">
          <Panel
            title="Məzmun"
            description="Hər dil üçün ayrıca başlıq, xülasə və mətn. Qızılı nöqtə dilin dolu olduğunu göstərir."
          >
            <LocaleTabs active={activeLocale} onChange={setActiveLocale} filled={filled} />

            <div className="mt-6 space-y-5">
              <Field label="Başlıq">
                <input
                  type="text"
                  value={draft.title[activeLocale]}
                  onChange={(event) => setLocalized("title", event.target.value)}
                  className={`${inputClass} font-display !text-lg`}
                  placeholder="Məqalənin başlığı"
                />
              </Field>

              <Field label="Xülasə" hint="Kartlarda və axtarışda görünən 1–2 cümlə.">
                <textarea
                  rows={3}
                  value={draft.excerpt[activeLocale]}
                  onChange={(event) => setLocalized("excerpt", event.target.value)}
                  className={`${inputClass} resize-y`}
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClass}>Mətn (Markdown)</label>
                  <div className="flex items-center gap-3">
                    {/* Şəkil yükləmə düyməsi */}
                    <label className="cursor-pointer font-ui text-[11px] uppercase tracking-[0.14em] text-gold hover:text-bordo transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingInline}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void handleInlineImageUpload(file);
                          event.target.value = ""; // Reset input
                        }}
                        className="hidden"
                      />
                      {uploadingInline ? "Yüklənir…" : "📷 Şəkil əlavə et"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setPreview((value) => !value)}
                      className="font-ui text-[11px] uppercase tracking-[0.14em] text-bordo hover:opacity-70"
                    >
                      {preview ? "Redaktəyə qayıt" : "Önizləmə"}
                    </button>
                  </div>
                </div>

                {preview ? (
                  <div
                    className="prose-mag min-h-[420px] border border-line bg-cream px-6 py-5"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(draft.body[activeLocale]),
                    }}
                  />
                ) : (
                  <textarea
                    rows={20}
                    value={draft.body[activeLocale]}
                    onChange={(event) => setLocalized("body", event.target.value)}
                    className={`${inputClass} resize-y font-mono !text-[13.5px] leading-relaxed`}
                    placeholder="Məqalənin mətni…"
                  />
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer font-ui text-[11.5px] text-muted hover:text-bordo">
                    Markdown yazı qaydaları
                  </summary>
                  <pre className="mt-2 overflow-x-auto border border-line bg-cream-deep/40 p-3 font-mono text-[12px] leading-relaxed text-ink-soft">
                    {MARKDOWN_HELP}
                  </pre>
                </details>
              </div>

              <Field
                label="Etiketlər"
                hint="Vergüllə ayırın. Məsələn: Paris, Moda həftəsi, SS27"
              >
                <input
                  type="text"
                  value={(draft.tags[activeLocale] ?? []).join(", ")}
                  onChange={(event) => setTags(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Panel>
        </div>

        {/* ------------------------ Parametrlər ------------------------ */}
        <div className="space-y-6 xl:col-span-4">
          <Panel title="Dərc">
            <div className="space-y-5">
              <Field label="Bölmə">
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      category: event.target.value as CategorySlug,
                      // Alt bölmələr bölməyə bağlıdır — bölmə dəyişəndə seçim sıfırlanır.
                      subcategory: "",
                    }))
                  }
                  className={inputClass}
                >
                  {allowedCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name.az}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Alt bölmə" hint="Menyudakı açılan siyahıda görünür.">
                <select
                  value={draft.subcategory ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, subcategory: event.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">— seçilməyib —</option>
                  {getSubcategories(draft.category).map((sub) => (
                    <option key={sub.slug} value={sub.slug}>
                      {sub.name.az}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Ünvan (slug)"
                hint={`Sayt ünvanı: /az/${draft.category}/${
                  draft.slug || slugify(draft.title.az) || "…"
                }`}
              >
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, slug: event.target.value }))
                  }
                  onBlur={() =>
                    setDraft((current) => ({
                      ...current,
                      slug: current.slug.trim() || slugify(current.title.az),
                    }))
                  }
                  className={`${inputClass} font-mono !text-[13px]`}
                  placeholder="avtomatik yaranır"
                />
              </Field>

              <Field label="Dərc tarixi">
                <input
                  type="date"
                  value={draft.publishedAt.slice(0, 10)}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, publishedAt: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field
                label="Planlaşdırılmış dərc"
                hint="Gələcək tarix-vaxt seçsəniz, məqalə avtomatik dərc ediləcək."
              >
                <input
                  type="datetime-local"
                  value={draft.scheduledAt ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      scheduledAt: event.target.value || undefined,
                    }))
                  }
                  className={inputClass}
                />
                {draft.scheduledAt && new Date(draft.scheduledAt) > new Date() && (
                  <p className="mt-1 font-ui text-[11px] text-gold-soft">
                    ⏰ Planlaşdırılıb: {new Date(draft.scheduledAt).toLocaleString("az-AZ")}
                  </p>
                )}
              </Field>

              <Field label="Müəllif">
                <input
                  type="text"
                  value={draft.author}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, author: event.target.value }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Oxu müddəti" hint="0 yazsanız mətnə görə avtomatik hesablanır.">
                <input
                  type="number"
                  min={0}
                  value={draft.readingMinutes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      readingMinutes: Number(event.target.value) || 0,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <div className="space-y-3 border-t border-line pt-5">
                <label className="flex items-center gap-3 font-ui text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, featured: event.target.checked }))
                    }
                    className="h-4 w-4 accent-[#7b2233]"
                  />
                  Ana səhifənin baş məqaləsi
                </label>

                <label className="flex items-center gap-3 font-ui text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={draft.trending}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, trending: event.target.checked }))
                    }
                    className="h-4 w-4 accent-[#7b2233]"
                  />
                  «Çox oxunanlar» siyahısında
                </label>
              </div>
            </div>
          </Panel>

          <Panel title="Üz qabığı şəkli">
            <div className="space-y-4">
              <div className="media-frame relative aspect-[4/3] border border-line">
                {draft.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.coverImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <p className="font-ui text-[12px] text-muted">
                      Şəkil yoxdur — saytda bölmənin naxışlı örtüyü göstəriləcək
                    </p>
                  </div>
                )}
              </div>

              <label className="block">
                <span className={labelClass}>Kompüterdən yüklə</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                  className="w-full font-ui text-[12px] text-ink-soft file:mr-3 file:border file:border-line file:bg-cream file:px-3 file:py-2 file:font-ui file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-ink hover:file:border-bordo"
                />
                {uploading && (
                  <span className="mt-2 block font-ui text-[12px] text-bordo">
                    Yüklənir…
                  </span>
                )}
              </label>

              <Field label="və ya şəkil ünvanı">
                <input
                  type="url"
                  value={draft.coverImage}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, coverImage: event.target.value }))
                  }
                  className={`${inputClass} font-mono !text-[12px]`}
                  placeholder="https://…"
                />
              </Field>

              <Field label={`Şəklin izahı (${activeLocale.toUpperCase()})`}>
                <input
                  type="text"
                  value={draft.coverAlt[activeLocale]}
                  onChange={(event) => setLocalized("coverAlt", event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Şəklin mənbəyi">
                <input
                  type="text"
                  value={draft.coverCredit}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, coverCredit: event.target.value }))
                  }
                  className={inputClass}
                  placeholder="Foto: …"
                />
              </Field>
            </div>
          </Panel>

          {/* AI Kontent Köməkçisi */}
          <AIContentAssistant
            title={draft.title[activeLocale]}
            body={draft.body[activeLocale]}
            category={draft.category}
            onApplyTitle={(t) =>
              setDraft((cur) => ({
                ...cur,
                title: { ...cur.title, [activeLocale]: t },
              }))
            }
            onApplyExcerpt={(e) =>
              setDraft((cur) => ({
                ...cur,
                excerpt: { ...cur.excerpt, [activeLocale]: e },
              }))
            }
          />
        </div>
      </div>

      {/* ------------------------- Alt panel ------------------------- */}
      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-paper px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
            Vəziyyət
          </span>
          <span
            className={`border px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.14em] ${
              draft.status === "published"
                ? "border-gold bg-gold/15 text-ink"
                : draft.status === "scheduled"
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-line bg-cream-deep text-muted"
            }`}
          >
            {draft.status === "published"
              ? "Dərc olunub"
              : draft.status === "scheduled"
              ? "Planlaşdırılıb"
              : "Qaralama"}
          </span>
          {article && (
            <a
              href={`/admin/article-versions?articleId=${article.id}`}
              className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted hover:text-bordo transition-colors"
            >
              Versiyalar →
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {article && isAdmin(session) && (
            <Button variant="danger" onClick={() => void handleDelete()} disabled={busy}>
              Sil
            </Button>
          )}
          <Button variant="ghost" onClick={() => void handleSave("draft")} disabled={busy}>
            Qaralama saxla
          </Button>
          {draft.scheduledAt && new Date(draft.scheduledAt) > new Date() && (
            <Button variant="ghost" onClick={() => void handleSave("scheduled")} disabled={busy}>
              {busy ? "Saxlanılır…" : "Planlaşdır"}
            </Button>
          )}
          <Button onClick={() => void handleSave("published")} disabled={busy}>
            {busy ? "Saxlanılır…" : "Dərc et"}
          </Button>
        </div>
      </div>
    </div>
  );
}
