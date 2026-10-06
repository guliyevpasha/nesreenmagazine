import type { CategorySlug } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";

/** Beş dildə mətn. Admin paneldə hər dil üçün ayrıca xana var. */
export type LocalizedText = Record<Locale, string>;

/** Beş dildə etiket siyahısı. */
export type LocalizedTags = Record<Locale, string[]>;

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  /** URL-də görünən ünvan — bütün dillərdə eynidir. */
  slug: string;
  category: CategorySlug;
  /** Bölmə daxilindəki alt bölmə (menyudakı açılan siyahı). Boş ola bilər. */
  subcategory?: string;
  status: ArticleStatus;
  /** Ana səhifədə böyük "kapak" məqaləsi kimi göstərilir. */
  featured: boolean;
  /** "Çox oxunanlar" siyahısına düşür. */
  trending: boolean;
  /** Üz qabığı şəkli (Firebase Storage və ya xarici URL). Boşdursa naxışlı örtük çəkilir. */
  coverImage: string;
  coverAlt: LocalizedText;
  /** Şəklin müəllifi / mənbəyi. */
  coverCredit: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** Markdown formatında əsas mətn. */
  body: LocalizedText;
  tags: LocalizedTags;
  author: string;
  /** ISO tarix — məs. "2026-09-04". */
  publishedAt: string;
  updatedAt?: string;
  /** Oxu müddəti (dəqiqə). 0 olarsa mətnə görə hesablanır. */
  readingMinutes: number;
};

/** Firestore-a yazılan, id-siz forma. */
export type ArticleInput = Omit<Article, "id">;

/** E-jurnal — PDF formatında dərc olunan elektron nömrə. */
export type Ejournal = {
  id: string;
  status: ArticleStatus;
  /** Üz qabığı şəkli. Boşdursa naxışlı örtük çəkilir. */
  coverImage: string;
  /** PDF faylın açıq ünvanı (Firebase Storage və ya xarici link). */
  pdfUrl: string;
  /** Nömrənin adı — məs. «Sentyabr 2026». */
  title: LocalizedText;
  /** Nömrədə nə var — bir-iki cümlə. */
  description: LocalizedText;
  /** ISO tarix — məs. "2026-09-01". */
  publishedAt: string;
  /** Səhifə sayı. 0 olarsa göstərilmir. */
  pages: number;
};

export type EjournalInput = Omit<Ejournal, "id">;

export type StaffRole = "admin" | "editor" | "author";

export type StaffMember = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  /** Bu şəxsin yaza biləcəyi bölmələr. Boş siyahı = hamısı. */
  categories: CategorySlug[];
  /** Hər kateqoriya üçün seçilmiş alt kateqoriyalar. */
  subcategories?: Partial<Record<CategorySlug, string[]>>;
  active: boolean;
  createdAt: string;
  invitedBy?: string;
};

/** Reklam üçün ayrılmış banner sahələri. */
export type AdSlotId =
  | "home-leaderboard"
  | "home-mid"
  | "category-top"
  | "article-inline"
  | "sidebar";

export type AdBanner = {
  id: string;
  slot: AdSlotId;
  active: boolean;
  /** Reklam şəkli. */
  image: string;
  /** Kliklədikdə açılan ünvan. */
  href: string;
  alt: string;
  advertiser: string;
  startsAt?: string;
  endsAt?: string;
};

/** Boş dil obyekti yaratmaq üçün köməkçi. */
export function emptyLocalized(): LocalizedText {
  return { az: "", en: "", ru: "", tr: "", ar: "" };
}

export function emptyLocalizedTags(): LocalizedTags {
  return { az: [], en: [], ru: [], tr: [], ar: [] };
}

/**
 * Seçilmiş dildə mətni qaytarır; həmin dil boşdursa Azərbaycan,
 * o da boşdursa ingilis dilinə keçir.
 */
export function pick(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  return text[locale]?.trim() || text.az?.trim() || text.en?.trim() || "";
}

export function pickTags(tags: LocalizedTags | undefined, locale: Locale): string[] {
  if (!tags) return [];
  const list = tags[locale];
  if (list && list.length > 0) return list;
  return tags.az ?? [];
}

/** Markdown mətninə görə təxmini oxu müddəti (dəqiqə). */
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
