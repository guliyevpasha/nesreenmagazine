/**
 * Məqalə Redaktoru
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 */
"use client";

import { authorizedFetch } from "@/lib/auth/authorized-fetch";
import { uploadFormData } from "@/lib/upload-client";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { categories, getSubcategories, type CategorySlug } from "@/lib/categories";
import {
  createArticle,
  removeArticle,
  saveArticle,
  snapshotArticleVersion,
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
import RichTextEditor from "./RichTextEditor";

/** Başlıqdan URL üçün ünvan düzəldir - bütün 5 dili dəstəkləyir */
function slugify(value: string, locale: Locale = "az"): string {
  // Azərbaycan hərfləri
  const azMap: Record<string, string> = {
    ə: "e", ı: "i", ö: "o", ü: "u", ğ: "g", ş: "s", ç: "c",
    Ə: "e", I: "i", İ: "i", Ö: "o", Ü: "u", Ğ: "g", Ş: "s", Ç: "c",
  };
  
  // Rus hərfləri (Kiril)
  const ruMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    А: "a", Б: "b", В: "v", Г: "g", Д: "d", Е: "e", Ё: "e", Ж: "zh",
    З: "z", И: "i", Й: "y", К: "k", Л: "l", М: "m", Н: "n", О: "o",
    П: "p", Р: "r", С: "s", Т: "t", У: "u", Ф: "f", Х: "h", Ц: "ts",
    Ч: "ch", Ш: "sh", Щ: "sch", Ъ: "", Ы: "y", Ь: "", Э: "e", Ю: "yu", Я: "ya",
  };
  
  // Türk hərfləri
  const trMap: Record<string, string> = {
    ı: "i", ğ: "g", ü: "u", ş: "s", ö: "o", ç: "c",
    İ: "i", Ğ: "g", Ü: "u", Ş: "s", Ö: "o", Ç: "c",
  };
  
  // Ərəb hərfləri (sadələşdirilmiş transliterasiya)
  const arMap: Record<string, string> = {
    ا: "a", أ: "a", إ: "i", آ: "aa", ب: "b", ت: "t", ث: "th", ج: "j",
    ح: "h", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh",
    ص: "s", ض: "d", ط: "t", ظ: "dh", ع: "a", غ: "gh", ف: "f", ق: "q",
    ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y", ى: "a",
    ة: "h", ئ: "", ء: "", ؤ: "w",
  };
  
  // Bütün map-ləri birləşdir
  const combinedMap = { ...azMap, ...ruMap, ...trMap, ...arMap };

  // ƏVVƏLCƏ hər hərfi map-dən yoxla, SONRA toLowerCase
  return value
    .split("")
    .map((char) => combinedMap[char] ?? char)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Aksent işarələrini sil
    .replace(/[^a-z0-9]+/g, "-") // Latın hərfləri və rəqəmlər istisna, qalanını - ilə əvəz et
    .replace(/^-+|-+$/g, "") // Əvvəl və sondakı - sil
    .slice(0, 80); // Maksimum 80 simvol
}

function emptyArticle(): ArticleInput {
  return {
    slug: emptyLocalized(),
    category: "gundem",
    subcategory: "",
    status: "draft", // Default: draft (qaralama)
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

/**
 * Məqalə cache-ini təmizlə
 */
type ArticleLocation = {
  category: string;
  subcategory?: string;
  slug: LocalizedText | string;
};

/**
 * Məqalənin saytdakı bütün ünvanlarını (5 dil × ana səhifə, kateqoriya,
 * alt bölmə, məqalə) yeniləyir. Köhnə və yeni ünvan birlikdə verilir ki,
 * slug və ya kateqoriya dəyişəndə köhnə səhifə də təmizlənsin.
 */
async function revalidateArticleCache(locations: ArticleLocation[]): Promise<boolean> {
  const paths = new Set<string>();
  for (const { category, subcategory, slug } of locations) {
    for (const code of locales) {
      paths.add(`/${code}`);
      paths.add(`/${code}/${category}`);
      if (subcategory) paths.add(`/${code}/${category}/bolme/${subcategory}`);
      const localized = typeof slug === "string" ? slug : slug[code] || slug.az;
      if (localized) paths.add(`/${code}/${category}/${localized}`);
    }
  }

  try {
    const response = await authorizedFetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: [...paths] }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function saveResultMessage(status: ArticleStatus, wasPublished: boolean, cacheCleared: boolean): string {
  const cacheNote = cacheCleared ? "" : " Sayt keşi təmizlənmədi — dəyişiklik 1 dəqiqə ərzində görünəcək.";
  if (status === "published") {
    return (wasPublished ? "Məqalə yeniləndi və saytda görünür." : "Məqalə dərc edildi və saytda görünür.") + cacheNote;
  }
  if (status === "scheduled") {
    return "Məqalə planlaşdırıldı." + (wasPublished ? " Saytdan müvəqqəti çıxarıldı." + cacheNote : "");
  }
  return wasPublished
    ? "Məqalə dərcdən çıxarıldı və qaralamaya keçirildi." + cacheNote
    : "Qaralama yadda saxlanıldı.";
}

export default function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const { session } = useAuth();

  const [draft, setDraft] = useState<ArticleInput>(() => {
    if (!article) return emptyArticle();
    
    // Normalize article data to ensure all LocalizedText fields are objects
    const normalizeLocalizedText = (value: any): LocalizedText => {
      if (typeof value === 'string') {
        return { az: value, en: '', ru: '', tr: '', ar: '' };
      }
      return value || emptyLocalized();
    };
    
    const normalizeLocalizedTags = (value: any): LocalizedTags => {
      if (typeof value === 'string') {
        return { az: [value], en: [], ru: [], tr: [], ar: [] };
      }
      return value || emptyLocalizedTags();
    };
    
    return {
      ...article,
      slug: normalizeLocalizedText(article.slug),
      title: normalizeLocalizedText(article.title),
      body: normalizeLocalizedText(article.body),
      excerpt: normalizeLocalizedText(article.excerpt),
      coverAlt: normalizeLocalizedText(article.coverAlt),
      tags: normalizeLocalizedTags(article.tags),
    };
  });
  const [activeLocale, setActiveLocale] = useState<Locale>("az");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  /** Məqalə hazırda saytda dərc olunubmu (status yalnız saxlama ilə dəyişir) */
  const isLive = Boolean(article) && draft.status === "published";

  /** «Saytda yerləşmə» paneli üçün sadə dildə xülasə */
  const placementSummary = useMemo(() => {
    const category = categories.find((item) => item.slug === draft.category);
    const sub = getSubcategories(draft.category).find((item) => item.slug === draft.subcategory);
    const lines = [
      draft.featured ? "Ana səhifə — yuxarıdakı böyük karusel" : "Ana səhifə — son məqalələr lenti",
      `«${category?.name.az ?? draft.category}» bölməsi`,
    ];
    if (sub) lines.push(`«${sub.name.az}» alt bölməsi`);
    if (draft.trending) lines.push("«Çox oxunanlar» siyahısı");
    const missing = locales.filter((code) => !draft.title[code]?.trim() || !draft.body[code]?.trim());
    lines.push(
      missing.length === 0
        ? "5 dildə tam"
        : `Boş dillər: ${missing.map((code) => code.toUpperCase()).join(", ")} — orada AZ mətni göstəriləcək`,
    );
    return lines;
  }, [draft.category, draft.subcategory, draft.featured, draft.trending, draft.title, draft.body]);

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

  function setLocalized(field: "title" | "excerpt" | "body" | "coverAlt" | "slug", value: string) {
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
      // Upload to Cloudinary via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'covers');

      const response = await uploadFormData(formData);

      if (!response.ok) {
        const responseClone = response.clone();
        let errorMessage = 'Yükləmə uğursuz oldu';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          try {
            const errorText = await responseClone.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // Ignore
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setDraft((current) => ({ ...current, coverImage: result.url }));
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
      // Upload to Cloudinary via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'inline-images');

      const response = await uploadFormData(formData);

      if (!response.ok) {
        const responseClone = response.clone();
        let errorMessage = 'Yükləmə uğursuz oldu';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          try {
            const errorText = await responseClone.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // Ignore
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const url = result.url;

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

    // Hər dil üçün slug yaradırıq
    const currentSlug = typeof draft.slug === "string" ? { az: draft.slug, en: "", ru: "", tr: "", ar: "" } : draft.slug;
    
    const slugs: LocalizedText = {
      az: currentSlug.az.trim() || slugify(draft.title.az, "az"),
      en: currentSlug.en.trim() || slugify(draft.title.en || draft.title.az, "en"),
      ru: currentSlug.ru.trim() || slugify(draft.title.ru || draft.title.az, "ru"),
      tr: currentSlug.tr.trim() || slugify(draft.title.tr || draft.title.az, "tr"),
      ar: currentSlug.ar.trim() || slugify(draft.title.ar || draft.title.az, "ar"),
    };
    
    if (!slugs.az) {
      setMessage({ tone: "error", text: "Azərbaycan dilində ünvan (slug) yaradıla bilmədi." });
      return;
    }

    // Planlaşdırılmış dərc yoxlaması
    if (nextStatus === "scheduled" && !draft.scheduledAt) {
      setMessage({ tone: "error", text: "Planlaşdırılmış dərc üçün tarix-vaxt seçin." });
      return;
    }

    if (nextStatus === "scheduled" && draft.scheduledAt && new Date(draft.scheduledAt) <= new Date()) {
      setMessage({ tone: "error", text: "Planlaşdırma tarixi gələcəkdə olmalıdır." });
      return;
    }

    // Artıq dərc olunmuş məqalə yenilənəndə orijinal dərc tarixi saxlanılır;
    // ilk dəfə dərc olunanda tarix «indi» olur.
    const wasPublished = Boolean(article) && draft.status === "published";
    const newStatus: ArticleStatus = nextStatus ?? draft.status;
    let finalPublishedAt = draft.publishedAt;
    if (newStatus === "published" && !wasPublished) {
      finalPublishedAt = new Date().toISOString();
    } else if (newStatus === "scheduled" && draft.scheduledAt) {
      finalPublishedAt = new Date(draft.scheduledAt).toISOString();
    }

    const payload: ArticleInput = {
      ...draft,
      slug: slugs,
      status: newStatus,
      publishedAt: finalPublishedAt,
      readingMinutes:
        draft.readingMinutes > 0
          ? draft.readingMinutes
          : estimateReadingMinutes(draft.body.az || draft.body.en || ""),
    };

    // Planlaşdırma tarixi yalnız «scheduled» statusunda saxlanılır
    if (newStatus === "scheduled" && draft.scheduledAt) {
      payload.scheduledAt = draft.scheduledAt;
    } else {
      delete payload.scheduledAt;
    }

    // Saytda görünən hər dəyişiklikdə (dərc, yeniləmə, dərcdən çıxarma) cache təmizlənir
    const affectsSite = newStatus === "published" || wasPublished;
    const locations: ArticleLocation[] = [
      { category: payload.category, subcategory: payload.subcategory, slug: payload.slug },
    ];
    if (article) {
      locations.push({ category: article.category, subcategory: article.subcategory, slug: article.slug });
    }

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
        
        const cacheCleared = affectsSite ? await revalidateArticleCache(locations) : true;
        setMessage({
          tone: "success",
          text: saveResultMessage(newStatus, wasPublished, cacheCleared),
        });
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
        
        const cacheCleared = affectsSite ? await revalidateArticleCache(locations) : true;
        setMessage({
          tone: "success",
          text: saveResultMessage(newStatus, false, cacheCleared),
        });
        
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
            description="Hər dil üçün ayrıca başlıq, xülasə və mətn daxil edin. Qızılı nöqtə dilin dolu olduğunu göstərir."
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
                  <RichTextEditor
                    content={draft.body[activeLocale]}
                    onChange={(html) => setLocalized("body", html)}
                    placeholder="Məqalənin mətni…"
                  />
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer font-ui text-[11.5px] text-muted hover:text-bordo">
                    Formatlaşdırma məsləhətləri
                  </summary>
                  <div className="mt-2 border border-line bg-cream-deep/40 p-3 font-ui text-[12px] leading-relaxed text-ink-soft">
                    <p className="font-semibold mb-1">⚠️ Başlıqlar haqqında:</p>
                    <p>• Başlıqlar (H1-H6) bütün sətirə tətbiq olunur, tək sözə deyil</p>
                    <p>• Hər sətirdə yalnız 1 başlıq olmalıdır</p>
                    <p>• Başlıq 1 ən böyük (40px), Başlıq 6 ən kiçik (17px)</p>
                    <hr className="my-2 border-line" />
                    <p className="font-semibold mb-1">📝 Necə istifadə edək:</p>
                    <p>• Şəkil əlavə etmək üçün 🖼️ düyməsinə basın</p>
                    <p>• Link əlavə etmək üçün mətni seçib 🔗 düyməsinə basın</p>
                    <p>• Tək sözü böyütmək üçün "Font Size" seçin</p>
                    <p>• Mətn düzəlişi: qalın (B), maili (I), altdan xətt (U)</p>
                  </div>
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

              <Field
                label={`Ünvan (slug) - ${activeLocale.toUpperCase()}`}
                hint={`Sayt ünvanı: /${activeLocale}/${draft.category}/${
                  typeof draft.slug === "string" 
                    ? draft.slug 
                    : (draft.slug[activeLocale] || slugify(draft.title[activeLocale] || draft.title.az, activeLocale) || "…")
                }`}
              >
                <input
                  type="text"
                  value={typeof draft.slug === "string" ? draft.slug : draft.slug[activeLocale]}
                  onChange={(event) => setLocalized("slug", event.target.value)}
                  onBlur={() => {
                    // Boşdursa avtomatik slug yaradırıq
                    const currentValue = typeof draft.slug === "string" ? draft.slug : draft.slug[activeLocale];
                    if (!currentValue.trim()) {
                      const autoSlug = slugify(draft.title[activeLocale] || draft.title.az, activeLocale);
                      setLocalized("slug", autoSlug);
                    }
                  }}
                  className={`${inputClass} font-mono !text-[13px]`}
                  placeholder="avtomatik yaranır"
                />
              </Field>
            </div>
          </Panel>
        </div>

        {/* ------------------------ Parametrlər ------------------------ */}
        <div className="space-y-6 xl:col-span-4">
          {/* Saytda yerləşmə — bir baxışda: bölmə, alt bölmə, ana səhifədəki yer */}
          <Panel title="Saytda yerləşmə">
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

              {getSubcategories(draft.category).length > 0 && (
                <Field label="Alt bölmə" hint="Menyuda bölmənin açılan siyahısında görünür.">
                  <select
                    value={draft.subcategory ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, subcategory: event.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="">— yalnız əsas bölmədə —</option>
                    {getSubcategories(draft.category).map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name.az}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <fieldset className="space-y-2">
                <legend className="mb-2 font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Ana səhifədə
                </legend>
                {[
                  { featured: false, title: "Adi məqalə", text: "Ana səhifənin və bölmənin lentində, tarixə görə." },
                  { featured: true, title: "Baş məqalə", text: "Ana səhifənin yuxarısındakı böyük karuseldə." },
                ].map((option) => (
                  <label
                    key={option.title}
                    className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                      draft.featured === option.featured ? "border-bordo bg-bordo/5" : "border-line hover:border-ink/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="placement"
                      checked={draft.featured === option.featured}
                      onChange={() => setDraft((current) => ({ ...current, featured: option.featured }))}
                      className="mt-1 h-4 w-4 accent-[#7b2233]"
                    />
                    <span>
                      <span className="block font-ui text-[13px] text-ink">{option.title}</span>
                      <span className="block font-ui text-[11px] text-muted">{option.text}</span>
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-3 pt-1 font-ui text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={draft.trending}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, trending: event.target.checked }))
                    }
                    className="h-4 w-4 accent-[#7b2233]"
                  />
                  Həmçinin «Çox oxunanlar» siyahısında göstər
                </label>
              </fieldset>

              <div className="border-t border-line pt-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Dərc olunanda görünəcək
                </p>
                <ul className="mt-2 space-y-1 font-ui text-[12px] text-ink-soft">
                  {placementSummary.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          <Panel title="Dərc">
            <div className="space-y-5">
              <Field label="Dərc tarixi" hint="«Dərc et» basanda avtomatik bu günə qoyulur.">
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
                hint="Gələcək vaxt seçib «Planlaşdır» basın — məqalə həmin vaxt avtomatik dərc olunur."
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

              <Field label="Oxu müddəti (dəq.)" hint="0 yazsanız mətnə görə avtomatik hesablanır.">
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
            title={draft.title[activeLocale] || ""}
            body={draft.body[activeLocale] || ""}
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
      <div className="sticky bottom-0 mt-8 border border-line bg-paper px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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

          {article && isAdmin(session) && (
            <Button variant="danger" onClick={() => void handleDelete()} disabled={busy}>
              Sil
            </Button>
          )}
        </div>

        {/* Əməliyyat düymələri — status həmin düymələrlə təyin olunur (ayrıca select yoxdur) */}
        <div className="flex flex-wrap items-end gap-3">
          {draft.status === "scheduled" && (
            <div className="flex-1 min-w-[200px]">
              <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                Planlaşdırılmış dərc tarixi yuxarıdakı «Dərc tarixi» bölməsində seçilir
              </p>
              <p className="mt-1 font-ui text-xs text-muted">
                {draft.scheduledAt
                  ? `Dərc ediləcək vaxt: ${new Date(draft.scheduledAt).toLocaleString("az-AZ")}`
                  : "Tarix seçilməyib"}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 ml-auto">
            <Button variant="ghost" onClick={() => router.back()} disabled={busy}>
              Ləğv et
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  isLive &&
                  !window.confirm("Məqalə saytdan çıxarılıb qaralamaya keçiriləcək. Davam edilsin?")
                ) {
                  return;
                }
                void handleSave("draft");
              }}
              disabled={busy}
            >
              {isLive ? "Dərcdən çıxar" : "Qaralama saxla"}
            </Button>
            {draft.scheduledAt && new Date(draft.scheduledAt) > new Date() && (
              <Button
                variant="ghost"
                onClick={() => void handleSave("scheduled")}
                disabled={busy}
              >
                {busy ? "Saxlanılır…" : "Planlaşdır"}
              </Button>
            )}
            <Button onClick={() => void handleSave("published")} disabled={busy}>
              {busy ? "Saxlanılır…" : isLive ? "Yenilə" : "Dərc et"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
