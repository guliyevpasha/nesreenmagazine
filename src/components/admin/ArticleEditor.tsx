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
import { useEffect, useMemo, useRef, useState } from "react";

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
import WordEditor from "./editor/word/WordEditor";
import ArticleHomepagePlacements from "./ArticleHomepagePlacements";
import Link from "next/link";
import {
  HOMEPAGE_SECTION_OPTIONS,
  getArticleHomepagePlacements,
  syncArticleHomepageSections,
} from "@/lib/data/admin-homepage";
import { homepageSectionLabels, type HomepageSectionId } from "@/lib/types";

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

/** ISO tarix gələcəkdədirmi */
function isFutureDate(iso: string | undefined): boolean {
  if (!iso) return false;
  const time = Date.parse(iso);
  return Number.isFinite(time) && time > Date.now();
}

/** ISO → <input type="datetime-local"> dəyəri (yerli vaxt, "YYYY-MM-DDTHH:mm") */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const AZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];

/** «7 noyabr 2026» */
function formatLocalDate(value: string | undefined): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** «7 noyabr 2026, 09:30» */
function formatLocalDateTime(value: string | undefined): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatLocalDate(value)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

  /* ── Ana səhifə bölmələri (Ana Səhifə İdarəsi ilə eyni struktur) ── */
  const canManageHomepage = session?.role === "admin" || session?.role === "editor";
  const [homeSections, setHomeSections] = useState<HomepageSectionId[]>(
    () => article?.homepageSections ?? [],
  );
  const [homeTouched, setHomeTouched] = useState(false);
  const homeTouchedRef = useRef(false);
  homeTouchedRef.current = homeTouched;
  useEffect(() => {
    // Dərc olunmuş məqalə üçün həqiqi vəziyyət homepageEditorial-dadır.
    if (!article || article.status !== "published") return;
    let cancelled = false;
    getArticleHomepagePlacements(article.id).then((placements) => {
      if (cancelled || placements.length === 0) return;
      const ids = Array.from(new Set(placements.map((p) => p.sectionId)));
      setHomeSections((current) => (homeTouchedRef.current ? current : ids));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);
  const toggleHomeSection = (id: HomepageSectionId, on: boolean) => {
    setHomeTouched(true);
    setHomeSections((current) =>
      on ? [...current.filter((x) => x !== id), id] : current.filter((x) => x !== id),
    );
  };

  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");

  /* ── Avtomatik saxlama (brauzerdə): yazılan mətn itməsin ── */
  const autosaveKey = `nm-article-autosave:${article?.id ?? "new"}`;
  const [baseline, setBaseline] = useState(() => JSON.stringify(draft));
  const [restorable, setRestorable] = useState<{ savedAt: number; draft: ArticleInput } | null>(null);
  const [autosavedAt, setAutosavedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(autosaveKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { savedAt: number; draft: ArticleInput };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bir dəfəlik localStorage oxunuşu
      if (parsed?.draft && JSON.stringify(parsed.draft) !== baseline) setRestorable(parsed);
      else localStorage.removeItem(autosaveKey);
    } catch {
      /* gizli rejim və ya zədəli məlumat */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnız açılışda
  }, [autosaveKey]);

  const dirty = JSON.stringify(draft) !== baseline;
  useEffect(() => {
    if (!dirty || restorable) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(autosaveKey, JSON.stringify({ savedAt: Date.now(), draft }));
        setAutosavedAt(Date.now());
      } catch {
        /* yaddaş dolub */
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [draft, dirty, autosaveKey, restorable]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function restoreAutosave() {
    if (!restorable) return;
    setDraft(restorable.draft);
    setRestorable(null);
  }

  function discardAutosave() {
    try {
      localStorage.removeItem(autosaveKey);
    } catch {
      /* */
    }
    setRestorable(null);
  }

  function clearAutosave(saved: ArticleInput) {
    setBaseline(JSON.stringify(saved));
    try {
      localStorage.removeItem(autosaveKey);
    } catch {
      /* */
    }
    setAutosavedAt(null);
  }

  const autosaveLabel = dirty
    ? autosavedAt
      ? `Avtomatik saxlanıldı (brauzerdə) · ${new Date(autosavedAt).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}`
      : "Saxlanmamış dəyişikliklər…"
    : "Bütün dəyişikliklər saxlanılıb";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "warning"; text: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  /**
   * Dərc modeli (cron tələb etmir):
   *   • Saytda      = status "published" və publishedAt ≤ indi
   *   • Planlaşdırılıb = status "published" və publishedAt > indi (sayt vaxtı çatana qədər göstərmir)
   *     (köhnə "scheduled" statuslu məqalələr də planlaşdırılmış sayılır)
   *   • Qaralama    = status "draft"
   * Status yalnız saxlama ilə dəyişir, ona görə draft.status saxlanmış vəziyyəti əks etdirir.
   */
  const savedIsFuture = isFutureDate(draft.publishedAt);
  const isScheduled =
    Boolean(article) &&
    (draft.status === "scheduled" || (draft.status === "published" && savedIsFuture));
  const isLive = Boolean(article) && draft.status === "published" && !savedIsFuture;

  const [publishMode, setPublishMode] = useState<"now" | "schedule">(() => (isScheduled ? "schedule" : "now"));
  const [scheduleLocal, setScheduleLocal] = useState<string>(() =>
    isScheduled ? toLocalInput(draft.scheduledAt ?? draft.publishedAt) : "",
  );

  /**
   * «Saytda yerləşmə» xülasəsi — ana səhifənin HƏQİQİ avtomatik məntiqinə uyğun
   * (src/app/(site)/[locale]/page.tsx): karusel = Gündəmin ən yeni 6 məqaləsi;
   * «Ən son» = hər bölmənin ən yeni 1 məqaləsi; Moda/Gözəllik/Həyat tərzi/Biznes
   * blokları = ən yeni 5 adi + yan sütunda ən yeni 5 «çox oxunan».
   */
  const placementSummary = useMemo(() => {
    const category = categories.find((item) => item.slug === draft.category);
    const sub = getSubcategories(draft.category).find((item) => item.slug === draft.subcategory);
    const catName = category?.name.az ?? draft.category;
    const hasBlock = ["moda", "gozellik", "heyat-terzi", "biznes"].includes(draft.category);

    const homepage: string[] = homeSections.map(
      (id) => `«${homepageSectionLabels[id]}» — seçilmiş (birinci yer)`,
    );
    const trending = homeSections.some((id) => id.endsWith("-most-read"));
    const featured = homeSections.includes("weekly-main-topic");
    if (draft.category === "gundem") {
      homepage.push("«Bu həftənin baş mövzusu» karuseli — Gündəmin ən yeni 6 məqaləsi arasında");
    } else {
      homepage.push(`«Ən son» lenti — «${catName}» bölməsinin ən yeni məqaləsi kimi`);
    }
    if (hasBlock) {
      homepage.push(
        trending
          ? `«${catName}» bloku — yan sütundakı «Çox oxunanlar» (ən yeni 5)`
          : `«${catName}» bloku — əsas lent (ən yeni 5)`,
      );
    }

    const pages = [`«${catName}» bölmə səhifəsi`];
    if (sub) pages.push(`«${sub.name.az}» alt bölmə səhifəsi`);
    if (featured || trending) pages.push("«Seçilənlər» səhifəsi");

    const missing = locales.filter((code) => !draft.title[code]?.trim() || !draft.body[code]?.trim());
    const languages =
      missing.length === 0
        ? "5 dildə tam"
        : `Boş: ${missing.map((code) => code.toUpperCase()).join(", ")} — orada AZ mətni göstəriləcək`;

    return { homepage, pages, languages, languagesOk: missing.length === 0 };
  }, [draft.category, draft.subcategory, homeSections, draft.title, draft.body]);

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

    const publishing = nextStatus === "published";
    const scheduling = publishing && publishMode === "schedule";

    if (scheduling) {
      if (!scheduleLocal) {
        setMessage({ tone: "error", text: "Planlaşdırmaq üçün «Dərc vaxtı» bölməsində tarix və saat seçin." });
        return;
      }
      if (!isFutureDate(new Date(scheduleLocal).toISOString())) {
        setMessage({ tone: "error", text: "Planlaşdırma vaxtı gələcəkdə olmalıdır." });
        return;
      }
    }

    // Dərc tarixi:
    //   planlaşdırma → seçilən vaxt; ilk dəfə dərc → indi;
    //   saytda olan məqalənin yenilənməsi → mövcud tarix (və ya əl ilə düzəldilmiş tarix).
    const wasPublished = isLive;
    const newStatus: ArticleStatus = publishing ? "published" : (nextStatus ?? draft.status);
    let finalPublishedAt = draft.publishedAt;
    if (scheduling) {
      finalPublishedAt = new Date(scheduleLocal).toISOString();
    } else if (publishing && !isLive) {
      finalPublishedAt = new Date().toISOString();
    }

    const payload: ArticleInput = {
      ...draft,
      // Ana səhifə bölmə seçimi köhnə işarələri də idarə edir:
      // «Ən çox oxunanlar» → trending, «Bu həftənin baş mövzusu» → featured (Seçilənlər səhifəsi).
      homepageSections: homeSections,
      trending: homeSections.some((id) => id.endsWith("-most-read")),
      featured: homeSections.includes("weekly-main-topic"),
      slug: slugs,
      status: newStatus,
      publishedAt: finalPublishedAt,
      readingMinutes:
        draft.readingMinutes > 0
          ? draft.readingMinutes
          : estimateReadingMinutes(draft.body.az || draft.body.en || ""),
    };
    // Köhnə ayrı sahə artıq istifadə olunmur — vaxt publishedAt-dadır
    delete payload.scheduledAt;

    // Saytda görünən hər dəyişiklikdə (dərc, yeniləmə, dərcdən çıxarma) cache təmizlənir
    const affectsSite = newStatus === "published" || wasPublished;
    const resultStatus: ArticleStatus = scheduling ? "scheduled" : newStatus;
    const locations: ArticleLocation[] = [
      { category: payload.category, subcategory: payload.subcategory, slug: payload.slug },
    ];
    if (article) {
      locations.push({ category: article.category, subcategory: article.subcategory, slug: article.slug });
    }

    /**
     * Seçilmiş ana səhifə bölmələrini homepageEditorial-a yazır (5 dilin hamısı).
     * Yalnız saytda olan məqalə üçün; ilk dərcdə və ya seçim dəyişəndə.
     * Qaytarır: istifadəçiyə əlavə qeyd (boş = problem yoxdur).
     */
    const syncHomepage = async (articleId: string): Promise<string> => {
      if (resultStatus !== "published") {
        return homeSections.length > 0 && homeTouched
          ? " Ana səhifə bölmə seçimi yadda saxlandı — məqalə dərc olunanda tətbiq ediləcək."
          : "";
      }
      if (!homeTouched && wasPublished) return "";
      if (!canManageHomepage) {
        return homeTouched ? " Ana səhifə bölmələrini yalnız admin və redaktor dəyişə bilər." : "";
      }
      try {
        await syncArticleHomepageSections(articleId, homeSections, {
          email: session?.email ?? "unknown",
          name: session?.name ?? session?.email ?? "unknown",
        });
        setHomeTouched(false);
        return "";
      } catch (error) {
        console.error("Ana səhifə bölmələri yazılmadı:", error);
        return " Ana səhifə bölmələri yenilənmədi — Ana Səhifə İdarəsindən yoxlayın.";
      }
    };

    setBusy(true);
    try {
      if (article) {
        await saveArticle(article.id, payload);
        const homeNote = await syncHomepage(article.id);
        // Versiya snapshot-u yarat
        await snapshotArticleVersion({
          articleId: article.id,
          article: payload,
          summary: scheduling
            ? `Planlaşdırıldı: ${formatLocalDateTime(finalPublishedAt)}`
            : publishing
            ? wasPublished
              ? "Yeniləndi"
              : "Dərc edildi"
            : "Redaktə edildi",
          userEmail: session?.email ?? "unknown",
        });
        setDraft(payload);
        clearAutosave(payload);
        if (!scheduling) setPublishMode("now");
        
        const cacheCleared = affectsSite ? await revalidateArticleCache(locations) : true;
        setMessage({
          tone: homeNote ? "warning" : "success",
          text: saveResultMessage(resultStatus, wasPublished, cacheCleared) + homeNote,
        });
      } else {
        const id = await createArticle(payload);
        const homeNote = await syncHomepage(id);
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
          tone: homeNote ? "warning" : "success",
          text: saveResultMessage(resultStatus, false, cacheCleared) + homeNote,
        });
        
        clearAutosave(payload);
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
                  <label className={labelClass}>Mətn</label>
                  <div className="flex items-center gap-1" role="group" aria-label="Görünüş">
                    {(
                      [
                        ["edit", "Redaktə"],
                        ["split", "Canlı önizləmə"],
                        ["preview", "Önizləmə"],
                      ] as const
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        data-testid={`view-${mode}`}
                        onClick={() => setViewMode(mode)}
                        className={`px-2 py-1 font-ui text-[11px] uppercase tracking-[0.14em] ${
                          viewMode === mode ? "text-bordo underline underline-offset-4" : "text-muted hover:text-bordo"
                        } ${mode === "split" ? "hidden xl:inline" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {restorable && (
                  <div className="mb-3 flex flex-wrap items-center gap-3 border border-gold/60 bg-gold/10 px-4 py-2.5 font-ui text-[13px] text-ink" data-testid="autosave-restore">
                    <span>
                      Saxlanmamış dəyişikliklər tapıldı ({new Date(restorable.savedAt).toLocaleString("az-AZ")}).
                    </span>
                    <button type="button" className="font-semibold text-bordo underline" onClick={restoreAutosave}>
                      Bərpa et
                    </button>
                    <button type="button" className="text-muted underline" onClick={discardAutosave}>
                      Sil
                    </button>
                  </div>
                )}

                <div className={viewMode === "split" ? "grid gap-4 xl:grid-cols-2" : ""}>
                  {viewMode !== "preview" && (
                    <WordEditor
                      key={activeLocale}
                      locale={activeLocale}
                      content={draft.body[activeLocale]}
                      onChange={(html) => setLocalized("body", html)}
                      placeholder="Məqalənin mətni…"
                      statusExtra={autosaveLabel}
                    />
                  )}
                  {viewMode !== "edit" && (
                    <div
                      data-testid="live-preview"
                      dir={activeLocale === "ar" ? "rtl" : "ltr"}
                      className="prose-mag min-h-[420px] overflow-auto border border-line bg-cream px-6 py-5"
                      dangerouslySetInnerHTML={{
                        __html: markdownToHtml(draft.body[activeLocale]),
                      }}
                    />
                  )}
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer font-ui text-[11.5px] text-muted hover:text-bordo">
                    Klaviatura qısayolları
                  </summary>
                  <div className="mt-2 grid gap-x-6 gap-y-1 border border-line bg-cream-deep/40 p-3 font-ui text-[12px] leading-relaxed text-ink-soft sm:grid-cols-2">
                    <p>Ctrl+B / I / U — qalın / kursiv / altıxətli</p>
                    <p>Ctrl+Z / Ctrl+Y — geri al / təkrarla</p>
                    <p>Ctrl+K — hiperlink</p>
                    <p>Ctrl+Shift+7 — nömrələnmiş siyahı</p>
                    <p>Ctrl+Shift+L — markerli siyahı</p>
                    <p>Ctrl+Shift+8 — formatlaşdırma işarələri ¶</p>
                    <p>Ctrl+L / E / R / J — düzləndirmə</p>
                    <p>Ctrl+] / Ctrl+[ — şrifti böyüt / kiçilt</p>
                    <p>Tab / Shift+Tab — girinti, siyahıda alt səviyyə</p>
                    <p>Ctrl+Boşluq — formatı təmizlə</p>
                    <p className="sm:col-span-2">Başlıq 1–6 həqiqi H1–H6 elementləridir. Səhifədə məqalə başlığı artıq H1 olduğu üçün mətndə H2-dən başlamaq tövsiyə olunur (SEO).</p>
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

              {/* Ana səhifə bölmələri — «Ana Səhifə İdarəsi» ilə eyni struktur */}
              <fieldset className="space-y-2">
                <legend className="mb-1 font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Ana səhifədə göstər
                </legend>
                <p className="mb-2 font-ui text-[11px] leading-relaxed text-muted">
                  Seçdiyiniz bölmələrə məqalə 5 dilin hamısında birinci yerə əlavə olunur. Sıranı{" "}
                  <Link href="/admin/homepage-builder" className="text-bordo underline">
                    Ana Səhifə İdarəsi
                  </Link>
                  -ndə dəyişə bilərsiniz.
                </p>
                <div className="space-y-1.5">
                  {HOMEPAGE_SECTION_OPTIONS.map((option) => {
                    const checked = homeSections.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 border px-3 py-2 transition-colors ${
                          canManageHomepage ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                        } ${checked ? "border-bordo bg-bordo/5" : "border-line hover:border-ink/30"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!canManageHomepage}
                          onChange={(event) => toggleHomeSection(option.id, event.target.checked)}
                          className="h-4 w-4 shrink-0 accent-[#7b2233]"
                        />
                        <span aria-hidden className="text-base leading-none">
                          {option.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-ui text-[13px] leading-snug text-ink">
                            {homepageSectionLabels[option.id]}
                          </span>
                          <span className="block font-ui text-[11px] text-muted">{option.hint}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {!canManageHomepage && (
                  <p className="font-ui text-[11px] text-amber-700">
                    Ana səhifə bölmələrini yalnız admin və redaktor seçə bilər.
                  </p>
                )}
                {homeSections.length > 0 && !isLive && (
                  <p className="font-ui text-[11px] text-muted">
                    Seçim məqalə ilə saxlanır və «Dərc et» basılanda ana səhifəyə tətbiq olunur.
                  </p>
                )}
              </fieldset>

              <div className="space-y-3 border-t border-line pt-4">
                <p className="font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Dərc olunanda görünəcək
                </p>
                {[
                  { title: "Ana səhifə", lines: placementSummary.homepage },
                  { title: "Sayt səhifələri", lines: placementSummary.pages },
                ].map((group) => (
                  <div key={group.title}>
                    <p className="font-ui text-[12px] font-medium text-ink">{group.title}</p>
                    <ul className="mt-1 space-y-1 font-ui text-[12px] text-ink-soft">
                      {group.lines.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="text-bordo">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <p className="font-ui text-[12px] font-medium text-ink">Dillər</p>
                  <p
                    className={`mt-1 font-ui text-[12px] ${
                      placementSummary.languagesOk ? "text-ink-soft" : "text-amber-700"
                    }`}
                  >
                    {placementSummary.languages}
                  </p>
                </div>
                <p className="bg-cream/60 px-3 py-2 font-ui text-[11px] leading-relaxed text-muted">
                  Ana səhifə bölməsi üçün{" "}
                  <Link href="/admin/homepage-builder" className="text-bordo underline">
                    Ana Səhifə İdarəsi
                  </Link>
                  -ndə əl ilə seçim edilmiş bölmədə avtomatik siyahı əvəzinə o seçim göstərilir.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Dərc">
            <div className="space-y-5">
              {/* Tək seçim: dərhal və ya planlaşdırılmış. Tarix sahələri bir-birini təkrarlamır. */}
              <fieldset className="space-y-2">
                <legend className="mb-2 font-ui text-[11px] uppercase tracking-[0.14em] text-muted">
                  Dərc vaxtı
                </legend>
                {(
                  [
                    {
                      mode: "now",
                      title: isLive ? "Saytda (dərc olunub)" : "Dərhal",
                      text: isLive
                        ? `Dərc tarixi: ${formatLocalDate(draft.publishedAt)}`
                        : "«Dərc et» basanda məqalə dərhal saytda görünür.",
                    },
                    {
                      mode: "schedule",
                      title: "Planlaşdır",
                      text: "Seçdiyiniz tarix və saatda məqalə avtomatik saytda görünür.",
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.mode}
                    className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                      publishMode === option.mode ? "border-bordo bg-bordo/5" : "border-line hover:border-ink/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="publish-mode"
                      checked={publishMode === option.mode}
                      onChange={() => setPublishMode(option.mode)}
                      className="mt-1 h-4 w-4 accent-[#7b2233]"
                    />
                    <span>
                      <span className="block font-ui text-[13px] text-ink">{option.title}</span>
                      <span className="block font-ui text-[11px] text-muted">{option.text}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {publishMode === "schedule" && (
                <Field label="Tarix və saat" hint="Bakı vaxtı ilə. Vaxt çatanda məqalə 1 dəqiqə ərzində saytda görünür.">
                  <input
                    type="datetime-local"
                    value={scheduleLocal}
                    min={toLocalInput(new Date().toISOString())}
                    onChange={(event) => setScheduleLocal(event.target.value)}
                    className={inputClass}
                  />
                </Field>
              )}

              {isLive && publishMode === "now" && (
                <details className="font-ui text-[12px] text-muted">
                  <summary className="cursor-pointer">Saytda göstərilən dərc tarixini düzəlt</summary>
                  <input
                    type="date"
                    value={draft.publishedAt.slice(0, 10)}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        publishedAt: event.target.value
                          ? new Date(`${event.target.value}T12:00:00`).toISOString()
                          : current.publishedAt,
                      }))
                    }
                    className={`${inputClass} mt-2`}
                  />
                </details>
              )}

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

          {/* Ana səhifə yerləşdirmələri */}
          {article && <ArticleHomepagePlacements articleId={article.id} articleStatus={draft.status} />}

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
                isLive
                  ? "border-gold bg-gold/15 text-ink"
                  : isScheduled
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-line bg-cream-deep text-muted"
              }`}
            >
              {isLive
                ? `Saytda · ${formatLocalDate(draft.publishedAt)}`
                : isScheduled
                ? `Planlaşdırılıb · ${formatLocalDateTime(draft.publishedAt)}`
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 min-w-[200px] font-ui text-[12px] text-muted">
            {publishMode === "schedule"
              ? scheduleLocal
                ? `«Planlaşdır» basanda məqalə ${formatLocalDateTime(scheduleLocal)} tarixində avtomatik saytda görünəcək.`
                : "Sağdakı «Dərc vaxtı» bölməsində tarix və saat seçin."
              : isLive
              ? "«Yenilə» dəyişiklikləri dərhal saytda göstərir."
              : "«Dərc et» məqaləni dərhal saytda göstərir."}
          </p>

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
              {isLive ? "Dərcdən çıxar" : isScheduled ? "Planı ləğv et (qaralama)" : "Qaralama saxla"}
            </Button>
            <Button onClick={() => void handleSave("published")} disabled={busy}>
              {busy
                ? "Saxlanılır…"
                : publishMode === "schedule"
                ? isScheduled
                  ? "Planı yenilə"
                  : "Planlaşdır"
                : isLive
                ? "Yenilə"
                : "Dərc et"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
